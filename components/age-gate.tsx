'use client'

import { useEffect, useRef, useState } from 'react'

// 21+ gate — matches the live design Avanti confirmed (2026-07-19):
// yellow WELCOME headline, simple YES/NO, mascot characters on the buttons.
// (DOB entry dropped by owner decision; counsel reviews before cutover.)
// Client overlay only: server-rendered content stays crawlable underneath.

const STORAGE_KEY = 'jb-age-gate'
const VALID_DAYS = 30
const CDN = 'https://cdn.prod.website-files.com/6981ad8672f6252d7d7bb320'
const MASCOT_YES = `${CDN}/699dec7c3642bdd71693423e_Asset%201%404x%201.svg`
const MASCOT_NO = `${CDN}/69ce1258c60c35f38358e867_Group%20378.svg`

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
    if (!isAgeVerified()) {
      const id = requestAnimationFrame(() => setOpen(true))
      return () => cancelAnimationFrame(id)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    panel?.querySelector<HTMLElement>('button')?.focus()
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
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Age verification"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
    >
      <div
        ref={panelRef}
        className="w-full max-w-2xl rounded-[var(--radius-lg)] bg-[#0b0b0b] px-6 py-12 md:px-16 md:py-16 flex flex-col items-center gap-8 text-center"
      >
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-5xl md:text-7xl uppercase text-[var(--color-accent)]">
            Welcome to the Jungle
          </h1>
          <p
            className="text-sm md:text-base font-bold uppercase tracking-wide text-[#b9b9b9]"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            You must be 21+ years old to enter this site
          </p>
        </div>

        <div className="flex w-full max-w-md flex-col gap-5">
          <button
            onClick={enter}
            className="group relative cursor-pointer rounded-[14px] border-2 border-[#d7d7d7] px-6 py-7 transition-colors duration-200 hover:border-[var(--color-accent)]"
          >
            <span className="mascot-clip pointer-events-none absolute -left-4 bottom-0 h-40 w-40 md:-left-8 md:h-48 md:w-48">
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset, no optimization needed */}
              <img src={MASCOT_YES} alt="" style={{ animationDelay: '0.35s' }} className="h-full w-full object-contain object-bottom" />
            </span>
            <span className="font-display pl-24 text-4xl md:text-5xl uppercase text-white md:pl-28">
              Yes, im 21+
            </span>
          </button>

          <a
            href="https://www.google.com"
            className="group relative block cursor-pointer rounded-[14px] border-2 border-[#d7d7d7] px-6 py-7 transition-colors duration-200 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]"
          >
            <span className="font-display pr-24 text-4xl md:text-5xl uppercase text-white transition-colors duration-200 group-hover:text-black md:pr-28">
              No, I&apos;m not
            </span>
            <span className="mascot-clip pointer-events-none absolute -right-4 bottom-0 h-40 w-40 md:-right-8 md:h-48 md:w-48">
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset, no optimization needed */}
              <img src={MASCOT_NO} alt="" style={{ animationDelay: '0.5s' }} className="h-full w-full object-contain object-bottom" />
            </span>
          </a>
        </div>
      </div>
    </div>
  )
}
