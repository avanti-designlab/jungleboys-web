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
  // Official Weedmaps mark (WM_LOGO.svg, supplied by Avanti 2026-07-19)
  weedmaps: (
    <svg viewBox="0 0 20.7 12.43" fill="currentColor" className="h-4 w-auto" aria-hidden>
      <path fillRule="evenodd" d="M20.66,6.59c-.5,0-1.01.01-1.51-.01-.06,0-.17-.2-.17-.31-.01-1.04,0-2.09-.01-3.13,0-.28-.02-.56-.05-.83-.05-.51-.31-.81-.75-.89-.6-.11-1.09.07-1.3.56-.11.26-.17.56-.18.84-.02,1.13-.02,2.27-.01,3.4,0,.3-.07.42-.39.4-.33-.03-.67-.02-1,0-.29.02-.38-.07-.38-.37.02-1.2,0-2.4,0-3.6,0-.07,0-.13,0-.2-.03-.54-.26-.91-.66-1.01-.53-.14-1.11.04-1.34.48-.15.29-.25.65-.26.98-.03,1.1-.01,2.2-.01,3.3,0,.12,0,.24,0,.4-.55,0-1.07,0-1.59-.01-.05,0-.14-.2-.14-.3-.01-.96,0-1.91,0-2.87,0-.97,0-1.93,0-2.9,0-.26.08-.36.34-.34.32.02.65.02.97,0,.29-.02.38.1.35.37-.01.14,0,.28,0,.53C13.12.37,13.74,0,14.56.01c.79.02,1.46.25,1.85,1.03.09-.1.16-.16.23-.24.84-.97,2.08-.96,3.02-.53.72.32,1.01.98,1.02,1.71.04,1.49.01,2.98.01,4.46,0,.03-.02.06-.04.14Z" />
      <path fillRule="evenodd" d="M4.88,2.37c-.19.74-.38,1.47-.57,2.21-.14.57-.29,1.14-.43,1.71-.05.21-.13.32-.38.31-.42-.02-.84,0-1.27-.02-.11,0-.28-.11-.31-.21C1.28,4.36.64,2.34,0,.32c0-.03,0-.06,0-.14.57,0,1.13-.01,1.69.01.07,0,.16.19.19.3.34,1.22.66,2.44.99,3.66.03.1.06.21.12.4.07-.27.13-.46.17-.64.28-1.14.57-2.28.83-3.43.06-.24.16-.33.4-.32.35.02.71.02,1.07,0,.25-.02.34.09.4.32.31,1.26.63,2.52.95,3.78.01.05.03.1.11.17.04-.12.08-.23.11-.35.33-1.2.66-2.4.97-3.6.06-.23.15-.33.4-.32.47.02.95,0,1.46,0-.03.14-.05.23-.08.33-.61,1.93-1.22,3.85-1.82,5.78-.08.25-.19.34-.44.32-.35-.02-.71-.02-1.07,0-.3.02-.43-.08-.5-.37-.3-1.19-.62-2.38-.94-3.57-.03-.1-.06-.19-.09-.28-.03,0-.05,0-.08,0Z" />
      <path fillRule="evenodd" d="M3.83,10.01c.28-.37.54-.73.77-1.04,3.88,1.87,7.71,1.87,11.59.01.01.01.07.06.11.12.22.3.45.6.67.9-3.97,3.19-9,3.29-13.14,0Z" />
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
                    'font-display text-6xl md:text-7xl xl:text-8xl uppercase text-white transition-colors duration-200 hover:text-[var(--color-accent)]'
                  return (
                    <li key={l.href} className="menu-line">
                      {l.external ? (
                        <a
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ animationDelay: delay }}
                          className={cls}
                        >
                          {l.label}
                        </a>
                      ) : (
                        <Link
                          href={l.href}
                          onClick={() => setOpen(false)}
                          style={{ animationDelay: delay }}
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

      {/* sticky header — hamburger/logo/socials invert via blend; VERIFY pill stays true yellow */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex w-full max-w-[1560px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4 text-white" style={{ mixBlendMode: 'difference' }}>
            <button
              aria-expanded={open}
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
              className="flex cursor-pointer flex-col items-start gap-[7px] p-2"
            >
              <span className={`block h-[2px] rounded bg-white transition-all duration-300 ${open ? 'w-8 translate-y-[9px] rotate-45' : 'w-9'}`} />
              <span className={`block h-[2px] rounded bg-white transition-all duration-200 ${open ? 'w-8 opacity-0' : 'w-6'}`} />
              <span className={`block h-[2px] rounded bg-white transition-all duration-300 ${open ? 'w-8 -translate-y-[9px] -rotate-45' : 'w-[30px]'}`} />
            </button>

            <Link
              href="/"
              aria-label="Jungle Boys home"
              onClick={() => setOpen(false)}
              className="block h-14 w-20 transition-transform duration-200 hover:scale-105 md:h-16 md:w-24"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
              <img src={BRAND_ASSETS.logoWhite} alt="Jungle Boys" className="h-full w-full object-contain" />
            </Link>
          </div>

          {!open && (
            <div className="flex items-center gap-3">
              <Link
                href="/verify"
                className="rounded-full bg-[var(--color-accent)] px-6 py-3 text-xs font-bold uppercase tracking-widest text-[var(--color-on-accent)] transition-transform duration-200 hover:scale-105"
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                Verify Products
              </Link>
              <div
                className="flex items-center gap-4 rounded-full border-2 border-white px-5 py-3 text-white"
                style={{ mixBlendMode: 'difference' }}
              >
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
            </div>
          )}
        </div>
      </header>
    </>
  )
}
