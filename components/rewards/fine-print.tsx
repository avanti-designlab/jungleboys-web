'use client'

import { useState } from 'react'
import { FINE_PRINT } from '@/lib/rewards-content'
import { Scrub, SplitHeading } from './motion'

// "The fine print" — four cards in a row; click a card to expand its terms.

export default function FinePrint() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="px-6 pb-24 pt-8 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <SplitHeading
          mode="letters"
          className="text-center text-3xl font-extrabold uppercase tracking-tight text-[var(--color-foreground)] md:text-4xl xl:text-5xl"
          lines={[{ text: 'The' }, { text: 'Fine Print', accent: true }]}
        />
        <Scrub className="mt-12 grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-4" end="bottom 90%">
          {FINE_PRINT.map((s, i) => {
            const isOpen = open === i
            return (
              <div
                key={s.title}
                data-reveal="rise"
                className={`rounded-3xl border bg-[var(--color-surface)] transition-all duration-300 ${
                  isOpen
                    ? 'border-[var(--color-accent)] shadow-[0_0_36px_rgba(254,207,14,0.18)]'
                    : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/60'
                }`}
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 px-6 py-6 text-left"
                >
                  <span className="text-sm font-extrabold uppercase leading-tight tracking-wide text-[var(--color-foreground)]">
                    {s.title}
                  </span>
                  <span
                    aria-hidden
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-black transition-transform duration-300 ${
                      isOpen ? 'rotate-45' : ''
                    }`}
                  >
                    <svg viewBox="0 0 12 12" className="h-3 w-3" stroke="currentColor" strokeWidth="2" fill="none">
                      <path d="M6 1v10M1 6h10" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <ul className="space-y-2 px-6 pb-6 text-[11px] font-bold uppercase leading-relaxed tracking-wide text-[var(--color-muted)]">
                      {s.bullets.map((b) => (
                        <li key={b} className="flex gap-2">
                          <span aria-hidden className="text-[var(--color-accent-ink)]">•</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )
          })}
        </Scrub>
      </div>
    </section>
  )
}
