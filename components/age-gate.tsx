'use client'

import { useEffect, useRef, useState } from 'react'
import NeonLogo from './neon-logo'

// 21+ gate — matches the live design Avanti confirmed (2026-07-19):
// yellow WELCOME headline, simple YES/NO, mascot characters on the buttons.
// (DOB entry dropped by owner decision; counsel reviews before cutover.)
// Client overlay only: server-rendered content stays crawlable underneath.

const STORAGE_KEY = 'jb-age-gate'
const VALID_DAYS = 30
const MASCOT_YES = '/brand/mascot-yes.webp'
const MASCOT_NO = '/brand/mascot-no.webp'

export function isAgeVerified(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const parsed: { verifiedAt: number } = JSON.parse(raw)
    return Date.now() - parsed.verifiedAt < VALID_DAYS * 864e5
  } catch {
    return false
  }
}

export default function AgeGate() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isAgeVerified()) return
    let introPending = false
    try {
      introPending = sessionStorage.getItem('jb-intro-done') !== '1'
    } catch {}
    if (!introPending) {
      const id = requestAnimationFrame(() => setOpen(true))
      return () => cancelAnimationFrame(id)
    }
    // mount the gate fresh as the intro curtains split, so its entrance is seen
    const onIntroDone = () => setOpen(true)
    window.addEventListener('jb:intro-done', onIntroDone, { once: true })
    return () => window.removeEventListener('jb:intro-done', onIntroDone)
  }, [])

  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    // Focus the PANEL, not the YES button. Script-focusing a button on open
    // counts as :focus-visible, so the global two-tone focus ring drew a
    // second (yellow) outline around YES for every visitor — Avanti flagged
    // the double outline (2026-08-03). Dialog pattern: container takes focus
    // (tabIndex -1, excluded from the ring rule); first Tab lands on YES and
    // keyboard users still get their ring.
    panel?.focus()
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !panel) return
      const items = panel.querySelectorAll<HTMLElement>('button, a')
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
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', trap)
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  function enter() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ verifiedAt: Date.now() }))
    setOpen(false)
    window.dispatchEvent(new CustomEvent('jb:gate-passed'))
  }

  // Scrim is near-opaque on purpose: at /70 the page BEHIND set the ground, so
  // this surface changed with the theme despite being specified to stay dark in
  // both. In light that put the 21+ line at 4.31:1.
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Age verification"
      data-nav-ignore
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        // outline-none: the panel takes initial focus as a script-focus target,
        // and without this the BROWSER'S default blue ring draws around the
        // whole gate (the custom focus rule excludes tabindex=-1, so the UA
        // default applies). Keyboard users are unaffected — Tab moves focus to
        // the buttons, which keep the real ring.
        className="flex w-full max-w-2xl flex-col items-center gap-8 px-6 text-center outline-none md:max-w-4xl"
      >
        <div className="flex flex-col items-center gap-5">
          <NeonLogo className="gate-in h-24 w-auto md:h-28" />
          <h1
            className="gate-in font-display whitespace-nowrap text-[clamp(1.9rem,8.2vw,3.5rem)] uppercase text-[var(--color-accent)]"
            style={{ animationDelay: '0.15s' }}
          >
            Welcome to the Jungle
          </h1>
          <p
            className="gate-in text-sm md:text-base font-bold uppercase tracking-wide text-[#b9b9b9]"
            style={{ fontFamily: 'var(--font-brand)', animationDelay: '0.3s' }}
          >
            You must be 21+ years old to enter this site
          </p>
        </div>

        <div className="gate-in mt-14 flex w-full max-w-md flex-col gap-6 md:mt-16 md:max-w-none md:flex-row md:gap-8" style={{ animationDelay: '0.45s' }}>
          <button
            onClick={enter}
            className="group relative flex-1 cursor-pointer rounded-[14px] border-2 border-[#d7d7d7] px-6 py-8 outline-none transition-colors duration-200 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)] focus-visible:border-[var(--color-accent)]"
          >
            <span className="mascot-clip pointer-events-none absolute -left-12 bottom-0 h-44 w-44 md:-left-16 md:h-52 md:w-52">
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset, no optimization needed */}
              <img src={MASCOT_YES} alt="" style={{ animationDelay: '0.35s' }} className="h-full w-full object-contain object-bottom" />
            </span>
            <span className="font-display block pl-16 text-5xl uppercase text-white transition-colors duration-200 group-hover:text-black md:pl-20 md:text-6xl">
              Yes, I&apos;m 21+
            </span>
          </button>

          <a
            href="https://www.google.com"
            className="group relative block flex-1 cursor-pointer rounded-[14px] border-2 border-[#d7d7d7] px-6 py-8 outline-none transition-colors duration-200 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)] focus-visible:border-[var(--color-accent)]"
          >
            <span className="font-display block pr-16 text-5xl uppercase text-white transition-colors duration-200 group-hover:text-black md:pr-20 md:text-6xl">
              No, I&apos;m not
            </span>
            <span className="mascot-clip pointer-events-none absolute -right-16 bottom-0 h-44 w-44 md:-right-24 md:h-52 md:w-52">
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset, no optimization needed */}
              <img src={MASCOT_NO} alt="" style={{ animationDelay: '0.5s' }} className="h-full w-full object-contain object-bottom" />
            </span>
          </a>
        </div>
      </div>
    </div>
  )
}
