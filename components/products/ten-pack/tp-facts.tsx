'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// 1 FOR NOW, 9 FOR LATER. The line splits: "1" lands on its own, then the "9"
// counts itself up from 1 to 9 as the eight claims deal in from alternating
// sides. The counter is the joke made literal — you watch the nine stack up.

const CLAIMS = [
  'Consistent quality in every joint',
  'Crafted with indoor nugs',
  'Strain-specific packs',
  'Freshly rolled in small batches',
  'Perfect for sharing or stocking up',
  'Sealed for freshness',
  'Clean burn, smooth smoke',
  'Great price-to-quality ratio',
]

export default function TpFacts() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add(
        { reduce: '(prefers-reduced-motion: reduce)', noPref: '(prefers-reduced-motion: no-preference)' },
        (mmCtx) => {
          const c = mmCtx.conditions as Record<string, boolean>
          if (c.reduce) return

          const tl = gsap.timeline({
            scrollTrigger: { trigger: root, start: 'top 72%', end: 'bottom 70%', scrub: 0.7 },
          })

          tl.from('[data-tp-line]', { opacity: 0, yPercent: 26, duration: 0.3, ease: 'power3.out' }, 0)

          // the nine counts itself up
          const nine = root.querySelector<HTMLElement>('[data-tp-nine]')
          if (nine) {
            const counter = { v: 1 }
            tl.to(counter, {
              v: 9, duration: 0.4, ease: 'none',
              onUpdate: () => { nine.textContent = String(Math.round(counter.v)) },
            }, 0.18)
          }

          CLAIMS.forEach((_, i) => {
            tl.from(`[data-tp-claim="${i}"]`,
              { opacity: 0, x: i % 2 === 0 ? -50 : 50, duration: 0.22, ease: 'power2.out' },
              0.24 + i * 0.055)
          })
        }
      )
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative z-10 px-2 py-2 md:px-3 md:py-3">
      <div
        data-nav-theme="dark"
        className="relative overflow-hidden rounded-[1.75rem] px-5 py-16 text-white md:rounded-[2.5rem] md:px-10 md:py-24"
        style={{ background: 'linear-gradient(180deg,#0b5897 0%,#083f6e 58%,#061f38 100%)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- texture */}
        <img src="/products/10-pack/smoke.webp" alt="" aria-hidden
          className="tp-smoke-b pointer-events-none absolute inset-x-0 bottom-0 h-[60%] w-full object-cover opacity-25 mix-blend-screen" />

        <div className="relative mx-auto max-w-[1180px]">
          <h2 data-tp-line className="font-display text-center uppercase leading-[0.84] text-white will-change-transform"
            style={{ fontSize: 'min(11vw, 5.4rem)', letterSpacing: '-0.03em' }}>
            1 for now, <span data-tp-nine className="text-[var(--tp-cyan)]">9</span> for later.
          </h2>

          <ul className="mt-10 grid grid-cols-1 gap-2.5 md:mt-14 md:grid-cols-2 md:gap-3">
            {CLAIMS.map((claim, i) => (
              <li key={claim} data-tp-claim={i}
                className="flex items-center gap-3 rounded-full bg-white/[0.09] px-4 py-3 backdrop-blur-sm will-change-transform md:gap-4 md:px-5 md:py-3.5">
                <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--tp-cyan)] text-[12px] font-black leading-none text-[#052033] md:h-8 md:w-8">
                  ✓
                </span>
                <span className="text-[11px] font-extrabold uppercase leading-tight tracking-wide text-white md:text-[14px]"
                  style={{ fontFamily: 'var(--font-brand)' }}>
                  {claim}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
