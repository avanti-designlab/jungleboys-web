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

  // ONE combined pill (Avanti, 2026-08-03): logo, nav and utilities together,
  // always present — the earlier two-row header condensed by hiding the top
  // bar, and losing it on scroll was the wrong trade. Wider is fine, ruled
  // explicitly. Same pill vocabulary as the global SiteNav's condensed state,
  // and no height changes on scroll — nothing to shift the layout.
  return (
    <header
      className="pointer-events-none sticky top-0 z-40 flex justify-center px-3 py-3"
      style={{ fontFamily: 'var(--font-brand)' }}
    >
      <div className="pointer-events-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-[#0b0b0b]/90 py-1.5 pl-2 pr-1.5 text-white shadow-2xl backdrop-blur-md">
        <Link href="/" aria-label="Jungle Boys home" className="ml-1 block h-9 w-12 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- brand SVG */}
          <img src="/brand/jb-stacked-white.svg" alt="" className="h-full w-full object-contain" />
        </Link>

        <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-white/20" />

        {SURFACES.map((s) => {
          const href = base ? `${base}${s.path}` : '/shop'
          const active = base ? pathname === href : false
          return (
            <Link
              key={s.key}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-extrabold uppercase tracking-[0.14em] transition-colors duration-200 ${
                active
                  ? 'bg-[var(--color-accent)] text-black'
                  : 'text-white/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              {s.label}
            </Link>
          )
        })}
        <Link
          href="/locations"
          className="shrink-0 rounded-full px-3.5 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-white/75 transition-colors duration-200 hover:bg-white/10 hover:text-white"
        >
          Locations
        </Link>

        <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-white/20" />

        {/* open/closed in store-local time — empty until the client knows */}
        {status && (
          <span className="hidden shrink-0 items-center gap-1.5 px-2 text-[11px] font-extrabold uppercase tracking-wider xl:flex">
            <span
              aria-hidden
              className={`h-2 w-2 rounded-full ${status.open ? 'bg-[var(--color-success)]' : 'bg-white/40'}`}
            />
            <span className={status.open ? 'text-[var(--color-success)]' : 'text-white/60'}>{status.label}</span>
          </span>
        )}

        {/* Recreational / Medical — inherited from the Dutchie embed; UI state
            until the GraphQL menuType param is verified (see MENU_TYPE_KEY) */}
        <label className="hidden shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] py-1 pl-3 pr-1.5 lg:flex">
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

        {/* the store you are shopping; the whole chip opens the picker */}
        <button
          type="button"
          onClick={pickStore}
          className="flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-2 text-left transition hover:border-[var(--color-accent)]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" className="h-4 w-4 shrink-0" aria-hidden>
            <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="max-w-32 truncate text-xs font-extrabold uppercase tracking-wider md:max-w-44">
            {store ? store.name : 'Choose a store'}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent)]">
            Change
          </span>
        </button>

        <Link
          href="/login"
          className="hidden shrink-0 rounded-full border border-white/25 px-3.5 py-2 text-xs font-extrabold uppercase tracking-widest transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] sm:block"
        >
          Sign in
        </Link>

        {/* Cart lands with checkout (Dutchie owns it) — designed placeholder,
            not a dead control */}
        <button
          type="button"
          disabled
          title="Cart arrives with checkout"
          aria-label="Shopping cart — coming soon"
          className="relative mr-1 shrink-0 cursor-not-allowed rounded-full border border-white/15 p-2.5 opacity-60"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden>
            <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          </svg>
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-accent)] px-1 text-[9px] font-extrabold text-black">
            0
          </span>
        </button>
      </div>
    </header>
  )
}
