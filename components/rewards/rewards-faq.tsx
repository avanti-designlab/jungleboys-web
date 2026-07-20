'use client'

import Image from 'next/image'
import { useState } from 'react'
import { REWARDS_FAQ } from '@/lib/rewards-content'
import { Scrub, SplitHeading } from './motion'

// FAQ — clean full-bleed storefront banner (deskewed photo, no tilt) with
// letter-reveal title; questions rise in sequence. Theme-aware. Answers stay
// in the DOM (hidden via CSS when closed) so crawlers always see them.

export default function RewardsFaq() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="px-6 py-16 md:px-12 md:py-24 lg:px-20">
      <div className="mx-auto max-w-5xl">
        <div className="relative h-60 overflow-hidden rounded-[2rem] md:h-80">
          <Image
            src="/rewards/faq-straight-2.jpg"
            alt="Jungle Boys storefront"
            fill
            sizes="(max-width: 1024px) 96vw, 1024px"
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/45">
            <SplitHeading
              mode="letters"
              start="top 70%"
              accentClass="text-[var(--color-accent)]"
              className="px-6 text-center text-3xl font-extrabold uppercase leading-[1.1] tracking-tight text-white md:text-5xl"
              lines={[{ text: 'Frequently Asked Questions' }]}
            />
          </div>
        </div>

        <Scrub className="mt-12" end="bottom 90%">
          <div style={{ fontFamily: 'var(--font-brand)' }}>
            {REWARDS_FAQ.map((f, i) => {
              const isOpen = open === i
              return (
                <div
                  key={f.question}
                  data-reveal="rise"
                  className={
                    isOpen
                      ? 'my-4 rounded-2xl border border-[var(--color-accent)] bg-[var(--color-surface)] px-6 py-5'
                      : 'border-b border-[var(--color-accent)]/60'
                  }
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full cursor-pointer items-center justify-between gap-6 py-4 text-left"
                  >
                    <span className="text-sm font-extrabold uppercase tracking-wide text-[var(--color-foreground)] md:text-base">
                      {f.question}
                    </span>
                    <span
                      aria-hidden
                      className={`text-[var(--color-accent-ink)] transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    >
                      <svg viewBox="0 0 20 12" className="h-3 w-5" fill="currentColor">
                        <path d="M0 0h20L10 12z" />
                      </svg>
                    </span>
                  </button>
                  <p
                    className={`text-xs font-semibold uppercase leading-relaxed tracking-wide text-[var(--color-muted)] ${
                      isOpen ? 'pb-3' : 'hidden'
                    }`}
                  >
                    {f.answer}
                  </p>
                </div>
              )
            })}
          </div>
        </Scrub>
      </div>
    </section>
  )
}
