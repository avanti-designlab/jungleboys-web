'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Mobile-only sticky bottom pill: Shop / Locations / Wholesale / Contact.

const ITEMS = [
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

export default function MobileTabBar() {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-3 z-30 flex justify-center lg:hidden"
    >
      <div className="flex items-center gap-7 rounded-full border border-white/10 bg-[#0b0b0b]/95 px-7 py-3 text-white shadow-2xl backdrop-blur-md">
        {ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
                active ? 'text-[var(--color-accent)]' : 'hover:text-[var(--color-accent)]'
              }`}
            >
              {item.icon}
              <span
                className="text-[9px] font-bold uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
