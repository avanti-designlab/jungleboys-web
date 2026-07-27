'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// THE UPGRADE. Not two lists — ONE ledger that rewrites itself. A single stack
// of rows sits centred under one device stage. As you scroll each row physically
// flips on its X axis: the old Milk Cart spec (red, struck through) rolls away
// and the Gas Tank spec (yellow) rolls into its place. The device stage flips
// with them — the Milk Cart drops out of frame exactly as the last row turns.
//
// The whole section is pinned so the rewrite happens in one held frame instead
// of scrolling past you.

const ROWS: [string, string][] = [
  ['Smaller vapor output', 'Dense vapor production'],
  ['Occasional clogging', 'Optimized airflow, less clogging'],
  ['Standard airflow', 'Dual vents for balanced airflow'],
  ['Shorter battery life', 'Longer-lasting battery'],
  ['Standard heating', 'Stable, controlled heat delivery'],
  ['Fades over time', 'Holds up through the full lifecycle'],
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
              trigger: root, start: 'top top', end: '+=100%',
              pin: true, scrub: 0.65, anticipatePin: 1, invalidateOnRefresh: true,
            },
          })

          // the rows rewrite one at a time across the middle 70% of the scrub
          ROWS.forEach((_, i) => {
            const at = 0.12 + i * 0.11
            tl.to(`[data-flip="${i}"]`, { rotateX: -180, ease: 'power2.inOut', duration: 0.16 }, at)
          })

          // the stage hands over as the rows turn
          tl.to('[data-stage="old"]', { yPercent: 26, opacity: 0, filter: 'blur(10px)', ease: 'power2.in', duration: 0.28 }, 0.3)
            .fromTo('[data-stage="new"]',
              { yPercent: -22, opacity: 0, scale: 0.86, filter: 'blur(10px)' },
              { yPercent: 0, opacity: 1, scale: 1, filter: 'blur(0px)', ease: 'power3.out', duration: 0.34 }, 0.42)
            .to('[data-name="old"]', { opacity: 0, y: -12, duration: 0.2 }, 0.32)
            .fromTo('[data-name="new"]', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.24 }, 0.46)
            .fromTo('[data-glow]', { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, ease: 'power2.out', duration: 0.4 }, 0.42)
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
      className="relative z-10 flex h-screen min-h-[640px] items-center overflow-hidden bg-[var(--gt-ink)] px-4 text-white"
    >
      {/* a single hazard wall, barely there — texture, not noise */}
      <div aria-hidden className="gt-tri-field pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundSize: '150px' }} />

      <div className="relative mx-auto grid w-full max-w-[1180px] grid-cols-1 items-center gap-6 md:grid-cols-[0.85fr_1.15fr] md:gap-14">
        {/* ── one stage, two generations ── */}
        <div className="relative mx-auto h-[26vh] max-h-[300px] w-full md:h-[52vh] md:max-h-[520px]">
          <div data-glow aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[46vh] w-[46vh] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
            style={{ background: 'radial-gradient(circle, rgba(255,122,24,0.45) 0%, rgba(225,27,11,0.2) 42%, rgba(20,13,10,0) 72%)' }} />

          <div data-stage="old" className="absolute inset-0 flex items-end justify-center gap-2 will-change-transform">
            {/* eslint-disable-next-line @next/next/no-img-element -- legacy product */}
            <img src="/products/gas-tank/milkcart-a.webp" alt="" aria-hidden className="h-[86%] w-auto drop-shadow-[0_18px_34px_rgba(0,0,0,0.5)]" />
            {/* eslint-disable-next-line @next/next/no-img-element -- legacy product */}
            <img src="/products/gas-tank/milkcart-b.webp" alt="Milk Cart AIO" className="h-[96%] w-auto drop-shadow-[0_18px_34px_rgba(0,0,0,0.5)]" />
          </div>

          <div data-stage="new" className="absolute inset-0 flex items-end justify-center gap-1 opacity-0 will-change-transform">
            {/* eslint-disable-next-line @next/next/no-img-element -- product */}
            <img src="/products/gas-tank/device-flavors.webp" alt="" aria-hidden className="h-[84%] w-auto -rotate-[6deg] drop-shadow-[0_26px_44px_rgba(0,0,0,0.6)]" />
            {/* eslint-disable-next-line @next/next/no-img-element -- product */}
            <img src="/products/gas-tank/device-rosin.webp" alt="Gas Tank AIO" className="relative z-10 h-full w-auto drop-shadow-[0_34px_60px_rgba(0,0,0,0.7)]" />
            {/* eslint-disable-next-line @next/next/no-img-element -- product */}
            <img src="/products/gas-tank/device-resin.webp" alt="" aria-hidden className="h-[84%] w-auto rotate-[6deg] drop-shadow-[0_26px_44px_rgba(0,0,0,0.6)]" />
          </div>

          <div className="absolute inset-x-0 bottom-[-2.2rem] text-center md:bottom-[-3rem]">
            <span data-name="old" className="font-display absolute inset-x-0 uppercase leading-none text-white/45" style={{ fontSize: 'min(7vw, 2.4rem)' }}>Milk Cart AIO</span>
            <span data-name="new" className="font-display absolute inset-x-0 uppercase leading-none text-[var(--gt-yellow)] opacity-0" style={{ fontSize: 'min(7vw, 2.4rem)' }}>Gas Tank AIO</span>
          </div>
        </div>

        {/* ── the ledger that rewrites itself ── */}
        <div className="mt-12 md:mt-0">
          <h2 className="font-display uppercase leading-[0.84]" style={{ fontSize: 'min(9vw, 4.2rem)' }}>
            Everything <br />
            <span className="text-[var(--gt-red)]">we fixed.</span>
          </h2>

          <ul className="mt-5 space-y-2 md:mt-7 md:space-y-2.5" style={{ perspective: '1000px' }}>
            {ROWS.map(([old, nu], i) => (
              <li key={old} className="relative h-[42px] md:h-[52px]">
                <div data-flip={i} className="absolute inset-0 [transform-style:preserve-3d] will-change-transform">
                  {/* old — front */}
                  <span className="absolute inset-0 flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 text-[10px] font-extrabold uppercase tracking-wide text-white/40 [backface-visibility:hidden] md:px-5 md:text-[13px]"
                    style={{ fontFamily: 'var(--font-brand)' }}>
                    <span aria-hidden className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/10 text-[11px] leading-none text-white/50">✕</span>
                    <span className="line-through decoration-[var(--gt-red)] decoration-2">{old}</span>
                  </span>
                  {/* new — back, pre-rotated so the flip lands it upright */}
                  <span className="absolute inset-0 flex items-center gap-3 rounded-full border border-[var(--gt-yellow)]/45 bg-[linear-gradient(90deg,rgba(225,27,11,0.22),rgba(255,122,24,0.16))] px-4 text-[10px] font-extrabold uppercase tracking-wide text-white [backface-visibility:hidden] [transform:rotateX(180deg)] md:px-5 md:text-[13px]"
                    style={{ fontFamily: 'var(--font-brand)' }}>
                    <span aria-hidden className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--gt-yellow)] text-[11px] font-black leading-none text-[var(--gt-black)]">✓</span>
                    {nu}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
