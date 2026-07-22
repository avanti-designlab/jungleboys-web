'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useScanner } from '@/components/scan/scan-provider'

// Mobile-only sticky bottom pill: Shop / Locations · [VERIFY scan] · Wholesale / Contact.
// The raised center button opens the QR scanner (→ /auth).

const LEFT = [
  {
    label: 'Shop',
    href: '/products',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
        <path d="M6 8h12l-1 12H7L6 8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
    ),
  },
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
]

const RIGHT = [
  {
    label: 'Wholesale',
    href: '/wholesale',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
        <path d="M3 8.2 12 4l9 4.2v7.6L12 20l-9-4.2V8.2Z" />
        <path d="M12 12v8M3 8.2l9 3.8 9-3.8" />
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

function TabLink({ item, active }: { item: (typeof LEFT)[number]; active: boolean }) {
  return (
    <Link
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

export default function MobileTabBar() {
  const pathname = usePathname()
  const { open } = useScanner()
  return (
    <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-3 z-30 flex justify-center lg:hidden">
      <div className="flex items-center gap-6 rounded-full border border-white/10 bg-[#0b0b0b]/95 px-6 py-3 text-white shadow-2xl backdrop-blur-md">
        {LEFT.map((item) => (
          <TabLink key={item.href} item={item} active={pathname === item.href} />
        ))}

        {/* raised center VERIFY — opens the QR scanner */}
        <button
          onClick={open}
          aria-label="Verify a product — open scanner"
          className="group -mt-8 flex flex-col items-center"
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

        {RIGHT.map((item) => (
          <TabLink key={item.href} item={item} active={pathname === item.href} />
        ))}
      </div>
    </nav>
  )
}
