'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CA_OWNED } from '@/lib/owned-stores'
import { readStore } from '@/lib/store-selection'

// The ecom shell's own sticky header (Avanti, 2026-08-03): the shop pages live
// together as their own store, so they carry their own chrome — location chip
// with a Change action, Sign In, cart, and the store surfaces as the nav row.
// The global SiteNav stands down on /menu and /shop; the JB logo here is the
// way back to the main site.
//
// Store resolution order matters: the URL wins (you are LOOKING at that
// store's page), then the saved choice. URL resolution happens during render —
// including prerender — so store-scoped nav links are in the crawlable HTML on
// every store page; only the saved-store fallback waits for the client.
//
// Strains joins the nav row when that surface is built — a dead link is not a
// nav item.

const SURFACES = [
  { key: 'menu', label: 'Menu', path: '' },
  { key: 'deals', label: 'Deals', path: '/deals' },
  { key: 'drops', label: 'Drops', path: '/drops' },
  { key: 'brands', label: 'Brands', path: '/brands' },
] as const

function storeFromPath(pathname: string): string | null {
  const m = pathname.match(/^\/menu\/california\/([^/]+)/)
  return m ? m[1] : null
}

/** "21:45" → "9:45PM" */
const clock = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}${m ? `:${String(m).padStart(2, '0')}` : ''}${h >= 12 ? 'PM' : 'AM'}`
}

/**
 * Open/closed for the chosen store, computed in STORE-LOCAL time (CA stores →
 * America/Los_Angeles) on the client. Client-only on purpose: a prerendered
 * "OPEN" is wrong for half of every day, so the chip renders nothing until
 * the browser has computed a truthful answer. Inherited from the Dutchie
 * embed header (Avanti, 2026-08-03).
 */
function openStatus(store: (typeof CA_OWNED)[number], now: Date): { open: boolean; label: string } | null {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(now)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const weekday = get('weekday')
  const minutes = Number(get('hour')) * 60 + Number(get('minute'))
  const spec = store.hoursSpec.find((h) => h.days.includes(weekday))
  if (!spec) return null
  const toMin = (t: string) => Number(t.split(':')[0]) * 60 + Number(t.split(':')[1])
  const open = minutes >= toMin(spec.opens) && minutes < toMin(spec.closes)
  return open
    ? { open: true, label: `Open · until ${clock(spec.closes)}` }
    : { open: false, label: `Closed · opens ${clock(spec.opens)}` }
}

// Recreational / Medical — inherited from the Dutchie embed's MENU dropdown.
// UI STATE ONLY for now: the frozen provider interface has no menuType param,
// so both views serve the same placeholder menu until the GraphQL provider
// lands and the (additive) param is verified against a real payload. The
// choice persists so that wiring is a data change, not a UX change.
const MENU_TYPE_KEY = 'jb-menu-type'

export default function CommerceHeader() {
  const pathname = usePathname() ?? ''
  const urlStore = storeFromPath(pathname)

  // Saved store only fills in when the URL carries none (e.g. on /shop/<pdp>).
  // Effect, not initial state: localStorage must not disagree with server HTML.
  const [savedStore, setSavedStore] = useState<string | null>(null)
  useEffect(() => {
    const s = readStore()
    if (s?.state === 'CA') setSavedStore(s.slug)
  }, [pathname])

  const storeSlug = urlStore ?? savedStore
  const store = storeSlug ? CA_OWNED.find((s) => s.slug === storeSlug) : undefined
  const base = store ? `/menu/california/${store.slug}` : null

  // truthful only after mount — see openStatus()
  const [status, setStatus] = useState<{ open: boolean; label: string } | null>(null)
  useEffect(() => {
    if (!store) return setStatus(null)
    const tick = () => setStatus(openStatus(store, new Date()))
    tick()
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [store])

  const [menuType, setMenuType] = useState<'recreational' | 'medical'>('recreational')
  useEffect(() => {
    try {
      const saved = localStorage.getItem(MENU_TYPE_KEY)
      if (saved === 'medical') setMenuType('medical')
    } catch {}
  }, [])
  const chooseMenuType = (v: 'recreational' | 'medical') => {
    setMenuType(v)
    try {
      localStorage.setItem(MENU_TYPE_KEY, v)
    } catch {}
  }

  const pickStore = () => window.dispatchEvent(new CustomEvent('jb:pick-store'))

  // Condense on scroll, same trigger and rhythm as the global SiteNav pill —
  // one design language across the whole site (Avanti, 2026-08-03): the black
  // utility bar folds away and the nav pill shrinks, keeping the essentials.
  const [condensed, setCondensed] = useState(false)
  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 350)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    // pointer-events-none on the frame, auto on the rows: the header keeps a
    // CONSTANT height so condensing never shifts the page (a max-h collapse
    // here is a scroll-driven CLS hit on the highest-traffic pages) — the
    // utility bar fades out and the pill glides up into its slot instead.
    <header className="pointer-events-none sticky top-0 z-40" style={{ fontFamily: 'var(--font-brand)' }}>
      {/* row 1 — brand black utilities; fades away once condensed */}
      <div
        inert={condensed ? true : undefined}
        className={`bg-[#0b0b0b] text-white transition-all duration-500 ${
          condensed ? 'pointer-events-none -translate-y-2 opacity-0' : 'pointer-events-auto opacity-100'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 md:px-6">
          <Link href="/" aria-label="Jungle Boys home" className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element -- brand SVG */}
            <img src="/brand/jb-stacked-white.svg" alt="" className="h-9 w-auto" />
          </Link>

          <div className="ml-auto flex items-center gap-2 md:gap-3">
            {/* open/closed in store-local time — empty until the client knows */}
            {status && (
              <span className="hidden items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider lg:flex">
                <span
                  aria-hidden
                  className={`h-2 w-2 rounded-full ${status.open ? 'bg-[var(--color-success)]' : 'bg-white/40'}`}
                />
                <span className={status.open ? 'text-[var(--color-success)]' : 'text-white/60'}>
                  {status.label}
                </span>
              </span>
            )}

            {/* Recreational / Medical — inherited from the Dutchie embed. See
                the MENU_TYPE_KEY note: UI state until the GraphQL menuType
                param is verified. */}
            <label className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] py-1.5 pl-4 pr-2 md:flex">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Menu</span>
              <select
                value={menuType}
                onChange={(e) => chooseMenuType(e.target.value as 'recreational' | 'medical')}
                className="cursor-pointer bg-transparent py-1 text-xs font-extrabold uppercase tracking-wider text-white outline-none [&>option]:text-black"
              >
                <option value="recreational">Recreational</option>
                <option value="medical">Medical</option>
              </select>
            </label>

            {/* location — the chip states where you are shopping; Change opens
                the picker (the same event every "change location" control uses) */}
            <button
              type="button"
              onClick={pickStore}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-2 text-left transition hover:border-[var(--color-accent)] md:px-4"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" className="h-4 w-4 shrink-0" aria-hidden>
                <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="min-w-0">
                <span className="block max-w-36 truncate text-xs font-extrabold uppercase tracking-wider md:max-w-none">
                  {store ? store.name : 'Choose a store'}
                </span>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent)]">
                  Change
                </span>
              </span>
            </button>

            <Link
              href="/login"
              className="hidden rounded-full border border-white/25 px-4 py-2.5 text-xs font-extrabold uppercase tracking-widest transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] sm:block"
            >
              Sign in
            </Link>

            {/* Cart lands with checkout (Dutchie owns it). A designed
                placeholder beats a dead control that navigates nowhere. */}
            <button
              type="button"
              disabled
              title="Cart arrives with checkout"
              aria-label="Shopping cart — coming soon"
              className="relative cursor-not-allowed rounded-full border border-white/15 p-2.5 opacity-60"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
                <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>
              <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[var(--color-accent)] px-1 text-[10px] font-extrabold text-black">
                0
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* row 2 — the store nav as a FLOATING PILL, the same device as the
          global nav's condensed state, so the two headers read as one system.
          Expanded it rides under the utility bar; condensed it shrinks and
          absorbs the essentials (logo, store pin, cart). */}
      <nav aria-label="Store sections" className="flex justify-center px-3 py-3">
        <div
          className={`pointer-events-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-[#0b0b0b]/90 text-white shadow-2xl backdrop-blur-md transition-all duration-500 ${
            condensed ? '-translate-y-16 px-2 py-1.5' : 'translate-y-0 px-2.5 py-2'
          }`}
        >
          {condensed && (
            <>
              <Link href="/" aria-label="Jungle Boys home" className="ml-1 block h-8 w-11 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element -- brand SVG */}
                <img src="/brand/jb-stacked-white.svg" alt="" className="h-full w-full object-contain" />
              </Link>
              <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-white/20" />
            </>
          )}

          {SURFACES.map((s) => {
            const href = base ? `${base}${s.path}` : '/shop'
            const active = base ? pathname === href : false
            return (
              <Link
                key={s.key}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`shrink-0 rounded-full text-xs font-extrabold uppercase tracking-[0.14em] transition-colors duration-200 ${
                  condensed ? 'px-3.5 py-2' : 'px-4 py-2.5'
                } ${
                  active
                    ? 'bg-[var(--color-accent)] text-black'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                {s.label}
              </Link>
            )
          })}

          <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-white/20" />
          <Link
            href="/locations"
            className={`shrink-0 rounded-full text-xs font-extrabold uppercase tracking-[0.14em] text-white/75 transition-colors duration-200 hover:bg-white/10 hover:text-white ${
              condensed ? 'px-3.5 py-2' : 'px-4 py-2.5'
            }`}
          >
            Locations
          </Link>

          {condensed && (
            <>
              <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-white/20" />
              <button
                type="button"
                onClick={pickStore}
                aria-label={store ? `Change store — currently ${store.name}` : 'Choose a store'}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/25 transition hover:border-[var(--color-accent)]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" className="h-4 w-4" aria-hidden>
                  <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                disabled
                title="Cart arrives with checkout"
                aria-label="Shopping cart — coming soon"
                className="relative mr-1 cursor-not-allowed rounded-full border border-white/15 p-2 opacity-60"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden>
                  <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
                  <path d="M9 8V6a3 3 0 0 1 6 0v2" />
                </svg>
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-accent)] px-1 text-[9px] font-extrabold text-black">
                  0
                </span>
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
