'use client'

import Image from 'next/image'
import { useState } from 'react'
import { REWARDS_FAQ } from '@/lib/rewards-content'
import { Scrub, SplitHeading } from './motion'

// FAQ — slim banner built from the Figma storefront photos (deskewed strip),
// letter-reveal title, and card-style accordion items matching the page.

const BANNER_PHOTOS = ['/rewards/faq-straight-1.jpg', '/rewards/faq-straight-2.jpg']

export default function RewardsFaq() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="px-6 py-16 md:px-12 md:py-24 lg:px-20">
      <div className="mx-auto max-w-5xl">
        <div className="relative h-40 overflow-hidden rounded-[2rem] md:h-52">
          <div className="absolute inset-0 grid grid-cols-2">
            {BANNER_PHOTOS.map((src) => (
              <div key={src} className="relative">
                <Image src={src} alt="" aria-hidden fill sizes="50vw" className="object-cover" />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/55">
            <SplitHeading
              mode="letters"
              start="top 75%"
              accentClass="text-[var(--color-accent)]"
              className="px-6 text-center text-3xl font-extrabold uppercase leading-[1.1] tracking-tight text-white md:text-4xl"
              lines={[{ text: 'Frequently Asked Questions' }]}
            />
          </div>
        </div>

        <Scrub enter start="top 80%" className="mt-10 space-y-3">
          {REWARDS_FAQ.map((f, i) => {
            const isOpen = open === i
            return (
              <div
                key={f.question}
                data-reveal="rise"
                className={`rounded-2xl border bg-[var(--color-surface)] px-6 transition-all duration-300 ${
                  isOpen
                    ? 'border-[var(--color-accent)] shadow-[0_0_32px_rgba(254,207,14,0.16)]'
                    : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/50'
                }`}
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left"
                >
                  <span className="text-sm font-extrabold uppercase tracking-wide text-[var(--color-foreground)] md:text-base">
                    {f.question}
                  </span>
                  <span
                    aria-hidden
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-black transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  >
                    <svg viewBox="0 0 20 12" className="h-2.5 w-4" fill="currentColor">
                      <path d="M0 0h20L10 12z" />
                    </svg>
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pb-5 text-xs font-semibold uppercase leading-relaxed tracking-wide text-[var(--color-muted)]">
                      {f.answer}
                    </p>
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
