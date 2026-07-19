'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MENU_COLUMNS, BRAND_ASSETS } from '@/lib/site-config'

// Sticky transparent header that color-inverts over any background via
// mix-blend-difference (all header art is white; the blend flips it to black
// over light sections automatically). Hamburger + small JB logo on the left
// (logo always routes home), VERIFY PRODUCTS pill + socials on the right.
// The hamburger opens a full-screen, no-scroll menu matching the live site's
// three-column layout, with staggered mask-reveal link entrances.

const ICONS = {
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  weedmaps: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M12 2c-3.9 0-7 3.1-7 7 0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7Zm.6 11.6c.1-1.2.5-2.3 1.2-3.2-.2 1.3-.7 2.4-1.2 3.2Zm-1.2 0c-.5-.8-1-1.9-1.2-3.2.7.9 1.1 2 1.2 3.2ZM12 12c-.6-1.5-.6-3.3 0-4.9.6 1.6.6 3.4 0 4.9Zm2.9-1.6c-.9.4-1.7 1-2.3 1.8.3-1 .9-1.9 1.7-2.5.2.2.4.5.6.7Zm-5.8 0c.2-.2.4-.5.6-.7.8.6 1.4 1.5 1.7 2.5-.6-.8-1.4-1.4-2.3-1.8Z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.28 5 12 5 12 5s-6.28 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.72 19 12 19 12 19s6.28 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15.2V8.8L15.5 12 10 15.2Z" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M17.9 3H21l-6.8 7.8L22.2 21h-6.3l-4.9-6.4L5.4 21H2.3l7.3-8.3L2 3h6.4l4.4 5.9L17.9 3Zm-1.1 16.1h1.7L7.6 4.8H5.8l11 14.3Z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M13.5 21v-7.4h2.5l.4-2.9h-2.9V8.8c0-.8.2-1.4 1.4-1.4h1.6V4.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.1H7.9v2.9h2.5V21h3.1Z" />
    </svg>
  ),
}

const HEADER_SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/jungleboys', icon: ICONS.instagram },
  { label: 'Weedmaps', href: 'https://weedmaps.com/brands/jungleboys/products', icon: ICONS.weedmaps },
  { label: 'YouTube', href: 'https://www.youtube.com/@JungleBoysfilms', icon: ICONS.youtube },
]

const OVERLAY_SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/jungleboys', icon: ICONS.instagram },
  { label: 'X', href: 'https://x.com/jungleboysdrops', icon: ICONS.x },
  { label: 'YouTube', href: 'https://www.youtube.com/@JungleBoysfilms', icon: ICONS.youtube },
  { label: 'Facebook', href: 'https://www.facebook.com/JungleBoysDrops/', icon: ICONS.facebook },
]

export default function SiteNav() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', esc)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  let linkIndex = 0 // running index for the stagger delay across all columns

  return (
    <>
      {/* full-screen menu (under the blended header, above everything else) */}
      {open && (
        <div className="menu-overlay fixed inset-0 z-40 h-dvh overflow-hidden bg-[#0b0b0b]">
          <nav className="mx-auto grid h-full w-full max-w-[1500px] grid-cols-1 content-start gap-x-8 gap-y-1 px-8 pt-28 md:grid-cols-3 md:pt-40">
            {MENU_COLUMNS.map((column, c) => (
              <ul key={c} className="flex flex-col">
                {column.map((l) => {
                  const delay = `${0.12 + linkIndex++ * 0.055}s`
                  const cls =
                    'text-5xl md:text-6xl xl:text-7xl uppercase leading-[1.15] text-white transition-colors duration-200 hover:text-[var(--color-accent)]'
                  return (
                    <li key={l.href} className="menu-line">
                      {l.external ? (
                        <a
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontFamily: 'var(--font-display)', animationDelay: delay }}
                          className={cls}
                        >
                          {l.label}
                        </a>
                      ) : (
                        <Link
                          href={l.href}
                          onClick={() => setOpen(false)}
                          style={{ fontFamily: 'var(--font-display)', animationDelay: delay }}
                          className={cls}
                        >
                          {l.label}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            ))}
          </nav>

          <div className="menu-socials absolute bottom-8 right-8 flex items-center gap-6 text-white">
            {OVERLAY_SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="transition-transform duration-200 hover:scale-110 hover:text-[var(--color-accent)]"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* sticky inverting header — everything inside stays WHITE; the blend does the rest */}
      <header
        className="fixed inset-x-0 top-0 z-50 text-white"
        style={{ mixBlendMode: 'difference' }}
      >
        <div className="mx-auto flex w-full max-w-[1560px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              aria-expanded={open}
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
              className="flex cursor-pointer flex-col gap-[6px] p-2"
            >
              <span className={`block h-[3px] w-8 rounded bg-white transition-transform duration-300 ${open ? 'translate-y-[9px] rotate-45' : ''}`} />
              <span className={`block h-[3px] w-8 rounded bg-white transition-opacity duration-200 ${open ? 'opacity-0' : ''}`} />
              <span className={`block h-[3px] w-8 rounded bg-white transition-transform duration-300 ${open ? '-translate-y-[9px] -rotate-45' : ''}`} />
            </button>

            <Link
              href="/"
              aria-label="Jungle Boys home"
              onClick={() => setOpen(false)}
              className="block h-12 w-16 transition-transform duration-200 hover:scale-105"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
              <img src={BRAND_ASSETS.logoWhite} alt="Jungle Boys" className="h-full w-full object-contain" />
            </Link>
          </div>

          {!open && (
            <div className="flex items-center gap-5 rounded-full border-2 border-white px-5 py-2.5">
              <Link
                href="/verify"
                className="text-xs font-bold uppercase tracking-widest transition-opacity duration-200 hover:opacity-70"
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                Verify Products
              </Link>
              <span className="h-4 w-px bg-white/50" aria-hidden />
              {HEADER_SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="transition-transform duration-200 hover:scale-110"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          )}
        </div>
      </header>
    </>
  )
}
