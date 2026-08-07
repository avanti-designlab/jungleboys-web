'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CA_OWNED } from '@/lib/owned-stores'
import { readStore } from '@/lib/store-selection'
import { CART_EVENT, cartSubtotal, readCart, removeFromCart, setCartQty, type CartItem } from '@/lib/cart'
import { CATEGORY_ICONS } from '@/lib/category-icons'
import { categoryLabel } from '@/components/menu/labels'
import CartIcon from './cart-icon'
import MainMenuOverlay from '@/components/main-menu-overlay'

// The ecom shell's own sticky header (Avanti, 2026-08-03): the shop pages live
// together as their own store, so they carry their own chrome — location chip
// with a Change action, Sign In, cart, and the store surfaces as the nav row.
// The global SiteNav stands down on /menu and /shop; the JB logo here is the
// way back to the main site.
//
// Voice is BEBAS site-wide in this shell (Avanti, 2026-08-03): the whole pill
// and every panel run on --font-display. Bebas is condensed, so sizes run
// larger and tracking far tighter than the Lemon Milk values they replace.
//
// Store resolution order matters: the URL wins (you are LOOKING at that
// store's page), then the saved choice. URL resolution happens during render —
// including prerender — so store-scoped nav links are in the crawlable HTML on
// every store page; only the saved-store fallback waits for the client.
//
// Strains joins the nav row when that surface is built — a dead link is not a
// nav item.

const SURFACES = [
  { key: 'deals', label: 'Deals', path: '/deals' },
  { key: 'drops', label: 'Drops', path: '/drops' },
  { key: 'brands', label: 'Brands', path: '/brands' },
] as const

// SHOP dropdown — Avanti's fixed category set (2026-08-03), matching the
// storefront tile row; each lands on the filtered list. A category the store
// does not stock lands on the grid's honest empty state rather than 404ing.
// Pops left the set — the 5G Pops line lives in the PRODUCTS dropdown.
const SHOP_CATEGORIES = [
  'flower', 'pre-rolls', 'vape-pens', 'concentrates', 'edibles', 'cbd', 'accessories', 'apparel',
] as const

// PRODUCTS dropdown — the JB lines by SUBCATEGORY, each landing on the
// filtered product LIST via ?line= (explicitly NOT the Phase 2 landing pages;
// those stay the curated /products/* collection). Slugs must match the
// catalogue's subcategory values — check-commerce counts these options and a
// drifted slug shows up as a loudly-empty list.
// Gas Tanks is ONE item (Avanti, 2026-08-03): a comma list of the three
// sibling subcategories, which the browse grid's ?line= filter unions.
// Icons: 1G + 10-Pack carry their own supplied marks (2026-08-04 batch);
// Twins keeps the crossed-pair art BY AVANTI'S RULING ('keep twins as is');
// Gas Tanks carries the supplied Gas Tank.svg.
// `line` is the COLLECTION slug — each entry is its own shopping page at
// <store>/shop/<line> (Avanti, 2026-08-04); lib/collections owns the mapping
// to subcategories (gas-tanks unions its three siblings there).
const JB_LINES: readonly { label: string; line: string; icon: string | null }[] = [
  { label: 'Premium Flower', line: 'premium-flower', icon: '/shop/icons/flower.webp' },
  { label: 'Hash Holes', line: 'hash-holes', icon: '/shop/icons/hash-hole.webp' },
  { label: '5G Pops', line: '5g-pops', icon: '/shop/icons/pops.svg' },
  { label: '10-Pack Pre-Rolls', line: '10-pack-pre-rolls', icon: '/shop/icons/pre-rolls-10pk.webp' },
  { label: '1G Pre-Rolls', line: '1g-pre-rolls', icon: '/shop/icons/pre-roll-1g.svg' },
  { label: 'Twins 2-Pack', line: 'twins-2-pack', icon: '/shop/icons/pre-rolls.svg' },
  { label: 'Gas Tanks', line: 'gas-tanks', icon: '/shop/icons/gas-tank.svg' },
]

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

