'use client'

import Image from 'next/image'
import { useState } from 'react'
import { REWARDS_FAQ } from '@/lib/rewards-content'

// FAQ accordion under a storefront-photo banner. Answers render in the DOM
// (hidden via CSS when closed) so crawlers always see them.

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
            <h2
              className="px-6 text-center text-3xl font-extrabold uppercase leading-[1.1] tracking-tight text-white md:text-5xl"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              Frequently Asked Questions
            </h2>
          </div>
        </div>

        <div className="mt-12" style={{ fontFamily: 'var(--font-brand)' }}>
          {REWARDS_FAQ.map((f, i) => {
            const isOpen = open === i
            return (
              <div
                key={f.question}
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
      </div>
    </section>
  )
}
