'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import type { Map as LeafletMap } from 'leaflet'
import { BRAND_ASSETS } from '@/lib/site-config'
import type { OwnedStore } from '@/lib/owned-stores'

// Small dark map that fills the empty grid slot for each state — gold JB pins on
// the owned stores. This is the Locations map (owned stores) — SEPARATE data +
// component from the Product Finder stockist map (two-map rule).

export default function StateMiniMap({ stores, label }: { stores: OwnedStore[]; label: string }) {
  const el = useRef<HTMLDivElement>(null)
  const mapObj = useRef<LeafletMap | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const L = (await import('leaflet')).default
      if (cancelled || !el.current || mapObj.current) return
      const map = L.map(el.current, { scrollWheelZoom: false, zoomControl: false, attributionControl: false })
      mapObj.current = map
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 19 }).addTo(map)
      stores.forEach((s) => {
        L.marker([s.lat, s.lng], {
          icon: L.divIcon({
            className: '',
            html: `<div class="jb-pin jb-pin--sm"><span class="jb-pin-pulse"></span><span class="jb-pin-badge"><img src="${BRAND_ASSETS.logoBlack}" alt="" /></span></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          }),
        }).addTo(map)
      })
      const bounds = L.latLngBounds(stores.map((s) => [s.lat, s.lng]))
      const fit = () => {
        map.invalidateSize()
        if (bounds.isValid()) map.fitBounds(bounds, { padding: [28, 28], maxZoom: 9 })
      }
      fit()
      setTimeout(fit, 300)
    })()
    return () => {
      cancelled = true
      mapObj.current?.remove()
      mapObj.current = null
    }
  }, [stores])

  return (
    <div
      data-nav-theme="dark"
      className="jb-map relative h-full min-h-[280px] overflow-hidden rounded-[1.6rem] border border-[var(--color-border)] bg-[#0b0b0d]"
    >
      <div ref={el} className="h-full w-full" style={{ background: '#0b0b0d' }} />
      <div
        className="pointer-events-none absolute left-4 top-4 z-[500] flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-sm"
        style={{ fontFamily: 'var(--font-brand)' }}
      >
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--color-accent)]" />
        {label}
      </div>
    </div>
  )
}
