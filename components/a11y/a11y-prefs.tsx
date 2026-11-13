'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// Accessibility preferences — the site's OWN control, deliberately not a
// third-party overlay widget (Avanti confirmed 2026-11-12: real WCAG
// conformance in code is the compliance strategy; overlays are sued anyway
// and were FTC-fined for "automated compliance" claims). Three honest
// switches, persisted like jb-theme, applied as data attributes on <html>
// that globals.css styles. A boot script in the root layout applies the
// saved values pre-paint so there is no flash.
//
// Opens on the `jb:a11y-open` event (footer link, /accessibility page).

export const A11Y_KEY = 'jb-a11y'

type Prefs = { text: boolean; motion: boolean; contrast: boolean }

const DEFAULTS: Prefs = { text: false, motion: false, contrast: false }

function readPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(A11Y_KEY)
    if (!raw) return DEFAULTS
    const p = JSON.parse(raw)
    return { text: !!p.text, motion: !!p.motion, contrast: !!p.contrast }
  } catch {
    return DEFAULTS
  }
}

function apply(p: Prefs): void {
  const el = document.documentElement
  if (p.text) el.setAttribute('data-a11y-text', 'lg')
  else el.removeAttribute('data-a11y-text')
  if (p.motion) el.setAttribute('data-a11y-motion', 'reduce')
  else el.removeAttribute('data-a11y-motion')
  if (p.contrast) el.setAttribute('data-a11y-contrast', 'high')
  else el.removeAttribute('data-a11y-contrast')
}

export default function A11yPrefs() {
  const [open, setOpen] = useState(false)
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onOpen = () => {
      setPrefs(readPrefs())
      setOpen(true)
    }
    window.addEventListener('jb:a11y-open', onOpen)
    return () => window.removeEventListener('jb:a11y-open', onOpen)
  }, [])

  const close = useCallback(() => setOpen(false), [])

  // dialog conventions, same as the store picker: initial focus on the panel,
  // focus trapped, Escape closes
  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    panelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { close(); return }
      if (e.key !== 'Tab') return
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled])')
      if (!focusables?.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previouslyFocused?.focus()
    }
  }, [open, close])

  if (!open) return null

  const toggle = (key: keyof Prefs) => {
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    apply(next)
    try {
      localStorage.setItem(A11Y_KEY, JSON.stringify(next))
    } catch {
      // storage unavailable — the choice still applies for this page view
    }
  }

  const row = (key: keyof Prefs, label: string, hint: string) => (
    <button
      type="button"
      role="switch"
      aria-checked={prefs[key]}
      onClick={() => toggle(key)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-[var(--color-accent)]"
    >
      <span className="min-w-0">
        <span className="block text-sm font-extrabold uppercase tracking-wide text-white" style={{ fontFamily: 'var(--font-brand)' }}>
          {label}
        </span>
        <span className="mt-0.5 block text-xs leading-snug text-white/70">{hint}</span>
      </span>
      <span
        aria-hidden
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${prefs[key] ? 'bg-[var(--color-accent)]' : 'bg-white/15'}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${prefs[key] ? 'left-6' : 'left-1'}`}
        />
      </span>
    </button>
  )

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11y-prefs-title"
      data-nav-ignore
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0b] outline-none"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <h2 id="a11y-prefs-title" className="font-display text-3xl uppercase leading-none text-white">
            Accessibility
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close accessibility preferences"
            className="-mr-1 -mt-1 rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col gap-2.5 p-6">
          {row('text', 'Larger text', 'Increases the base text size across the site')}
          {row('motion', 'Reduce motion', 'Turns off animations and scroll effects')}
          {row('contrast', 'Higher contrast', 'Strengthens secondary text and borders')}
          <p className="mt-2 text-xs leading-relaxed text-white/60">
            Your choices are saved on this device. More on how this site supports assistive
            technology is on the{' '}
            <a href="/accessibility" className="font-bold text-[var(--color-accent)] underline-offset-4 hover:underline">
              accessibility page
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
