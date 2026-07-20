'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import type { Map as LeafletMap } from 'leaflet'
import { CA_STORES, type Store } from '@/lib/locations'

// Full-width dark charcoal locations map. Gold pulsating JB pins (CARTO dark
// basemap tiles, loaded as CSP-allowed https images — no external scripts).
// Click a pin → a preview card with the store image + Shop Now → its menu page.
// Leaflet is imported dynamically (needs window); reduced-motion stills the pulse.

export default function LocationsMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapObj = useRef<LeafletMap | null>(null)
  const [active, setActive] = useState<Store>(CA_STORES[0])
  const activeSlug = active.slug

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const L = (await import('leaflet')).default
      if (cancelled || !mapRef.current || mapObj.current) return

      const map = L.map(mapRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true,
      })
      mapObj.current = map

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap &copy; CARTO',
      }).addTo(map)

      const markers = CA_STORES.map((store) => {
        const icon = L.divIcon({
          className: '',
          html: `<div class="jb-pin" data-slug="${store.slug}"><span class="jb-pin-pulse"></span><span class="jb-pin-mark"></span></div>`,
          iconSize: [46, 46],
          iconAnchor: [23, 23],
        })
        const marker = L.marker([store.lat, store.lng], { icon }).addTo(map)
        marker.on('click', () => setActive(store))
        return marker
      })

      const bounds = L.latLngBounds(CA_STORES.map((s) => [s.lat, s.lng]))
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 10 })
      // nudge Leaflet to recompute size once laid out
      setTimeout(() => map.invalidateSize(), 200)
      void markers
    })()

    return () => {
      cancelled = true
      mapObj.current?.remove()
      mapObj.current = null
    }
  }, [])

  // reflect the active pin visually
  useEffect(() => {
    document.querySelectorAll('.jb-pin').forEach((el) => {
      el.classList.toggle('is-active', (el as HTMLElement).dataset.slug === activeSlug)
    })
  }, [activeSlug])

  function focusStore(store: Store) {
    setActive(store)
    mapObj.current?.flyTo([store.lat, store.lng], 12, { duration: 0.8 })
  }

  return (
    <section className="px-2 pb-16 md:px-3">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 px-2 md:px-4">
          <div>
            <h2 className="font-display text-5xl uppercase leading-[0.9] text-[var(--color-foreground)] md:text-7xl">
              Visit the Jungle
            </h2>
            <p className="mt-2 text-sm uppercase tracking-wide text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
              Four California stores. Tap a pin to shop that menu.
            </p>
          </div>
          {/* store quick-switch chips */}
          <div className="flex flex-wrap gap-2">
            {CA_STORES.map((s) => (
              <button
                key={s.slug}
                onClick={() => focusStore(s)}
                className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-widest transition ${
                  s.slug === activeSlug
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-black'
                    : 'border-[var(--color-border)] text-[var(--color-foreground)] hover:border-[var(--color-accent)]'
                }`}
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div
          data-nav-theme="dark"
          className="jb-map relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b0b0d] md:rounded-[2.5rem]"
        >
          <div ref={mapRef} className="h-[62vh] min-h-[440px] w-full" style={{ background: '#0b0b0d' }} />

          {/* store preview card */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[500] p-4 md:inset-y-0 md:right-0 md:left-auto md:flex md:w-[360px] md:items-center md:p-6">
            <div className="pointer-events-auto overflow-hidden rounded-2xl border border-white/10 bg-[#111114]/95 shadow-2xl backdrop-blur-md">
              <div className="relative h-32 w-full md:h-40">
                <Image src={active.image} alt={active.name} fill sizes="360px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-[#111114]/30 to-transparent" />
                <span className="absolute left-3 top-3 rounded-full bg-[var(--color-accent)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-black" style={{ fontFamily: 'var(--font-brand)' }}>
                  California
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-display text-2xl uppercase leading-none text-white">{active.name}</h3>
                <p className="mt-2 text-sm text-white/70">
                  {active.address}
                  <br />
                  {active.city}, CA {active.zip}
                </p>
                <p className="mt-1 text-xs uppercase tracking-wide text-white/45">{active.hours}</p>
                <div className="mt-4 flex items-center gap-2">
                  <Link
                    href={active.shopUrl}
                    className="flex-1 rounded-full bg-[var(--color-accent)] px-5 py-3 text-center text-sm font-extrabold uppercase tracking-widest text-black transition-transform duration-200 hover:scale-[1.03]"
                    style={{ fontFamily: 'var(--font-brand)' }}
                  >
                    Shop Now →
                  </Link>
                  <a
                    href={`tel:${active.phone.replace(/[^\d+]/g, '')}`}
                    aria-label={`Call ${active.name}`}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                      <path d="M6.6 10.8a15.5 15.5 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 013 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.3 1l-2.1 2.2z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
