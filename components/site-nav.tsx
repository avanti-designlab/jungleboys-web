'use client'

import Link from 'next/link'
import { useState } from 'react'
import { NAV_LINKS, BRAND } from '@/lib/site-config'

export default function SiteNav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-background)]/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-2xl uppercase tracking-wide"
          style={{ fontFamily: 'var(--font-display)' }}
          onClick={() => setOpen(false)}
        >
          {BRAND.name}
        </Link>

        {/* desktop */}
        <ul className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-xs font-medium uppercase tracking-widest text-[var(--color-foreground-soft)] transition-colors duration-200 hover:text-[var(--color-accent)]"
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/profile"
              aria-label="Account"
              className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              Account
            </Link>
          </li>
        </ul>

        {/* hamburger */}
        <button
          className="lg:hidden flex flex-col gap-1.5 p-2 cursor-pointer"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <span className={`block h-0.5 w-6 bg-[var(--color-foreground)] transition-transform duration-200 ${open ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`block h-0.5 w-6 bg-[var(--color-foreground)] transition-opacity duration-200 ${open ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-6 bg-[var(--color-foreground)] transition-transform duration-200 ${open ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </nav>

      {/* mobile overlay */}
      {open && (
        <div className="lg:hidden border-t border-[var(--color-border)] bg-[var(--color-background)] px-6 py-8">
          <ul className="flex flex-col gap-6">
            {[...NAV_LINKS, { label: 'Account', href: '/profile' }].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-3xl uppercase"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}
