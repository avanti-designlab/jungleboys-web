'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// THE UPGRADE — a spec sheet that rewrites itself, on a red pill panel.
//
// Stacked, not side by side: heading, then ONE contained stage that hands over
// from the Milk Cart to the Gas Tank, then the six specs as full-width pill
// chips. Each chip flips on its X axis from the struck-out old spec (dark,
// muted) to the fixed one (JB yellow, black type) — so before and after occupy
// the exact same box and you read the swap rather than compare two columns.
//
// Both stages use the `-n` normalised art (one shared canvas, one shared body
// width per family), so `h-full w-auto` renders every item at a genuinely
// matching size instead of whatever its original crop happened to be.

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
          if (c.reduce) {
            // This one INVERTED the meaning: the old Milk Cart stayed, the new
            // Gas Tank never appeared, and the six chips never flipped — so the
            // section read as six unfixed defects under the heading
            // "Everything we fixed." Land the AFTER state directly.
            gsap.set('[data-stage="old"]', { opacity: 0 })
            gsap.set('[data-name="old"]', { opacity: 0 })
            gsap.set('[data-stage="new"]', { opacity: 1, scale: 1, y: 0 })
            gsap.set('[data-name="new"]', { opacity: 1, y: 0 })
            document.querySelectorAll('[data-flip]').forEach((el) =>
              gsap.set(el, { rotateX: -180 })
            )
            return
          }

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root, start: 'top top', end: '+=120%',
              pin: true, scrub: 0.65, anticipatePin: 1, invalidateOnRefresh: true,
            },
          })

          // the stage hands over first, then the chips rewrite in a wave
          tl.to('[data-stage="old"]', { yPercent: 20, opacity: 0, filter: 'blur(9px)', ease: 'power2.in', duration: 0.22 }, 0.12)
            .fromTo('[data-stage="new"]',
              { yPercent: -16, opacity: 0, scale: 0.9, filter: 'blur(9px)' },
              { yPercent: 0, opacity: 1, scale: 1, filter: 'blur(0px)', ease: 'power3.out', duration: 0.28 }, 0.22)
            .to('[data-name="old"]', { opacity: 0, y: -10, duration: 0.14 }, 0.14)
            .fromTo('[data-name="new"]', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.18 }, 0.26)

          ROWS.forEach((_, i) => {
            tl.to(`[data-flip="${i}"]`, { rotateX: -180, ease: 'power2.inOut', duration: 0.17 }, 0.32 + i * 0.09)
          })
        }
      )
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    // pill panel, matching the section treatment site-wide
    <section ref={rootRef} className="relative z-10 px-2 py-2 md:px-3 md:py-3">
      <div
        data-nav-theme="dark"
        className="relative flex h-[92vh] min-h-[640px] items-center overflow-hidden rounded-[1.75rem] px-4 pt-8 text-white md:rounded-[2.5rem] md:pt-0"
        style={{ background: 'linear-gradient(180deg,#e02414 0%,#b8160b 56%,#7d0d05 100%)' }}
      >
        <div className="mx-auto flex w-full max-w-[1060px] flex-col items-center">
          <h2 className="font-display text-center uppercase leading-[0.82]" style={{ fontSize: 'min(11.5vw, 6.2rem)' }}>
            Everything <span className="text-[#1a0604]">we fixed.</span>
          </h2>

          {/* ── one contained stage, two generations, matched sizing ── */}
          <div className="relative mt-4 h-[24vh] max-h-[300px] w-full md:mt-5 md:h-[40vh] md:max-h-[350px]">
            <div data-stage="old" className="absolute inset-0 flex items-center justify-center gap-2 will-change-transform md:gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- legacy product */}
              <img src="/products/gas-tank/milkcart-a-n.webp" alt="" aria-hidden className="h-full w-auto drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)]" />
              {/* eslint-disable-next-line @next/next/no-img-element -- legacy product */}
              <img src="/products/gas-tank/milkcart-b-n.webp" alt="Milk Cart AIO" className="h-full w-auto drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)]" />
            </div>

            <div data-stage="new" className="absolute inset-0 flex items-center justify-center opacity-0 will-change-transform">
              {/* eslint-disable-next-line @next/next/no-img-element -- product */}
              <img src="/products/gas-tank/device-flavors-n.webp" alt="" aria-hidden className="-mr-[2%] h-[82%] w-auto drop-shadow-[0_22px_36px_rgba(0,0,0,0.5)]" />
              {/* eslint-disable-next-line @next/next/no-img-element -- product */}
              <img src="/products/gas-tank/device-rosin-n.webp" alt="Gas Tank AIO" className="relative z-10 h-[82%] w-auto drop-shadow-[0_28px_48px_rgba(0,0,0,0.6)]" />
              {/* eslint-disable-next-line @next/next/no-img-element -- product */}
              <img src="/products/gas-tank/device-resin-n.webp" alt="" aria-hidden className="-ml-[2%] h-[82%] w-auto drop-shadow-[0_22px_36px_rgba(0,0,0,0.5)]" />
            </div>
          </div>

          {/* the name gets its own row so it can never collide with the art */}
          <div className="relative mt-5 h-9 w-full md:mt-6 md:h-11">
            <span data-name="old" className="font-display absolute inset-x-0 text-center uppercase leading-none text-white/70" style={{ fontSize: 'min(8vw, 2.7rem)' }}>Milk Cart AIO</span>
            <span data-name="new" className="font-display absolute inset-x-0 text-center uppercase leading-none text-[var(--gt-yellow)] opacity-0" style={{ fontSize: 'min(8vw, 2.7rem)' }}>Gas Tank AIO</span>
          </div>

          {/* ── the ledger: full-width pill chips, 2-up on desktop ── */}
          <ul className="mt-5 grid w-full grid-cols-1 gap-1.5 sm:grid-cols-2 md:mt-6 md:gap-2.5" style={{ perspective: '1200px' }}>
            {ROWS.map(([old, nu], i) => (
              <li key={old} className="relative h-[38px] md:h-[52px]">
                <div data-flip={i} className="absolute inset-0 [transform-style:preserve-3d] will-change-transform">
                  {/* before */}
                  <span className="absolute inset-0 flex w-full items-center gap-3 rounded-full bg-black/35 px-4 text-[11px] font-extrabold uppercase leading-tight tracking-wide text-white/75 [backface-visibility:hidden] md:px-5 md:text-[13px]"
                    style={{ fontFamily: 'var(--font-brand)' }}>
                    <span aria-hidden className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/15 text-[12px] leading-none text-white/80">✕</span>
                    <span className="line-through decoration-white/50 decoration-[1.5px]">{old}</span>
                  </span>
                  {/* after — pre-rotated so the flip lands it upright */}
                  <span className="absolute inset-0 flex w-full items-center gap-3 rounded-full bg-[var(--gt-yellow)] px-4 text-[11px] font-extrabold uppercase leading-tight tracking-wide text-[#160c02] [backface-visibility:hidden] [transform:rotateX(180deg)] md:px-5 md:text-[13px]"
                    style={{ fontFamily: 'var(--font-brand)' }}>
                    <span aria-hidden className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#160c02] text-[12px] font-black leading-none text-[var(--gt-yellow)]">✓</span>
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
