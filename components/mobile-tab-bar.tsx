'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useScanner } from '@/components/scan/scan-provider'
import { readStore } from '@/lib/store-selection'

// Mobile-only sticky bottom pill: Deals / Drops · [VERIFY scan] · Locations / Contact.
// The raised center button opens the QR scanner (→ /auth).
//
// Deals and Drops are STORE-SCOPED surfaces as of Phase 3, so these two tabs
// are store-aware: with a chosen CA store they deep-link into that store's
// deals/drops; without one they land on /shop, where the picker opens and the
// choice routes onward. The hrefs upgrade in an effect AFTER hydration — the
// saved store is localStorage, and server HTML must not disagree with the
// first client paint. (They previously pointed at the interim marketing
// redirects /710-deals and /drops, which is how every tap ended up on
// /rewards or /products — the complaint that prompted this.)

type TabItem = { label: string; href: string; surface?: 'deals' | 'drops'; icon: React.ReactNode }

const LEFT: TabItem[] = [
  {
    label: 'Deals',
    href: '/shop',
    surface: 'deals',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
        <path d="M4 4h7l9 9-7 7-9-9V4Z" strokeLinejoin="round" />
        <circle cx="8.5" cy="8.5" r="1.4" />
      </svg>
    ),
  },
  {
    label: 'Drops',
    href: '/shop',
    surface: 'drops',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
        <path d="M12 3c.9 2.7-1.3 4-1.3 6.1 0 1.1.9 2 2 2 1.2 0 2-1 1.7-2.4 1.7 1.2 2.7 3 2.7 5a5.1 5.1 0 0 1-10.2 0C6.9 10.1 9.6 8 12 3Z" strokeLinejoin="round" />
      </svg>
    ),
  },
]

const RIGHT: TabItem[] = [
  {
    label: 'Locations',
    href: '/locations',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
        <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
  {
    label: 'Contact',
    href: '/contact',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
        <path d="M4 6h16v12H4z" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    ),
  },
]

function TabLink({ item, active }: { item: TabItem; active: boolean }) {
  return (
    <Link prefetch={false}
      href={item.href}
      className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
        active ? 'text-[var(--color-accent)]' : 'hover:text-[var(--color-accent)]'
      }`}
    >
      {item.icon}
      <span className="text-[9px] font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-brand)' }}>
        {item.label}
      </span>
    </Link>
  )
}

// prefetch={false} on every entry: Next prefetches linked routes when they
// enter the viewport, and this bar is on every page, so /locations' 130KB
// header SVG was downloading alongside the hero on product pages and pushing
// LCP out. The bar is one tap from anywhere; it does not need to be warm.
export default function MobileTabBar() {
  const pathname = usePathname()
  const { open } = useScanner()

  // CA only: a saved FL store points at /menu/florida/* shells that have not
  // landed yet, so FL keeps the /shop fallback rather than deep-linking a 404.
  const [storeBase, setStoreBase] = useState<string | null>(null)
  useEffect(() => {
    const saved = readStore()
    if (saved?.state === 'CA') setStoreBase(`/menu/california/${saved.slug}`)
  }, [pathname]) // re-read per navigation: the picker may have just chosen a store

  const resolve = (item: TabItem): TabItem =>
    item.surface && storeBase ? { ...item, href: `${storeBase}/${item.surface}` } : item

  return (
    <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-3 z-30 flex justify-center px-3 lg:hidden">
      <div className="flex w-[22rem] max-w-full items-center rounded-full border border-white/10 bg-[#0b0b0b]/95 px-3 py-3 text-white shadow-2xl backdrop-blur-md">
        <div className="flex flex-1 items-center justify-around">
          {LEFT.map((item) => {
            const r = resolve(item)
            return <TabLink key={item.label} item={r} active={pathname === r.href} />
          })}
        </div>

        {/* raised center VERIFY — opens the QR scanner */}
        <button
          onClick={open}
          aria-label="Verify a product — open scanner"
          className="group -mt-8 flex shrink-0 flex-col items-center"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)] text-black shadow-lg ring-4 ring-[#0b0b0b] transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden>
              <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" strokeLinecap="round" />
              <rect x="8.5" y="8.5" width="7" height="7" rx="1.2" />
            </svg>
          </span>
          <span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-brand)' }}>
            Verify
          </span>
        </button>

        <div className="flex flex-1 items-center justify-around">
          {RIGHT.map((item) => (
            <TabLink key={item.href} item={item} active={pathname === item.href} />
          ))}
        </div>
      </div>
    </nav>
  )
}
