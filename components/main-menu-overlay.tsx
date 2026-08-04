'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { MENU_COLUMNS } from '@/lib/site-config'
import { SocialIcons } from './social-icons'

// The full-screen main menu — EXTRACTED from SiteNav (2026-08-04) so the
// commerce shell can mount the same menu behind its own hamburger (Avanti:
// "universal, doesn't look separated"). One overlay, one link list, one focus
// trap; SiteNav and CommerceHeader both render this and only own their
// toggle buttons.

const OVERLAY_SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/jungleboys', icon: SocialIcons.instagram },
  { label: 'X', href: 'https://x.com/jungleboysdrops', icon: SocialIcons.x },
  { label: 'YouTube', href: 'https://www.youtube.com/@JungleBoysfilms', icon: SocialIcons.youtube },
  { label: 'Facebook', href: 'https://www.facebook.com/JungleBoysDrops/', icon: SocialIcons.facebook },
]

export default function MainMenuOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null)

  // Modal behavior: scroll lock, Escape, and a focus trap. The overlay renders
  // BEFORE the header in the DOM, so without a trap forward-Tab walked past
  // its links into the invisible page behind. Mirrors components/age-gate.tsx.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', esc)

    if (!open) {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', esc)
      return () => document.removeEventListener('keydown', esc)
    }

    const overlay = overlayRef.current
    const focusables = () =>
      overlay ? [...overlay.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')] : []

    focusables()[0]?.focus()

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !overlay) return
      const items = focusables()
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', trap)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', esc)
      document.removeEventListener('keydown', trap)
      // restore focus to whichever toggle opened the menu
      document.querySelector<HTMLElement>('[data-menu-toggle]')?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  let linkIndex = 0 // running index for the stagger delay across all columns

  return (
    <div
      ref={overlayRef}
      data-nav-overlay
      role="dialog"
      aria-modal="true"
      aria-label="Main menu"
      className="menu-overlay fixed inset-0 z-40 flex h-dvh flex-col overflow-y-auto overscroll-contain bg-[#0b0b0b]"
    >
      {/* links grow to fill the height; type sized up to carry the room
          (Avanti, 2026-08-04: "alot of dead space… make the text bigger") */}
      <nav className="mx-auto grid w-full max-w-[1560px] flex-1 grid-cols-1 content-start gap-x-10 gap-y-9 px-8 pt-28 md:[grid-template-columns:1fr_1fr_1.35fr] md:content-center md:gap-y-1 md:pt-20">
        {MENU_COLUMNS.map((column, c) => (
          <ul key={c} className="flex flex-col md:gap-2">
            {column.map((l) => {
              const delay = `${0.05 + linkIndex++ * 0.03}s`
              const cls =
                'font-display whitespace-nowrap text-5xl leading-[0.92] uppercase text-white transition-colors duration-200 hover:text-[var(--color-accent)] md:text-7xl xl:text-[6.5rem] xl:leading-[0.9]'
              return (
                <li key={l.label} className="menu-line">
                  {l.external ? (
                    <a href={l.href} target="_blank" rel="noopener noreferrer" style={{ animationDelay: delay }} className={cls}>
                      {l.label}
                    </a>
                  ) : (
                    <Link href={l.href} onClick={onClose} style={{ animationDelay: delay }} className={cls}>
                      {l.label}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        ))}
      </nav>

      {/* promo doors fill the old dead band — evergreen (never stale sale
          data in a global overlay): the deals + drops doors route each
          visitor to their own store's live surface. */}
      <div className="menu-promos mx-auto mb-10 mt-10 grid w-full max-w-[1560px] items-center gap-3 px-8 md:[grid-template-columns:1fr_1fr_auto]">
        <Link
          href="/deals"
          onClick={onClose}
          className="group flex items-center justify-between gap-4 rounded-3xl bg-[linear-gradient(120deg,#ffe27a_0%,#fecf0e_55%,#e7b30c_100%)] p-6 text-black transition-transform duration-200 hover:-translate-y-0.5 md:p-7"
        >
          <span>
            <span className="block text-[11px] font-extrabold uppercase tracking-[0.24em] text-black/60" style={{ fontFamily: 'var(--font-brand)' }}>
              Live now
            </span>
            <span className="font-display mt-1 block text-3xl uppercase leading-[0.9] md:text-4xl">
              August deals
            </span>
          </span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-6 w-6 shrink-0 transition-transform duration-200 group-hover:translate-x-1" aria-hidden>
            <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <Link
          href="/drops"
          onClick={onClose}
          className="group flex items-center justify-between gap-4 rounded-3xl border border-white/15 bg-white/[0.05] p-6 text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-accent)] md:p-7"
        >
          <span>
            <span className="block text-[11px] font-extrabold uppercase tracking-[0.24em] text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-brand)' }}>
              Every Friday
            </span>
            <span className="font-display mt-1 block text-3xl uppercase leading-[0.9] md:text-4xl">
              Fresh drops
            </span>
          </span>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.4" className="h-6 w-6 shrink-0 transition-transform duration-200 group-hover:translate-x-1" aria-hidden>
            <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        <div className="menu-socials flex items-center justify-end gap-5 px-2 text-white md:pl-6">
          {OVERLAY_SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="transition-transform duration-200 hover:scale-110 hover:text-[var(--color-accent)] [&_svg]:h-8 [&_svg]:w-8"
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
