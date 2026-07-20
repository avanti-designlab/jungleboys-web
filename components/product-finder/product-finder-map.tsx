'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import type { Map as LeafletMap, Marker } from 'leaflet'
import { BRAND_ASSETS } from '@/lib/site-config'
import { RETAILERS, type Retailer } from '@/lib/product-finder/retailers'

// California only on the finder map (FL has its own site/team)
const STORES = RETAILERS.filter((r) => r.state !== 'FL')

const CITIES = [
  'Los Angeles',
  'San Diego',
  'Oakland',
  'San Francisco',
  'Sacramento',
  'San Jose',
  'Fresno',
  'Long Beach',
  'Santa Ana',
  'Palm Springs',
  'Riverside',
  'Santa Rosa',
]

// Product Finder map — 3rd-party stockists (SEPARATE data + component from the
// owned-locations map, per the two-map rule). Gold pulsing JB pins clustered for
// 100+ stores; address/zip search (OpenStreetMap geocoder) auto-suggests for
// accuracy, and "use my location" centers on the visitor. Click a pin → preview.

type Geo = { label: string; lat: number; lng: number; store?: Retailer }

function haversine(a: [number, number], b: [number, number]) {
  const R = 3958.8
  const dLat = ((b[0] - a[0]) * Math.PI) / 180
  const dLng = ((b[1] - a[1]) * Math.PI) / 180
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

function dirUrl(r: Retailer) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(r.address)}`
}

export default function ProductFinderMap() {
  const mapEl = useRef<HTMLDivElement>(null)
  const mapObj = useRef<LeafletMap | null>(null)
  const markers = useRef<Record<string, Marker>>({})
  const meMarker = useRef<Marker | null>(null)
  const [active, setActive] = useState<Retailer | null>(null)
  const [query, setQuery] = useState('')
  const [suggests, setSuggests] = useState<Geo[]>([])
  const [nearest, setNearest] = useState<Retailer[]>([])
  const [locating, setLocating] = useState(false)
  const [count, setCount] = useState(0)

  // count the store total up on mount (rAF for the smooth count; a timeout
  // failsafe guarantees the final number even where rAF is throttled)
  useEffect(() => {
    const target = STORES.length
    const start = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1100)
      setCount(Math.round((1 - (1 - p) ** 3) * target))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const fs = setTimeout(() => setCount(target), 1300)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(fs)
    }
  }, [])

  // build map + clustered pins
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const L = (await import('leaflet')).default
      await import('leaflet.markercluster')
      if (cancelled || !mapEl.current || mapObj.current) return

      const map = L.map(mapEl.current, { scrollWheelZoom: false, zoomControl: true })
      mapObj.current = map
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap &copy; CARTO',
      }).addTo(map)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cluster = (L as any).markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 46,
        iconCreateFunction: (c: { getChildCount: () => number }) =>
          L.divIcon({
            html: `<div class="jb-cluster">${c.getChildCount()}</div>`,
            className: '',
            iconSize: [42, 42],
          }),
      })

      STORES.forEach((r) => {
        const icon = L.divIcon({
          className: '',
          html: `<div class="jb-pin jb-pin--sm"><span class="jb-pin-pulse"></span><span class="jb-pin-badge"><img src="${BRAND_ASSETS.logoBlack}" alt="" /></span></div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        })
        const m = L.marker([r.lat, r.lng], { icon })
        m.on('click', () => {
          setActive(r)
          map.flyTo([r.lat, r.lng], Math.max(map.getZoom(), 12), { duration: 0.6 })
        })
        markers.current[r.name + r.address] = m
        cluster.addLayer(m)
      })
      map.addLayer(cluster)
      // size the map before fitting, else the fit computes against a 0-height
      // box and never leaves the default world zoom. Re-fit once laid out.
      const fit = () => {
        map.invalidateSize()
        const b = cluster.getBounds()
        if (b.isValid()) map.fitBounds(b, { padding: [40, 40], maxZoom: 11 })
      }
      fit()
      setTimeout(fit, 300)
    })()
    return () => {
      cancelled = true
      mapObj.current?.remove()
      mapObj.current = null
    }
  }, [])

  // address/zip autocomplete (debounced) via OpenStreetMap
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setSuggests([])
      return
    }
    // instant local matches: store name or address contains the query
    const ql = q.toLowerCase()
    const local: Geo[] = STORES.filter((s) => s.name.toLowerCase().includes(ql) || s.address.toLowerCase().includes(ql))
      .slice(0, 4)
      .map((s) => ({ label: `${s.name} · ${s.address}`, lat: s.lat, lng: s.lng, store: s }))
    setSuggests(local)

    // + address/place suggestions from the geocoder (debounced)
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${new URLSearchParams({ q, format: 'json', countrycodes: 'us', limit: '5', addressdetails: '0' })}`,
          { signal: ctrl.signal, headers: { Accept: 'application/json' } }
        )
        const data: Array<{ display_name: string; lat: string; lon: string }> = await res.json()
        const places: Geo[] = data.map((d) => ({ label: d.display_name, lat: +d.lat, lng: +d.lon }))
        setSuggests([...local, ...places])
      } catch {
        /* aborted or offline — local matches still show */
      }
    }, 300)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
  }, [query])

  const locateTo = useCallback((lat: number, lng: number, label?: string) => {
    setSuggests([])
    if (label !== undefined) setQuery(label)
    const map = mapObj.current
    if (map) map.flyTo([lat, lng], 11, { duration: 0.8 })
    // nearest 6 stores
    const list = [...STORES]
      .map((r) => ({ r, d: haversine([lat, lng], [r.lat, r.lng]) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 6)
      .map((x) => x.r)
    setNearest(list)
    setActive(list[0] ?? null)
    // drop a "you" marker
    ;(async () => {
      const L = (await import('leaflet')).default
      if (!map) return
      if (meMarker.current) meMarker.current.remove()
      meMarker.current = L.marker([lat, lng], {
        icon: L.divIcon({ className: '', html: '<div class="jb-me"></div>', iconSize: [20, 20], iconAnchor: [10, 10] }),
      }).addTo(map)
    })()
  }, [])

  function useMyLocation() {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        locateTo(pos.coords.latitude, pos.coords.longitude, 'My current location')
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <section className="px-2 pb-16 md:px-3">
      <div className="mx-auto max-w-[1500px]">
        {/* bold stat + California-cities marquee band */}
        <div className="mb-6 overflow-hidden rounded-[1.5rem] bg-[#0b0b0d] md:rounded-[2rem]" data-nav-theme="dark">
          <div className="flex flex-col items-center gap-3 px-6 py-6 sm:flex-row sm:justify-between md:px-10 md:py-7">
            <div className="flex items-center gap-4">
              <span className="font-display text-7xl leading-[0.8] text-[var(--color-accent)] md:text-8xl">{count}</span>
              <span className="font-display text-2xl uppercase leading-[0.95] text-white md:text-3xl">
                Stockists
                <br />
                Across California
              </span>
            </div>
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60" style={{ fontFamily: 'var(--font-brand)' }}>
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--color-accent)]" />
              Live stock map
            </span>
          </div>
          <div className="relative flex overflow-hidden border-t border-white/10 py-3">
            <div className="marquee-track flex shrink-0 items-center gap-8 whitespace-nowrap pr-8">
              {[...CITIES, ...CITIES].map((c, i) => (
                <span key={i} className="flex items-center gap-8 font-display text-2xl uppercase text-white/25 md:text-3xl">
                  {c}
                  <span className="text-[var(--color-accent)]">◆</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* bold search controls */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-6 top-1/2 h-6 w-6 -translate-y-1/2 text-[var(--color-muted)]" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your address or ZIP…"
              className="w-full rounded-full border-2 border-[var(--color-border)] bg-[var(--color-surface)] py-5 pl-16 pr-6 text-lg font-medium text-[var(--color-foreground)] shadow-lg outline-none transition focus:border-[var(--color-accent)] focus:shadow-[0_0_0_4px_rgba(254,207,14,0.2)]"
              autoComplete="off"
            />
            {suggests.length > 0 && (
              <ul className="absolute z-[600] mt-2 w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl">
                {suggests.map((s, i) => (
                  <li key={i}>
                    <button
                      onClick={() => {
                        if (s.store) {
                          setActive(s.store)
                          locateTo(s.lat, s.lng, s.store.name)
                        } else {
                          locateTo(s.lat, s.lng, s.label)
                        }
                      }}
                      className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm text-[var(--color-foreground)] transition hover:bg-[var(--color-accent)] hover:text-black"
                    >
                      {s.store && (
                        <span className="shrink-0 rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-black" style={{ fontFamily: 'var(--font-brand)' }}>
                          Store
                        </span>
                      )}
                      <span className="line-clamp-1">{s.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={useMyLocation}
            className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-8 py-5 text-sm font-extrabold uppercase tracking-widest text-black shadow-[0_12px_40px_-10px_rgba(254,207,14,0.7)] transition-transform duration-200 hover:scale-[1.03]"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
              <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm9 3h-2.06A7 7 0 0013 5.06V3h-2v2.06A7 7 0 005.06 11H3v2h2.06A7 7 0 0011 18.94V21h2v-2.06A7 7 0 0018.94 13H21v-2zM12 17a5 5 0 110-10 5 5 0 010 10z" />
            </svg>
            {locating ? 'Locating…' : 'Use my location'}
          </button>
        </div>

        {/* full-width map with a floating results panel */}
        <div
          data-nav-theme="dark"
          className="jb-map relative overflow-hidden rounded-[1.75rem] border-2 border-[var(--color-accent)]/20 bg-[#0b0b0d] shadow-[0_40px_120px_-30px_rgba(254,207,14,0.3)] md:rounded-[2.5rem]"
        >
          <div ref={mapEl} className="h-[68vh] min-h-[480px] w-full" style={{ background: '#0b0b0d' }} />

          {/* bold idle-state CTA (clears once a store is picked or a search runs) */}
          {nearest.length === 0 && !active && (
            <div className="pointer-events-none absolute inset-0 z-[400] flex items-end justify-center pb-10 md:items-center md:pb-0">
              <div className="rounded-2xl border border-white/10 bg-black/55 px-7 py-5 text-center backdrop-blur-sm">
                <p className="font-display text-3xl uppercase leading-none text-white md:text-5xl">Find your closest drop</p>
                <p className="mt-2 text-xs uppercase tracking-widest text-white/70" style={{ fontFamily: 'var(--font-brand)' }}>
                  Search your area or use your location
                </p>
              </div>
            </div>
          )}

          {(active || nearest.length > 0) && (
            <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[500] md:inset-y-4 md:left-auto md:right-4 md:w-[360px]">
              <div className="pointer-events-auto flex max-h-[60vh] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111114]/95 shadow-2xl backdrop-blur-md">
                {active && (
                  <div className="border-b border-white/10 p-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-brand)' }}>
                      Closest stockist
                    </p>
                    <h3 className="mt-1 font-display text-2xl uppercase leading-none text-white">{active.name}</h3>
                    <p className="mt-2 text-sm text-white/60">{active.address}</p>
                    <a
                      href={dirUrl(active)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-xs font-extrabold uppercase tracking-widest text-black transition-transform hover:scale-[1.03]"
                      style={{ fontFamily: 'var(--font-brand)' }}
                    >
                      Directions →
                    </a>
                  </div>
                )}
                {nearest.length > 0 && (
                  <p className="px-4 pb-1 pt-3 text-[10px] font-bold uppercase tracking-widest text-white/45" style={{ fontFamily: 'var(--font-brand)' }}>
                    Nearest stores
                  </p>
                )}
                <ul className="overflow-y-auto p-2 pt-1">
                  {nearest.map((r) => (
                    <li key={r.name + r.address}>
                      <button
                        onClick={() => {
                          setActive(r)
                          mapObj.current?.flyTo([r.lat, r.lng], 13, { duration: 0.6 })
                        }}
                        className={`block w-full rounded-xl px-3 py-2.5 text-left transition hover:bg-white/5 ${active?.name === r.name && active?.address === r.address ? 'bg-white/5' : ''}`}
                      >
                        <span className="block text-sm font-bold text-white">{r.name}</span>
                        <span className="block text-xs text-white/50">{r.address}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
