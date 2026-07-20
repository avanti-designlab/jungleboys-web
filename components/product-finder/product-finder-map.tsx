'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import type { Map as LeafletMap, Marker } from 'leaflet'
import { BRAND_ASSETS } from '@/lib/site-config'
import { RETAILERS, type Retailer } from '@/lib/product-finder/retailers'

// Product Finder map — 3rd-party stockists (SEPARATE data + component from the
// owned-locations map, per the two-map rule). Gold pulsing JB pins clustered for
// 100+ stores; address/zip search (OpenStreetMap geocoder) auto-suggests for
// accuracy, and "use my location" centers on the visitor. Click a pin → preview.

type Geo = { label: string; lat: number; lng: number }

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

      RETAILERS.forEach((r) => {
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
      map.fitBounds(cluster.getBounds(), { padding: [50, 50] })
      setTimeout(() => map.invalidateSize(), 200)
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
    if (q.length < 3) {
      setSuggests([])
      return
    }
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${new URLSearchParams({ q, format: 'json', countrycodes: 'us', limit: '5', addressdetails: '0' })}`,
          { signal: ctrl.signal, headers: { Accept: 'application/json' } }
        )
        const data: Array<{ display_name: string; lat: string; lon: string }> = await res.json()
        setSuggests(data.map((d) => ({ label: d.display_name, lat: +d.lat, lng: +d.lon })))
      } catch {
        /* aborted or offline */
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
    const list = [...RETAILERS]
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
        {/* search controls */}
        <div className="mb-6 flex flex-col gap-3 px-2 sm:flex-row md:px-4">
          <div className="relative flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your address or ZIP…"
              className="w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4 text-base text-[var(--color-foreground)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/30"
              autoComplete="off"
            />
            {suggests.length > 0 && (
              <ul className="absolute z-[600] mt-2 w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl">
                {suggests.map((s, i) => (
                  <li key={i}>
                    <button
                      onClick={() => locateTo(s.lat, s.lng, s.label)}
                      className="block w-full px-5 py-3 text-left text-sm text-[var(--color-foreground)] transition hover:bg-[var(--color-accent)] hover:text-black"
                    >
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={useMyLocation}
            className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-4 text-sm font-extrabold uppercase tracking-widest text-black transition-transform duration-200 hover:scale-[1.02]"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
              <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm9 3h-2.06A7 7 0 0013 5.06V3h-2v2.06A7 7 0 005.06 11H3v2h2.06A7 7 0 0011 18.94V21h2v-2.06A7 7 0 0018.94 13H21v-2zM12 17a5 5 0 110-10 5 5 0 010 10z" />
            </svg>
            {locating ? 'Locating…' : 'Use my location'}
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          {/* map */}
          <div
            data-nav-theme="dark"
            className="jb-map relative order-2 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b0b0d] md:rounded-[2.5rem] lg:order-1"
          >
            <div ref={mapEl} className="h-[64vh] min-h-[460px] w-full" style={{ background: '#0b0b0d' }} />
          </div>

          {/* nearest list / preview */}
          <div className="order-1 lg:order-2">
            {active && (
              <div className="mb-4 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent-ink)]" style={{ fontFamily: 'var(--font-brand)' }}>
                  {active.state === 'FL' ? 'Florida' : 'California'} stockist
                </p>
                <h3 className="mt-1 font-display text-2xl uppercase leading-none text-[var(--color-foreground)]">{active.name}</h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{active.address}</p>
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
            {nearest.length > 0 ? (
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2">
                <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
                  Nearest stores
                </p>
                <ul className="max-h-[46vh] overflow-y-auto">
                  {nearest.map((r) => (
                    <li key={r.name + r.address}>
                      <button
                        onClick={() => {
                          setActive(r)
                          mapObj.current?.flyTo([r.lat, r.lng], 13, { duration: 0.6 })
                        }}
                        className={`block w-full rounded-xl px-3 py-3 text-left transition hover:bg-[var(--color-background)] ${active?.name === r.name && active?.address === r.address ? 'bg-[var(--color-background)]' : ''}`}
                      >
                        <span className="block text-sm font-bold text-[var(--color-foreground)]">{r.name}</span>
                        <span className="block text-xs text-[var(--color-muted)]">{r.address}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-[var(--color-muted)]">
                Search your address or use your location to find the closest stores.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
