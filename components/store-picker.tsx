'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { CA_OWNED, FL_OWNED } from '@/lib/owned-stores'
import { menuPathFor, writeStore } from '@/lib/store-selection'

// "Select a location" — the gateway to every commerce surface.
//
// Inventory, pricing and specials differ per store, so a shop page cannot render
// honestly until this is answered. Closes the CA/FL selection that was moved out
// of the age gate and deferred to Phase 3 (Avanti, 2026-07-19).
//
// Brand surface: dark in both themes, like the age gate and menu overlay. The
// scrim is /90 rather than /70 on purpose — at /70 the page behind sets the
// ground, which made the age gate's own copy change contrast with the theme and
// fail AA in light. Do not lower it.

export default function StorePicker({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    closeRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      // Focus trap. Without it, Tab walks out of the dialog into the page
      // underneath, which is still there and still focusable.
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      )
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
  }, [open, onClose])

  if (!open) return null

  const choose = (slug: string, state: 'CA' | 'FL') => {
    writeStore(slug, state)
    onClose()
    router.push(menuPathFor(slug, state))
  }

  const group = (label: string, stores: typeof CA_OWNED, state: 'CA' | 'FL') => (
    <section aria-labelledby={`sp-${state}`}>
      <h3
        id={`sp-${state}`}
        className="px-1 pb-2 pt-5 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent)]"
        style={{ fontFamily: 'var(--font-brand)' }}
      >
        {label}
      </h3>
      <ul className="space-y-2">
        {stores.filter((s) => !s.external).map((s) => (
          <li key={s.slug}>
            <button
              type="button"
              onClick={() => choose(s.slug, state)}
              className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left transition hover:border-[var(--color-accent)] hover:bg-white/[0.08] focus-visible:border-[var(--color-accent)]"
            >
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/10">
                <Image src={s.image} alt="" fill sizes="64px" className="object-cover" />
              </span>
              <span className="min-w-0">
                <span
                  className="block text-base font-extrabold uppercase leading-tight text-white"
                  style={{ fontFamily: 'var(--font-brand)' }}
                >
                  {s.name}
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-white/70">
                  {s.street}, {s.city}, {s.state} {s.zip}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="store-picker-title"
      data-nav-ignore
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
    >
      <div
        ref={panelRef}
        className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0b]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <h2
            id="store-picker-title"
            className="font-display text-3xl uppercase leading-none text-white md:text-4xl"
          >
            Select a location
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close location picker"
            className="-mr-1 -mt-1 rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-6 pb-6">
          {group('California', CA_OWNED, 'CA')}
          {group('Florida', FL_OWNED, 'FL')}
        </div>
      </div>
    </div>
  )
}
