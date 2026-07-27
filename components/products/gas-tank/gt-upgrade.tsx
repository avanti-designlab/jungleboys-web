'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// FROM MILK CART TO GAS TANK. The two generations sit side by side and the
// spec rows deal in one pair at a time — the old (red, struck) from the left,
// the new (green) from the right — so you read it as a head-to-head rather
// than two lists. The old cart also desaturates as the new one lights up.

const ROWS: [string, string][] = [
  ['Smaller vapor output', 'Dense vapor production'],
  ['Occasional clogging', 'Optimized airflow to reduce clogging'],
  ['Standard airflow', 'Dual air vents for balanced airflow'],
  ['Shorter battery life', 'Longer-lasting battery performance'],
  ['Standard heating', 'Stable, controlled heat delivery'],
  ['Inconsistent pull over time', 'Maintains performance through full lifecycle'],
]

export default function GtUpgrade() {
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
            scrollTrigger: { trigger: root, start: 'top 74%', end: 'bottom 62%', scrub: 0.6 },
          })
          tl.from('[data-old-dev]', { opacity: 0, x: -60, duration: 0.6, ease: 'power2.out' }, 0)
            .from('[data-new-dev]', { opacity: 0, x: 60, duration: 0.6, ease: 'power2.out' }, 0.1)
            .to('[data-old-dev]', { filter: 'grayscale(0.85)', opacity: 0.72, duration: 0.8 }, 0.9)
          ROWS.forEach((_, i) => {
            const at = 0.55 + i * 0.34
            tl.from(`[data-old="${i}"]`, { opacity: 0, x: -40, duration: 0.3, ease: 'power2.out' }, at)
              .from(`[data-new="${i}"]`, { opacity: 0, x: 40, duration: 0.3, ease: 'power2.out' }, at + 0.1)
          })
        }
      )
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative z-10 bg-white px-5 py-16 text-[var(--gt-ink)] md:py-24">
      <h2 className="text-center font-display uppercase leading-[0.9] text-[var(--gt-ink)]" style={{ fontSize: 'min(9vw, 4.4rem)' }}>
        From Milk Cart <span className="italic text-[var(--gt-red)]">to</span> Gas Tank
      </h2>

      <div className="mx-auto mt-10 grid w-full max-w-[1080px] grid-cols-2 gap-5 md:mt-14 md:gap-12">
        {/* ── old ── */}
        <div className="flex flex-col items-center">
          <div data-old-dev className="flex h-[26vh] max-h-[280px] items-end gap-2 will-change-transform">
            {/* eslint-disable-next-line @next/next/no-img-element -- legacy product */}
            <img src="/products/gas-tank/milkcart-a.webp" alt="" aria-hidden className="h-full w-auto drop-shadow-[0_18px_30px_rgba(0,0,0,0.22)]" />
            {/* eslint-disable-next-line @next/next/no-img-element -- legacy product */}
            <img src="/products/gas-tank/milkcart-b.webp" alt="Milk Cart AIO" className="h-[92%] w-auto drop-shadow-[0_18px_30px_rgba(0,0,0,0.22)]" />
          </div>
          <p className="font-display mt-5 text-center text-2xl uppercase leading-none md:text-4xl">Milk Cart AIO</p>
          <ul className="mt-5 w-full space-y-2.5">
            {ROWS.map(([old], i) => (
              <li key={old} data-old={i}
                className="rounded-full bg-[linear-gradient(90deg,#8d1414,#c01d1d)] px-3 py-2 text-center text-[9px] font-extrabold uppercase leading-tight tracking-wide text-white/95 md:px-4 md:py-2.5 md:text-[11px]"
                style={{ fontFamily: 'var(--font-brand)' }}>
                {old}
              </li>
            ))}
          </ul>
        </div>

        {/* ── new ── */}
        <div className="flex flex-col items-center">
          <div data-new-dev className="flex h-[26vh] max-h-[280px] items-end gap-2 will-change-transform">
            {/* eslint-disable-next-line @next/next/no-img-element -- product */}
            <img src="/products/gas-tank/device-flavors.webp" alt="" aria-hidden className="h-[86%] w-auto drop-shadow-[0_20px_34px_rgba(0,0,0,0.26)]" />
            {/* eslint-disable-next-line @next/next/no-img-element -- product */}
            <img src="/products/gas-tank/device-resin.webp" alt="Gas Tank AIO" className="h-[92%] w-auto drop-shadow-[0_20px_34px_rgba(0,0,0,0.26)]" />
          </div>
          <p className="font-display mt-5 text-center text-2xl uppercase leading-none md:text-4xl">Gas Tank AIO</p>
          <ul className="mt-5 w-full space-y-2.5">
            {ROWS.map(([, nu], i) => (
              <li key={nu} data-new={i}
                className="rounded-full bg-[linear-gradient(90deg,#0f6b2f,#17913f)] px-3 py-2 text-center text-[9px] font-extrabold uppercase leading-tight tracking-wide text-white md:px-4 md:py-2.5 md:text-[11px]"
                style={{ fontFamily: 'var(--font-brand)' }}>
                {nu}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
