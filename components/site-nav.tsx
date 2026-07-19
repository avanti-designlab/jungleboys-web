'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { NAV_LINKS, BRAND_ASSETS } from '@/lib/site-config'

// Matches the live design: floating hamburger (top-left) + JB stacked script
// logo (top-right) over the page; hamburger opens a full-screen dark menu with
// display-size links.

export default function SiteNav() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header className="pointer-events-none absolute inset-x-0 top-0 z-50">
        <div className="mx-auto flex w-full max-w-[1500px] items-start justify-between px-8 pt-8">
          <button
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
            className="pointer-events-auto flex cursor-pointer flex-col gap-[7px] rounded-md p-2"
          >
            <span className={`block h-[3px] w-9 rounded bg-white transition-transform duration-200 ${open ? 'translate-y-[10px] rotate-45' : ''}`} />
            <span className={`block h-[3px] w-9 rounded bg-white transition-opacity duration-200 ${open ? 'opacity-0' : ''}`} />
            <span className={`block h-[3px] w-9 rounded bg-white transition-transform duration-200 ${open ? '-translate-y-[10px] -rotate-45' : ''}`} />
          </button>

          <Link
            href="/"
            aria-label="Jungle Boys home"
            onClick={() => setOpen(false)}
            className="pointer-events-auto relative h-16 w-24 md:h-20 md:w-32"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
            <img src={BRAND_ASSETS.logoWhite} alt="Jungle Boys" className="h-full w-full object-contain" />
          </Link>
        </div>
      </header>

      {/* full-screen menu */}
      {open && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-[#0b0b0b] px-8 pb-16 pt-32">
          <nav className="mx-auto w-full max-w-[1500px]">
            <ul className="flex flex-col gap-2">
              {[...NAV_LINKS, { label: 'Account', href: '/profile' }].map((l, i) => (
                <li key={l.href}>
                  {'external' in l && l.external ? (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-6xl md:text-8xl uppercase leading-[1.05] text-white transition-colors duration-200 hover:text-[var(--color-accent)]"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="block text-6xl md:text-8xl uppercase leading-[1.05] text-white transition-colors duration-200 hover:text-[var(--color-accent)]"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  )
}
