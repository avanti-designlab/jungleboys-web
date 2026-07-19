'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MENU_COLUMNS, BRAND_ASSETS } from '@/lib/site-config'
import { SocialIcons } from './social-icons'
import ThemeToggle from './theme-toggle'
import PillCta from './pill-cta'

// Sticky transparent header that color-inverts over any background via
// mix-blend-difference (all header art is white; the blend flips it to black
// over light sections automatically). Hamburger + small JB logo on the left
// (logo always routes home), VERIFY PRODUCTS pill + socials on the right.
// The hamburger opens a full-screen, no-scroll menu matching the live site's
// three-column layout, with staggered mask-reveal link entrances.

const HEADER_SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/jungleboys', icon: SocialIcons.instagram },
  { label: 'Weedmaps', href: 'https://weedmaps.com/brands/jungleboys/products', icon: SocialIcons.weedmaps },
  { label: 'YouTube', href: 'https://www.youtube.com/@JungleBoysfilms', icon: SocialIcons.youtube },
]

const OVERLAY_SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/jungleboys', icon: SocialIcons.instagram },
  { label: 'X', href: 'https://x.com/jungleboysdrops', icon: SocialIcons.x },
  { label: 'YouTube', href: 'https://www.youtube.com/@JungleBoysfilms', icon: SocialIcons.youtube },
  { label: 'Facebook', href: 'https://www.facebook.com/JungleBoysDrops/', icon: SocialIcons.facebook },
]

export default function SiteNav() {
  const [open, setOpen] = useState(false)
  const [condensed, setCondensed] = useState(false)

  // condense into a pill once the hero region (or first viewport) is passed
  useEffect(() => {
    const onScroll = () => {
      setCondensed(window.scrollY > 350)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

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
          <nav className="mx-auto grid h-full w-full max-w-[1560px] grid-cols-1 content-start gap-x-10 gap-y-1 px-8 pt-28 md:[grid-template-columns:1fr_1fr_1.35fr] md:pt-40">
            {MENU_COLUMNS.map((column, c) => (
              <ul key={c} className="flex flex-col">
                {column.map((l) => {
                  const delay = `${0.12 + linkIndex++ * 0.055}s`
                  const cls =
                    'font-display whitespace-nowrap text-6xl md:text-7xl xl:text-8xl uppercase text-white transition-colors duration-200 hover:text-[var(--color-accent)]'
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
                className="transition-transform duration-200 hover:scale-110 hover:text-[var(--color-accent)] [&_svg]:h-9 [&_svg]:w-9"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* sticky header — expanded bar morphs into a floating pill on scroll */}
      <header className="fixed inset-x-0 top-0 z-50">
        {/* expanded bar */}
        <div
          className={`mx-auto flex w-full items-center justify-between px-8 pt-6 pb-3 transition-all duration-500 md:px-12 ${
            condensed && !open
              ? 'pointer-events-none -translate-y-8 opacity-0'
              : 'translate-y-0 opacity-100'
          }`}
        >
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
              <PillCta label="Verify Products" href="/verify" />
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
              <div style={{ mixBlendMode: 'difference' }}>
                <ThemeToggle />
              </div>
            </div>
          )}
        </div>

        {/* condensed floating pill */}
        <div
          className={`absolute inset-x-0 top-0 flex justify-center transition-all duration-500 ${
            condensed && !open
              ? 'translate-y-3 opacity-100'
              : 'pointer-events-none -translate-y-10 opacity-0'
          }`}
        >
          <div className="flex items-center gap-4 rounded-full border border-white/10 bg-[#0b0b0b]/90 py-2 pl-4 pr-3 text-white shadow-2xl backdrop-blur-md">
            <button
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className="flex cursor-pointer flex-col items-start gap-[5px] p-1"
            >
              <span className="block h-[2px] w-7 rounded bg-white" />
              <span className="block h-[2px] w-5 rounded bg-white" />
              <span className="block h-[2px] w-6 rounded bg-white" />
            </button>
            <Link href="/" aria-label="Jungle Boys home" className="block h-10 w-14">
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
              <img src={BRAND_ASSETS.logoWhite} alt="Jungle Boys" className="h-full w-full object-contain" />
            </Link>
            <span className="h-5 w-px bg-white/20" aria-hidden />
            <PillCta label="Verify Products" href="/verify" size="sm" className="hidden sm:inline-flex" />
            <div className="hidden items-center gap-3 sm:flex">
              {HEADER_SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="transition-transform duration-200 hover:scale-110 [&_svg]:h-4 [&_svg]:w-4"
                >
                  {s.icon}
                </a>
              ))}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>
    </>
  )
}
