'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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

// Routes that pin themselves dark regardless of theme — the condensed pill
// inverts to white there so it stays visible.
const DARK_PAGES = ['/rewards', '/phenos']

function UserIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <circle cx="12" cy="8.5" r="3.75" />
      <path d="M4.5 20c0-3.9 3.4-6 7.5-6s7.5 2.1 7.5 6" strokeLinecap="round" />
    </svg>
  )
}

export default function SiteNav() {
  const [open, setOpen] = useState(false)
  const [condensed, setCondensed] = useState(false)
  // adaptive header: true = a dark section is behind the bar → use white content;
  // false = light behind → use black. Detected by sampling the page under the bar
  // (mix-blend-difference can't work here — the fixed header isolates the blend).
  const [headerDark, setHeaderDark] = useState(true)
  const pathname = usePathname()
  const onDarkPage = DARK_PAGES.some((p) => pathname?.startsWith(p))

  // sample what's painted behind the header and flip the header color to match
  useEffect(() => {
    let raf = 0
    const sample = () => {
      raf = 0
      // probe at the logo's x, just below the top edge. Look THROUGH full-screen
      // overlays (loading screen, age gate) — otherwise a cold load samples the
      // overlay instead of the page and the header color sticks wrong.
      const stack = document.elementsFromPoint(80, 42)
      const el = stack.find(
        (e) => !e.closest('header') && !e.closest('[data-nav-overlay]') && !e.closest('[data-nav-ignore]')
      )
      const region = el?.closest('[data-nav-theme]') as HTMLElement | null
      setHeaderDark(region?.dataset.navTheme === 'dark')
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(sample)
    }
    // sample now + again as layout/images/overlays settle, and when the age gate
    // or intro clears (the hero only becomes visible then)
    const timers = [60, 250, 700, 1400].map((ms) => setTimeout(sample, ms))
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    window.addEventListener('jb:gate-passed', sample)
    window.addEventListener('jb:intro-done', sample)
    return () => {
      timers.forEach(clearTimeout)
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('jb:gate-passed', sample)
      window.removeEventListener('jb:intro-done', sample)
    }
  }, [pathname])

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

  // the bar's left cluster is white over any dark backdrop OR the open menu
  const barDark = open || headerDark

  return (
    <>
      {/* full-screen menu (under the header, above everything else) */}
      {open && (
        <div data-nav-overlay className="menu-overlay fixed inset-0 z-40 h-dvh overflow-hidden bg-[#0b0b0b]">
          <nav className="mx-auto grid h-full w-full max-w-[1560px] grid-cols-1 content-start gap-x-10 gap-y-1 px-8 pt-28 md:[grid-template-columns:1fr_1fr_1.35fr] md:pt-40">
            {MENU_COLUMNS.map((column, c) => (
              <ul key={c} className="flex flex-col">
                {column.map((l) => {
                  const delay = `${0.05 + linkIndex++ * 0.03}s`
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
        {/* legibility scrim: white header content can vanish over a bright hero
            top (overlay-free images). A soft top gradient guarantees contrast.
            Only in white mode, fades out once condensed (pill has its own bg). */}
        {!open && headerDark && (
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-x-0 top-0 h-36 transition-opacity duration-500 ${
              condensed ? 'opacity-0' : 'opacity-100'
            }`}
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.22) 45%, transparent)' }}
          />
        )}
        {/* expanded bar */}
        <div
          className={`mx-auto flex w-full items-center justify-between px-4 pt-6 pb-3 transition-all duration-500 sm:px-8 md:px-12 ${
            condensed && !open
              ? 'pointer-events-none -translate-y-8 opacity-0'
              : 'translate-y-0 opacity-100'
          }`}
        >
          <div className={`flex items-center gap-4 transition-colors duration-300 ${barDark ? 'text-white' : 'text-black'}`}>
            <button
              aria-expanded={open}
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
              className="flex cursor-pointer flex-col items-start gap-[7px] p-2"
            >
              <span className={`block h-[2px] rounded bg-current transition-all duration-300 ${open ? 'w-8 translate-y-[9px] rotate-45' : 'w-9'}`} />
              <span className={`block h-[2px] rounded bg-current transition-all duration-200 ${open ? 'w-8 opacity-0' : 'w-6'}`} />
              <span className={`block h-[2px] rounded bg-current transition-all duration-300 ${open ? 'w-8 -translate-y-[9px] -rotate-45' : 'w-[30px]'}`} />
            </button>
            <Link
              href="/"
              aria-label="Jungle Boys home"
              onClick={() => setOpen(false)}
              className="block h-12 w-16 transition-transform duration-200 hover:scale-105 sm:h-14 sm:w-20 md:h-16 md:w-24"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
              <img
                src={barDark ? BRAND_ASSETS.logoWhite : BRAND_ASSETS.logoBlack}
                alt="Jungle Boys"
                className="h-full w-full object-contain"
              />
            </Link>
          </div>

          {!open && (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                aria-label="Log in to your account"
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-transform duration-200 hover:scale-105 sm:h-12 sm:w-12 ${
                  headerDark ? 'border-white text-white' : 'border-black text-black'
                }`}
              >
                <UserIcon className="h-5 w-5" />
              </Link>
              <PillCta label="Shop" href="/products" icon="cart" className="shrink-0" />
              <div
                className={`hidden shrink-0 items-center gap-4 rounded-full border-2 px-5 py-3 transition-colors duration-300 md:flex ${
                  headerDark ? 'border-white text-white' : 'border-black text-black'
                }`}
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
              <ThemeToggle className={`shrink-0 ${headerDark ? 'border-white text-white' : 'border-black text-black'}`} />
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
          <div
            className={`flex items-center gap-4 rounded-full border py-2 pl-4 pr-3 shadow-2xl backdrop-blur-md ${
              onDarkPage
                ? 'border-black/10 bg-white/95 text-black'
                : 'border-white/10 bg-[#0b0b0b]/90 text-white'
            }`}
          >
            <button
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className="flex cursor-pointer flex-col items-start gap-[5px] p-1"
            >
              <span className="block h-[2px] w-7 rounded bg-current" />
              <span className="block h-[2px] w-5 rounded bg-current" />
              <span className="block h-[2px] w-6 rounded bg-current" />
            </button>
            <Link href="/" aria-label="Jungle Boys home" className="block h-10 w-14">
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
              <img
                src={onDarkPage ? BRAND_ASSETS.logoBlack : BRAND_ASSETS.logoWhite}
                alt="Jungle Boys"
                className="h-full w-full object-contain"
              />
            </Link>
            <span className={`h-5 w-px ${onDarkPage ? 'bg-black/20' : 'bg-white/20'}`} aria-hidden />
            <Link
              href="/login"
              aria-label="Log in to your account"
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-transform duration-200 hover:scale-110 ${
                onDarkPage ? 'border-black text-black' : 'border-white text-white'
              }`}
            >
              <UserIcon className="h-4 w-4" />
            </Link>
            <PillCta label="Shop" href="/products" icon="cart" size="sm" className="hidden sm:inline-flex" />
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
            <ThemeToggle className={`shrink-0 ${onDarkPage ? 'border-black text-black' : 'border-white text-white'}`} />
          </div>
        </div>
      </header>
    </>
  )
}