// Shared hover treatment for dropdown rows: quiet ground, label nudges right,
// gold arrow fades in from the left of its slot.
function RowArrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-accent)"
      strokeWidth="2.5"
      className="h-4 w-4 shrink-0 -translate-x-1 opacity-0 transition-all duration-200 group-hover/row:translate-x-0 group-hover/row:opacity-100"
      aria-hidden
    >
      <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function CommerceHeader() {
  const pathname = usePathname() ?? ''
  // The inverting left cluster (hamburger + logo) lives OUTSIDE the header
  // element: a sticky container always isolates blending (SiteNav learned
  // this first), so the difference layer is its own zero-height sticky
  // sibling. Placement/sizes mirror the global SiteNav's left cluster —
  // Avanti 2026-08-04: one universal top-left across the whole site.
  const [mainOpen, setMainOpen] = useState(false)
  useEffect(() => setMainOpen(false), [pathname])
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

  // The bag. Count + contents load in an effect (localStorage must not
  // disagree with server HTML) and follow every jb:cart-changed — including
  // from other tabs via the storage event.
  const [cart, setCart] = useState<CartItem[]>([])
  useEffect(() => {
    const sync = () => setCart(readCart())
    sync()
    window.addEventListener(CART_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(CART_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])
  const count = cart.reduce((n, i) => n + i.qty, 0)

  // SHOP / PRODUCTS disclosure menus. Panels live OUTSIDE the pill's
  // horizontal-scroll container (it would clip them) and stay in the DOM when
  // closed (hidden attr) so the options are crawlable and checkable.
  const [openMenu, setOpenMenu] = useState<null | 'shop' | 'products' | 'cart'>(null)
  useEffect(() => setOpenMenu(null), [pathname])
  useEffect(() => {
    if (!openMenu) return
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpenMenu(null)
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [openMenu])

  // ONE PILL again (Avanti, 2026-08-04 final form — "make the sticky header
  // all one again"): nav + utilities together in a single pill, with the JB
  // logo BARE beside it — no chip, transparent, mix-blend-difference so the
  // white mark inverts over whatever scrolls beneath it (the global SiteNav's
  // established trick). Keeps the v3 gains: SHOP → storefront, CATEGORIES
  // rename, Locations removed, 19px nav type, 48px cart.
  return (
    <>
      {/* the shared full-screen menu — same overlay as the main site */}
      <MainMenuOverlay open={mainOpen} onClose={() => setMainOpen(false)} />

      {/* left cluster layer — hamburger + logo at the global SiteNav's sizes
          and placement, difference-blended so both invert over any ground.
          Its own sticky element: a sticky container isolates child blending. */}
      <div className="pointer-events-none sticky top-0 z-50 h-0 mix-blend-difference">
        <div className="absolute left-4 top-4 flex items-center gap-4 text-white sm:left-8 md:left-12">
          <button
            aria-expanded={mainOpen}
            aria-label={mainOpen ? 'Close menu' : 'Open menu'}
            data-menu-toggle
            onClick={() => setMainOpen((o) => !o)}
            className="pointer-events-auto flex cursor-pointer flex-col items-start gap-[7px] p-2"
          >
            <span className={`block h-[2px] rounded bg-current transition-all duration-300 ${mainOpen ? 'w-8 translate-y-[9px] rotate-45' : 'w-9'}`} />
            <span className={`block h-[2px] rounded bg-current transition-all duration-200 ${mainOpen ? 'w-8 opacity-0' : 'w-6'}`} />
            <span className={`block h-[2px] rounded bg-current transition-all duration-300 ${mainOpen ? 'w-8 -translate-y-[9px] -rotate-45' : 'w-[30px]'}`} />
          </button>
          <Link
            href="/"
            aria-label="Jungle Boys home"
            onClick={() => setMainOpen(false)}
            className="pointer-events-auto block h-12 w-16 transition-transform duration-200 hover:scale-105 sm:h-14 sm:w-20 md:h-16 md:w-24"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- brand SVG */}
            <img src="/brand/jb-stacked-white.svg" alt="" className="h-full w-full object-contain" />
          </Link>
        </div>
      </div>

    <header
      // the pill spans the hamburger/logo cluster's end to the content
      // container's right edge (max-w-[1400px], centered), so its right edge
      // sits flush over the tiles below (Avanti, 2026-08-04: "ends at the end
      // of the tile underneath"). Left clamp = cluster width + breathing room,
      // stepped with the cluster's own responsive sizes.
      className="pointer-events-none sticky top-0 z-40 flex flex-col gap-2 py-3 pl-3 pr-3 md:flex-row md:items-center md:justify-start md:gap-0 md:pl-[max(14.5rem,calc((100vw-1400px)/2))] md:pr-[max(0.75rem,calc((100vw-1400px)/2))]"
      style={{ fontFamily: 'var(--font-display)' }}
    >
      {/* ── MOBILE (Avanti, 2026-08-04: "mobile header is messed up") — the
          desktop pill crushed at phone width, so phones get their own two
          rows: a compact utility pill clear of the hamburger/logo cluster,
          and a full-width swipeable nav strip beneath it. ── */}
      <div className="flex justify-end md:hidden">
        <div className="pointer-events-auto flex items-center gap-0.5 rounded-full border border-white/10 bg-[#0b0b0b]/90 p-1 text-white shadow-2xl backdrop-blur-md">
          <button
            type="button"
            onClick={pickStore}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" className="h-4 w-4 shrink-0" aria-hidden>
              <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="max-w-[7.5rem] truncate text-[14px] uppercase leading-none tracking-[0.05em]">
              {store ? store.name : 'Choose a store'}
            </span>
          </button>
          <Link href="/login" aria-label="Sign in" className="rounded-full p-2 text-white/80">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4.5 w-4.5" aria-hidden>
              <circle cx="12" cy="8" r="3.6" />
              <path d="M5 20a7 7 0 0 1 14 0" strokeLinecap="round" />
            </svg>
          </Link>
          <button
            type="button"
            aria-expanded={openMenu === 'cart'}
            aria-haspopup="dialog"
            aria-label={`Shopping bag, ${count} item${count === 1 ? '' : 's'}`}
            onClick={() => setOpenMenu(openMenu === 'cart' ? null : 'cart')}
            className="rounded-full p-1"
          >
            <CartIcon count={count} />
          </button>
        </div>
      </div>
      {/* nav lives in the mobile tab bar (commerce mode) — no second strip */}
      <div className="pointer-events-auto hidden min-w-0 max-w-full flex-1 items-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-[#0b0b0b]/90 py-1.5 pl-4 pr-3 text-white shadow-2xl backdrop-blur-md md:flex">
        <Link
          href={base ?? '/shop'}
          aria-current={base && pathname === base ? 'page' : undefined}
          className={`shrink-0 rounded-full px-3 py-2.5 text-[19px] uppercase leading-none tracking-[0.05em] transition-colors duration-200 ${
            base && pathname === base
              ? 'bg-[var(--color-accent)] text-black'
              : 'text-white/80 hover:bg-white/10 hover:text-white'
          }`}
        >
          Shop
        </Link>

        {(['shop', 'products'] as const).map((menu) => (
          <button
            key={menu}
            type="button"
            aria-expanded={openMenu === menu}
            aria-haspopup="menu"
            onClick={() => setOpenMenu(openMenu === menu ? null : menu)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2.5 text-[19px] uppercase leading-none tracking-[0.05em] transition-colors duration-200 ${
              openMenu === menu
                ? 'bg-[var(--color-accent)] text-black'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            {menu === 'shop' ? 'Categories' : 'Products'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`h-3.5 w-3.5 transition-transform duration-200 ${openMenu === menu ? 'rotate-180' : ''}`} aria-hidden>
              <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}

        {SURFACES.map((s) => {
          const href = base ? `${base}${s.path}` : '/shop'
          const active = base ? pathname === href : false
          return (
            <Link
              key={s.key}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`shrink-0 rounded-full px-3 py-2.5 text-[19px] uppercase leading-none tracking-[0.05em] transition-colors duration-200 ${
                active
                  ? 'bg-[var(--color-accent)] text-black'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              {s.label}
            </Link>
          )
        })}

        {/* ml-auto: nav packs left, utilities pack right as the pill stretches */}
        <span aria-hidden className="ml-auto mr-1 h-5 w-px shrink-0 bg-white/20" />

        {/* open/closed in store-local time — empty until the client knows */}
        {status && (
          <span className="hidden shrink-0 items-center gap-1.5 px-2 text-[16px] uppercase leading-none tracking-[0.06em] min-[1700px]:flex">
            <span
              aria-hidden
              className={`h-2 w-2 rounded-full ${status.open ? 'bg-[var(--color-success)]' : 'bg-white/40'}`}
            />
            <span className={status.open ? 'text-[var(--color-success)]' : 'text-white/60'}>{status.label}</span>
          </span>
        )}

        {/* Recreational / Medical — inherited from the Dutchie embed; UI state
            until the GraphQL menuType param is verified (see MENU_TYPE_KEY) */}
        <label className="hidden shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] py-1 pl-3 pr-1.5 min-[1360px]:flex">
          <span className="text-[14px] uppercase leading-none tracking-[0.14em] text-white/60">Menu</span>
          <select
            value={menuType}
            onChange={(e) => chooseMenuType(e.target.value as 'recreational' | 'medical')}
            className="cursor-pointer bg-transparent py-1 text-[17px] uppercase leading-none tracking-[0.05em] text-white outline-none [&>option]:text-black"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <option value="recreational">Recreational</option>
            <option value="medical">Medical</option>
          </select>
        </label>

        {/* the store you are shopping; the whole chip opens the picker */}
        <button
          type="button"
          onClick={pickStore}
          className="flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2.5 text-left transition hover:border-[var(--color-accent)]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" className="h-4 w-4 shrink-0" aria-hidden>
            <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="hidden max-w-44 truncate text-[17px] uppercase leading-none tracking-[0.05em] md:block">
            {store ? store.name : 'Choose a store'}
          </span>
          <span className="text-[13px] uppercase leading-none tracking-[0.12em] text-[var(--color-accent)]">
            Change
          </span>
        </button>

        <Link
          href="/login"
          className="hidden shrink-0 rounded-full border border-white/25 px-4 py-2.5 text-[17px] uppercase leading-none tracking-[0.06em] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] sm:block"
        >
          Sign in
        </Link>

        {/* the bag — count on the art's badge circle */}
        <button
          type="button"
          aria-expanded={openMenu === 'cart'}
          aria-haspopup="dialog"
          aria-label={`Shopping bag, ${count} item${count === 1 ? '' : 's'}`}
          onClick={() => setOpenMenu(openMenu === 'cart' ? null : 'cart')}
          className={`mr-0.5 shrink-0 rounded-full p-1 transition-colors duration-200 ${
            openMenu === 'cart' ? 'bg-white/10 text-white' : 'text-white/85 hover:bg-white/10 hover:text-white'
          }`}
        >
          <CartIcon count={count} />
        </button>
      </div>

      {/* click-away backdrop for the dropdowns */}
      {openMenu && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpenMenu(null)}
          className="pointer-events-auto fixed inset-0 -z-10 cursor-default"
        />
      )}

      {/* SHOP panel — categories → filtered list. Icon wells carry Avanti's
          category art where supplied; the rest keep the letter-mark. */}
      <div
        role="menu"
        hidden={openMenu !== 'shop'}
        className="pointer-events-auto absolute left-1/2 top-full w-[min(92vw,30rem)] -translate-x-1/2 pt-1"
      >
        <div className="jb-dropdown relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0b0b]/95 p-3 text-white shadow-2xl backdrop-blur-md">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(70%_100%_at_50%_0%,rgba(254,207,14,0.14),transparent_70%)]"
          />
          <p className="relative px-3 pb-2 pt-1 text-[13px] uppercase leading-none tracking-[0.24em] text-[var(--color-accent)]">
            Shop by category
          </p>
          <div className="relative grid grid-cols-2 gap-1">
            {SHOP_CATEGORIES.map((c) => {
              const icon = CATEGORY_ICONS[c]
              return (
                <Link
                  key={c}
                  role="menuitem"
                  data-shop-category={c}
                  href={base ? `${base}/shop/${c}` : '/shop'}
                  onClick={() => setOpenMenu(null)}
                  className="group/row flex items-center gap-3 rounded-2xl px-3 py-2 transition-colors duration-200 hover:bg-white/[0.07]"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white transition-transform duration-200 group-hover/row:scale-105">
                    {icon ? (
                      // eslint-disable-next-line @next/next/no-img-element -- brand icon
                      <img src={icon} alt="" className="h-9 w-9 object-contain" />
                    ) : (
                      <span className="text-[18px] leading-none text-black/70">{categoryLabel(c).slice(0, 1)}</span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[22px] uppercase leading-none tracking-[0.03em] text-white/85 transition-colors duration-200 group-hover/row:text-white">
                    {categoryLabel(c)}
                  </span>
                  <RowArrow />
                </Link>
              )
            })}
          </div>
          <Link
            role="menuitem"
            href={base ?? '/shop'}
            onClick={() => setOpenMenu(null)}
            className="relative mt-2 flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-accent)] px-4 py-3.5 text-[17px] uppercase leading-none tracking-[0.08em] text-black transition hover:opacity-90"
          >
            Shop all
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4" aria-hidden>
              <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>

      {/* PRODUCTS panel — JB lines → filtered list (never the landing pages).
          Editorial: gold index numerals, big Bebas labels. */}
      <div
        role="menu"
        hidden={openMenu !== 'products'}
        className="pointer-events-auto absolute left-1/2 top-full w-[min(92vw,34rem)] -translate-x-1/2 pt-1"
      >
        <div className="jb-dropdown relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0b0b]/95 p-3 text-white shadow-2xl backdrop-blur-md">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(70%_100%_at_50%_0%,rgba(254,207,14,0.14),transparent_70%)]"
          />
          <p className="relative px-3 pb-2 pt-1 text-[13px] uppercase leading-none tracking-[0.24em] text-[var(--color-accent)]">
            Jungle Boys products
          </p>
          {/* icon wells + big Bebas labels, no numbering (Avanti, 2026-08-03) */}
          <div className="relative grid grid-cols-2 gap-1">
            {JB_LINES.map((l) => (
              <Link
                key={l.line}
                role="menuitem"
                data-jb-line={l.line}
                href={base ? `${base}/shop/${l.line}` : '/shop'}
                onClick={() => setOpenMenu(null)}
                className="group/row flex items-center gap-3 rounded-2xl px-3 py-2 transition-colors duration-200 hover:bg-white/[0.07]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white transition-transform duration-200 group-hover/row:scale-105">
                  {l.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element -- brand icon
                    <img src={l.icon} alt="" className="h-9 w-9 object-contain" />
                  ) : (
                    <span className="text-[18px] leading-none text-black/70">{l.label.slice(0, 1)}</span>
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate text-[22px] uppercase leading-none tracking-[0.03em] text-white/85 transition-colors duration-200 group-hover/row:text-white">
                  {l.label}
                </span>
                <RowArrow />
              </Link>
            ))}
          </div>
        </div>
      </div>
      {/* BAG panel — a pre-checkout list only. Checkout is DUTCHIE'S: until
          that wiring lands, the CTA hands off to the store menu. */}
      <div
        role="dialog"
        aria-label="Shopping bag"
        hidden={openMenu !== 'cart'}
        className="pointer-events-auto absolute right-3 top-full w-[min(92vw,24rem)] pt-1 md:right-[max(0.75rem,calc((100vw-1400px)/2))]"
      >
        <div className="jb-dropdown overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0b0b]/95 text-white shadow-2xl backdrop-blur-md">
          {/* header — title + live counter (Avanti, 2026-08-04: "a header
              and counter") over the panel's gold field */}
          <div className="relative border-b border-white/10 px-5 pb-4 pt-5">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(70%_100%_at_50%_0%,rgba(254,207,14,0.12),transparent_75%)]"
            />
            <div className="relative flex items-center justify-between gap-3">
              <span className="text-[26px] uppercase leading-none tracking-[0.04em]">Your bag</span>
              <span
                className="rounded-full bg-[var(--color-accent)] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-black"
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                {count} {count === 1 ? 'item' : 'items'}
              </span>
            </div>
            {store && (
              <p className="relative mt-1.5 text-[12px] uppercase leading-none tracking-[0.12em] text-white/50">
                Shopping at {store.name}
              </p>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="mx-auto h-10 w-10 text-white/30" aria-hidden>
                <circle cx="9.5" cy="20" r="1.4" />
                <circle cx="17" cy="20" r="1.4" />
                <path d="M3 4h2l2.15 11a1 1 0 0 0 1 .8h8.4a1 1 0 0 0 1-.78L20.2 8H6.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-3 text-[15px] uppercase leading-none tracking-[0.12em] text-white/60">
                Your bag is empty
              </p>
              <Link
                href={base ?? '/shop'}
                onClick={() => setOpenMenu(null)}
                className="mt-4 inline-block rounded-full border border-white/20 px-5 py-2.5 text-[13px] uppercase leading-none tracking-[0.1em] text-white/80 transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                Browse the menu
              </Link>
            </div>
          ) : (
            <div className="p-4">
              <ul className="max-h-72 space-y-2 overflow-y-auto">
                {cart.map((i) => (
                  <li key={`${i.storeSlug}-${i.variantId}`} className="flex items-center gap-3 rounded-2xl bg-white/[0.05] p-3">
                    {/* letter tile anchors the row (no images in the local bag) */}
                    <span className="font-display flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)] text-xl uppercase text-black">
                      {i.name.charAt(0)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <Link
                        href={`/shop/${i.slug}?store=${i.storeSlug}`}
                        onClick={() => setOpenMenu(null)}
                        className="block truncate text-[16px] uppercase leading-tight tracking-[0.03em] hover:text-[var(--color-accent)]"
                      >
                        {i.name}
                      </Link>
                      <span className="mt-1 flex items-center gap-2">
                        <span className="text-[12px] uppercase leading-none tracking-[0.1em] text-white/50">{i.option}</span>
                        {/* qty stepper */}
                        <span className="inline-flex items-center rounded-full border border-white/15">
                          <button
                            type="button"
                            onClick={() => setCartQty(i.variantId, i.storeSlug, i.qty - 1)}
                            aria-label={`One less ${i.name}`}
                            className="px-2 py-1 text-[14px] leading-none text-white/70 transition hover:text-[var(--color-accent)]"
                          >
                            −
                          </button>
                          <span className="min-w-5 text-center text-[13px] leading-none tabular-nums">{i.qty}</span>
                          <button
                            type="button"
                            onClick={() => setCartQty(i.variantId, i.storeSlug, i.qty + 1)}
                            aria-label={`One more ${i.name}`}
                            className="px-2 py-1 text-[14px] leading-none text-white/70 transition hover:text-[var(--color-accent)]"
                          >
                            +
                          </button>
                        </span>
                      </span>
                    </span>
                    <span className="shrink-0 text-[17px] leading-none">${((i.price * i.qty) / 100).toFixed(2).replace(/\.00$/, '')}</span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(i.variantId, i.storeSlug)}
                      aria-label={`Remove ${i.name} from bag`}
                      className="shrink-0 rounded-full p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden>
                        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between border-t border-white/10 px-2 pt-3">
                <span className="text-[13px] uppercase leading-none tracking-[0.18em] text-white/60">
                  Subtotal · {count} {count === 1 ? 'item' : 'items'}
                </span>
                <span className="text-[22px] leading-none">${(cartSubtotal(cart) / 100).toFixed(2).replace(/\.00$/, '')}</span>
              </div>
              {/* PillCta language: label + cart icon in a circle on the right */}
              <Link
                href={base ?? '/shop'}
                onClick={() => setOpenMenu(null)}
                className="group/co mt-3 flex w-full items-center justify-between rounded-full bg-[var(--color-accent)] py-1.5 pl-6 pr-1.5 text-[16px] uppercase leading-none tracking-[0.08em] text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
              >
                <span className="truncate">Checkout at {store ? store.name : 'your store'}</span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-[var(--color-accent)]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
                    <circle cx="9.5" cy="20" r="1.4" />
                    <circle cx="17" cy="20" r="1.4" />
                    <path d="M3 4h2l2.15 11a1 1 0 0 0 1 .8h8.4a1 1 0 0 0 1-.78L20.2 8H6.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
              <p className="mt-2 px-2 text-center text-[12px] uppercase leading-none tracking-[0.1em] text-white/40">
                Checkout completes on the store menu for now
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
    </>
  )
}
