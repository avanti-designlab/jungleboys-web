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
      className="menu-overlay fixed inset-0 z-40 h-dvh overflow-y-auto overscroll-contain bg-[#0b0b0b]"
    >
      <nav className="mx-auto grid h-full w-full max-w-[1560px] grid-cols-1 content-start gap-x-10 gap-y-9 px-8 pt-28 md:[grid-template-columns:1fr_1fr_1.35fr] md:gap-y-1 md:pt-40">
        {MENU_COLUMNS.map((column, c) => (
          <ul key={c} className="flex flex-col">
            {column.map((l) => {
              const delay = `${0.05 + linkIndex++ * 0.03}s`
              const cls =
                'font-display whitespace-nowrap text-5xl leading-[0.92] md:text-6xl xl:text-7xl uppercase text-white transition-colors duration-200 hover:text-[var(--color-accent)]'
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

      <div className="menu-socials absolute bottom-8 right-8 flex items-center gap-6 text-white">
        {OVERLAY_SOCIALS.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            className="transition-transform duration-200 hover:scale-110 hover:text-[var(--color-accent)] [&_svg]:h-9 [&_svg]:w-9"
          >
            {s.icon}
          </a>
        ))}
      </div>
    </div>
  )
}
