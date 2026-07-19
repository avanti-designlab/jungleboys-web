'use client'

import Image from 'next/image'
import { useState } from 'react'
import { REWARDS_FAQ } from '@/lib/rewards-content'
import { Scrub, SplitHeading } from './motion'

// FAQ accordion under a storefront-photo banner. Letter-reveal banner title;
// questions rise in sequence with scroll (live-page parity). Answers render
// in the DOM (hidden via CSS when closed) so crawlers always see them.

export default function RewardsFaq() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="px-6 py-16 md:px-12 md:py-24 lg:px-20">
      <div className="mx-auto max-w-5xl">
        <div className="relative h-56 overflow-hidden rounded-[2rem] bg-[#131313] md:h-72">
          <Image
            src="/rewards/faq-photo-1.png"
            alt=""
            aria-hidden
            width={473}
            height={346}
            sizes="45vw"
            className="absolute -left-6 top-1/2 w-[42%] max-w-[380px] -translate-y-1/2 opacity-80"
          />
          <Image
            src="/rewards/faq-photo-2.png"
            alt=""
            aria-hidden
            width={589}
            height={431}
            sizes="45vw"
            className="absolute -right-6 top-1/2 w-[44%] max-w-[400px] -translate-y-1/2 opacity-90"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <SplitHeading
              mode="letters"
              start="top 70%"
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
                      ? 'my-4 rounded-2xl border border-[var(--color-accent)] px-6 py-5'
                      : 'border-b border-[var(--color-accent)]'
                  }
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full cursor-pointer items-center justify-between gap-6 py-4 text-left"
                  >
                    <span className="text-sm font-extrabold uppercase tracking-wide text-white md:text-base">
                      {f.question}
                    </span>
                    <span
                      aria-hidden
                      className={`text-[var(--color-accent)] transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    >
                      <svg viewBox="0 0 20 12" className="h-3 w-5" fill="currentColor">
                        <path d="M0 0h20L10 12z" />
                      </svg>
                    </span>
                  </button>
                  <p
                    className={`text-xs font-semibold uppercase leading-relaxed tracking-wide text-white/85 ${
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
