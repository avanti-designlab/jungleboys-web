'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// THE UPGRADE — a spec sheet that rewrites itself, on a flat red ground.
//
// Stacked, not side by side: heading, then ONE contained stage that hands over
// from the Milk Cart to the Gas Tank, then the six specs as a 2-up grid of
// chips underneath. Each chip flips on its X axis from the struck-out old spec
// (dark, muted) to the fixed one (JB yellow, black type) — so before and after
// occupy the exact same box and you read the swap rather than compare columns.
//
// Every element owns its own row, so the art can never crash into the type.

const ROWS: [string, string][] = [
  ['Smaller vapor output', 'Dense vapor production'],
  ['Occasional clogging', 'Optimized airflow, less clogging'],
  ['Standard airflow', 'Dual vents, balanced airflow'],
  ['Shorter battery life', 'Longer-lasting battery'],
  ['Standard heating', 'Stable, controlled heat'],
  ['Fades over time', 'Holds up the full lifecycle'],
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
            scrollTrigger: {
              trigger: root, start: 'top top', end: '+=110%',
              pin: true, scrub: 0.65, anticipatePin: 1, invalidateOnRefresh: true,
            },
          })

          // the stage hands over first, then the chips rewrite in a wave
          tl.to('[data-stage="old"]', { yPercent: 22, opacity: 0, filter: 'blur(9px)', ease: 'power2.in', duration: 0.24 }, 0.14)
            .fromTo('[data-stage="new"]',
              { yPercent: -18, opacity: 0, scale: 0.88, filter: 'blur(9px)' },
              { yPercent: 0, opacity: 1, scale: 1, filter: 'blur(0px)', ease: 'power3.out', duration: 0.3 }, 0.26)
            .to('[data-name="old"]', { opacity: 0, y: -10, duration: 0.16 }, 0.16)
            .fromTo('[data-name="new"]', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.2 }, 0.3)

          ROWS.forEach((_, i) => {
            tl.to(`[data-flip="${i}"]`, { rotateX: -180, ease: 'power2.inOut', duration: 0.17 }, 0.34 + i * 0.09)
          })
        }
      )
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={rootRef}
      data-nav-theme="dark"
      className="relative z-10 flex h-screen min-h-[660px] items-center overflow-hidden px-4 pt-16 text-white md:pt-0"
      style={{ background: 'linear-gradient(180deg,#d51f10 0%,#b0140a 58%,#7d0d05 100%)' }}
    >
      <div className="mx-auto flex w-full max-w-[1000px] flex-col items-center">
        <h2 className="font-display text-center uppercase leading-[0.84]" style={{ fontSize: 'min(11vw, 4.6rem)' }}>
          Everything <span className="text-[var(--gt-yellow)]">we fixed.</span>
        </h2>

        {/* ── one contained stage, two generations ── */}
        <div className="relative mt-5 h-[21vh] max-h-[230px] w-full md:mt-8 md:h-[33vh] md:max-h-[350px]">
          <div data-stage="old" className="absolute inset-0 flex items-end justify-center gap-2 will-change-transform">
            {/* eslint-disable-next-line @next/next/no-img-element -- legacy product */}
            <img src="/products/gas-tank/milkcart-a.webp" alt="" aria-hidden className="h-[88%] w-auto drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)]" />
            {/* eslint-disable-next-line @next/next/no-img-element -- legacy product */}
            <img src="/products/gas-tank/milkcart-b.webp" alt="Milk Cart AIO" className="h-full w-auto drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)]" />
          </div>

          <div data-stage="new" className="absolute inset-0 flex items-end justify-center gap-1 opacity-0 will-change-transform">
            {/* eslint-disable-next-line @next/next/no-img-element -- product */}
            <img src="/products/gas-tank/device-flavors.webp" alt="" aria-hidden className="h-[82%] w-auto -rotate-[6deg] drop-shadow-[0_22px_36px_rgba(0,0,0,0.5)]" />
            {/* eslint-disable-next-line @next/next/no-img-element -- product */}
            <img src="/products/gas-tank/device-rosin.webp" alt="Gas Tank AIO" className="relative z-10 h-full w-auto drop-shadow-[0_28px_48px_rgba(0,0,0,0.6)]" />
            {/* eslint-disable-next-line @next/next/no-img-element -- product */}
            <img src="/products/gas-tank/device-resin.webp" alt="" aria-hidden className="h-[82%] w-auto rotate-[6deg] drop-shadow-[0_22px_36px_rgba(0,0,0,0.5)]" />
          </div>
        </div>

        {/* the name gets its own row so it can never collide with the art */}
        <div className="relative mt-3 h-7 w-full md:h-9">
          <span data-name="old" className="font-display absolute inset-x-0 text-center uppercase leading-none text-white/60" style={{ fontSize: 'min(6vw, 1.9rem)' }}>Milk Cart AIO</span>
          <span data-name="new" className="font-display absolute inset-x-0 text-center uppercase leading-none text-[var(--gt-yellow)] opacity-0" style={{ fontSize: 'min(6vw, 1.9rem)' }}>Gas Tank AIO</span>
        </div>

        {/* ── the ledger: 2-up chips that hug their type ── */}
        <ul className="mt-5 grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:mt-7 md:gap-2.5" style={{ perspective: '1100px' }}>
          {ROWS.map(([old, nu], i) => (
            <li key={old} className="relative h-[44px] md:h-[52px]">
              <div data-flip={i} className="absolute inset-0 [transform-style:preserve-3d] will-change-transform">
                {/* before */}
                <span className="absolute inset-0 flex items-center gap-2.5 rounded-xl bg-black/35 px-3.5 text-[11px] font-extrabold uppercase leading-tight tracking-wide text-white/75 [backface-visibility:hidden] md:px-4 md:text-[13px]"
                  style={{ fontFamily: 'var(--font-brand)' }}>
                  <span aria-hidden className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/15 text-[11px] leading-none text-white/80">✕</span>
                  <span className="line-through decoration-white/50 decoration-[1.5px]">{old}</span>
                </span>
                {/* after — pre-rotated so the flip lands it upright */}
                <span className="absolute inset-0 flex items-center gap-2.5 rounded-xl bg-[var(--gt-yellow)] px-3.5 text-[11px] font-extrabold uppercase leading-tight tracking-wide text-[#160c02] [backface-visibility:hidden] [transform:rotateX(180deg)] md:px-4 md:text-[13px]"
                  style={{ fontFamily: 'var(--font-brand)' }}>
                  <span aria-hidden className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#160c02] text-[11px] font-black leading-none text-[var(--gt-yellow)]">✓</span>
                  {nu}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
