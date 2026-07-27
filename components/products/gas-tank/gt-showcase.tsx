'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import GtSnow, { type GtSnowHandle } from './gt-snow'

gsap.registerPlugin(ScrollTrigger)

// THE FREEZE — Live Rosin.
//
// The page's cold break: every other panel is fire, red or hazard orange, so
// this one drops into ice. Snow actually falls (three parallax depth bands) and
// frost actually grows — a branching crystal pattern seeded off all four edges
// and revealed inward by scroll, so the glass ices over around you.
//
// The six supporting claims flank the device. The seventh — 100% SOLVENTLESS,
// the whole reason this tier exists — is held back and paid off at the freeze:
// the frame ices over, a deep ice slab drops in, and the claim lands full size
// in JB yellow. Yellow needs a dark ground to pass contrast, which is exactly
// why the climax goes dark instead of white.
//
// Snow + frost live in gt-snow.tsx and are driven from this timeline.

const LEFT = ['Fresh frozen extract', 'Ice water hash', 'Full spectrum']
const RIGHT = ['Native terpenes', 'No additives', 'True-to-strain flavor']

export default function GtShowcase() {
  const rootRef = useRef<HTMLElement>(null)
  const snowRef = useRef<GtSnowHandle>(null)

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
              trigger: root, start: 'top top', end: '+=185%',
              pin: true, scrub: 0.65, anticipatePin: 1, invalidateOnRefresh: true,
              onUpdate: (self) => {
                const p = self.progress
                // frost creeps in, peaks through the freeze, then thaws a little
                let f = 0
                if (p > 0.26) f = Math.min(1, (p - 0.26) / 0.36)
                if (p > 0.82) f = Math.max(0.3, 1 - ((p - 0.82) / 0.18) * 0.7)
                snowRef.current?.setFrost(f)
                snowRef.current?.setWind(0.3 + Math.min(0.7, Math.max(0, (p - 0.2) / 0.45) * 0.7))
              },
            },
          })

          // the device rises out of the ice and keeps coming
          tl.fromTo('[data-ice-dev]',
            { yPercent: 40, scale: 0.86, opacity: 0 },
            { yPercent: 0, scale: 1, opacity: 1, ease: 'power3.out', duration: 0.3 }, 0.04)
            .to('[data-ice-dev]', { scale: 1.08, ease: 'none', duration: 0.6 }, 0.34)

          // the claims slide in from their own sides
          LEFT.forEach((_, i) => {
            tl.fromTo(`[data-chip-l="${i}"]`, { x: -70, opacity: 0 },
              { x: 0, opacity: 1, ease: 'power2.out', duration: 0.14 }, 0.1 + i * 0.07)
          })
          RIGHT.forEach((_, i) => {
            tl.fromTo(`[data-chip-r="${i}"]`, { x: 70, opacity: 0 },
              { x: 0, opacity: 1, ease: 'power2.out', duration: 0.14 }, 0.14 + i * 0.07)
          })

          // the heading gives way to the freeze
          tl.to('[data-ice-head]', { yPercent: -22, opacity: 0, ease: 'power2.in', duration: 0.16 }, 0.5)
            .to('[data-chips]', { opacity: 0, ease: 'power2.in', duration: 0.12 }, 0.54)

          // FREEZE
          tl.fromTo('[data-slab]', { opacity: 0 }, { opacity: 1, ease: 'power2.in', duration: 0.14 }, 0.56)
            .fromTo('[data-solv]', { opacity: 0, scale: 1.24, filter: 'blur(14px)' },
              { opacity: 1, scale: 1, filter: 'blur(0px)', ease: 'power3.out', duration: 0.16 }, 0.6)
            .to('[data-solv]', { scale: 1.05, ease: 'none', duration: 0.16 }, 0.78)
            .to(['[data-slab]', '[data-solv]'], { opacity: 0, ease: 'power2.out', duration: 0.14 }, 0.86)
            .to('[data-ice-head]', { yPercent: 0, opacity: 1, ease: 'power2.out', duration: 0.12 }, 0.88)
            .to('[data-chips]', { opacity: 1, ease: 'power2.out', duration: 0.12 }, 0.88)
        }
      )
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  const chip =
    'rounded-full bg-[#125f9e] px-3 py-2 text-[9px] font-extrabold uppercase tracking-wide text-white shadow-[0_8px_22px_rgba(9,58,99,0.32)] md:px-6 md:py-3 md:text-[15px]'

  return (
    <section ref={rootRef} className="relative z-10 px-2 py-2 md:px-3 md:py-3">
      <div
        className="relative h-[92vh] min-h-[640px] overflow-hidden rounded-[1.75rem] md:rounded-[2.5rem]"
        style={{ background: 'linear-gradient(180deg,#f4fcff 0%,#cdeafb 26%,#8bcdef 60%,#3f9fd4 100%)' }}
      >
        {/* real falling snow + frost creeping in from the edges */}
        <GtSnow ref={snowRef} className="z-[5]" />

        {/* ── heading ── */}
        <div data-ice-head className="pointer-events-none absolute inset-x-0 top-[8%] z-10 px-6 text-center will-change-transform">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.36em] text-[#0b4472]/80 md:text-xs"
            style={{ fontFamily: 'var(--font-brand)' }}>
            Introducing the all new
          </p>
          <h2 className="font-display mt-2 uppercase leading-[0.82] text-[#0b4472]" style={{ fontSize: 'min(12.5vw, 6.6rem)', letterSpacing: '-0.03em' }}>
            Live Rosin <br /> Gas Tank
          </h2>
        </div>

        {/* ── the claims, flanking the device ── */}
        <div data-chips className="pointer-events-none absolute inset-x-0 bottom-[6%] z-20 px-4 md:bottom-[10%] md:px-10">
          <div className="mx-auto flex w-full max-w-[1180px] items-end justify-between gap-3">
            <div className="flex shrink-0 flex-col items-start gap-2 md:gap-3">
              {LEFT.map((f, i) => (
                <span key={f} data-chip-l={i} className={`${chip} will-change-transform`} style={{ fontFamily: 'var(--font-brand)' }}>{f}</span>
              ))}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2 md:gap-3">
              {RIGHT.map((f, i) => (
                <span key={f} data-chip-r={i} className={`${chip} will-change-transform`} style={{ fontFamily: 'var(--font-brand)' }}>{f}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── the device, between them ── */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center pb-[2%]">
          {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
          <img data-ice-dev src="/products/gas-tank/device-rosin-n.webp" alt="Live Rosin Gas Tank All-In-One"
            className="h-[40vh] max-h-[580px] w-auto opacity-0 will-change-transform drop-shadow-[0_30px_54px_rgba(9,58,99,0.4)] md:h-[60vh]" />
        </div>

        {/* ── the freeze ── */}
        <div data-slab aria-hidden className="pointer-events-none absolute inset-0 z-30 opacity-0"
          style={{ background: 'linear-gradient(180deg,#0d4f86 0%,#093a63 55%,#062a49 100%)' }} />

        <div data-solv className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center px-6 text-center opacity-0 will-change-transform">
          <span className="font-display uppercase leading-[0.8] text-white" style={{ fontSize: 'min(23vw, 13rem)', letterSpacing: '-0.03em' }}>100%</span>
          <span className="font-display -mt-[1.5vw] uppercase leading-[0.8] text-[var(--gt-yellow)]" style={{ fontSize: 'min(17.5vw, 9.8rem)', letterSpacing: '-0.03em' }}>Solventless</span>
          <p className="mt-5 max-w-[46ch] text-[10px] font-extrabold uppercase tracking-[0.24em] text-white/75 md:text-xs" style={{ fontFamily: 'var(--font-brand)' }}>
            Fresh frozen flower. Ice water hash. No solvents, no additives, no shortcuts.
          </p>
        </div>
      </div>
    </section>
  )
}
