'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TpClouds from './tp-clouds'

gsap.registerPlugin(ScrollTrigger)

// 1 FOR NOW, 9 FOR LATER.
//
// The line is the section. It sits enormous and locked while the nine counts
// itself up from 1 — and every time it ticks, another claim ARRIVES: the cards
// fly in out of deep space toward you, alternating sides, so the count and the
// evidence are the same event. Nine ticks, eight cards, one payoff.
//
// Cards carry the icons drawn for this section in the Figma frame, each on an
// electric-blue disc. Real 3D: the grid holds a perspective and each card comes
// from its own translateZ with a tilt, so they arrive rather than fade.

const CLAIMS = [
  { icon: 'quality-b', text: 'Consistent quality in every joint' },
  { icon: 'indoor', text: 'Crafted with indoor nugs' },
  { icon: 'strain', text: 'Strain-specific packs' },
  { icon: 'batches', text: 'Freshly rolled in small batches' },
  { icon: 'sharing', text: 'Perfect for sharing or stocking up' },
  { icon: 'sealed', text: 'Sealed for freshness' },
  { icon: 'burn', text: 'Clean burn, smooth smoke' },
  { icon: 'value', text: 'Great price-to-quality ratio' },
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
            scrollTrigger: {
              trigger: root, start: 'top top', end: '+=185%',
              pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true,
            },
          })

          tl.fromTo('[data-tp-line]', { opacity: 0, yPercent: 20, scale: 0.92 },
            { opacity: 1, yPercent: 0, scale: 1, ease: 'power3.out', duration: 0.18 }, 0)

          // The 9 stays a 9. It used to count up from 1, which meant the line
          // read "1 FOR NOW, 1 FOR LATER" for the whole approach — wrong copy on
          // screen. It pulses on each claim landing instead.
          CLAIMS.forEach((_, i) => {
            const at = 0.2 + (i / CLAIMS.length) * 0.6
            tl.fromTo('[data-tp-nine]', { scale: 1 }, { scale: 1.14, yoyo: true, repeat: 1, duration: 0.03, ease: 'power2.out' }, at)
          })

          // each claim arrives out of depth, on the beat of its tick
          CLAIMS.forEach((_, i) => {
            const at = 0.2 + (i / CLAIMS.length) * 0.6
            tl.fromTo(`[data-tp-card="${i}"]`,
              { opacity: 0, z: -900, xPercent: i % 2 === 0 ? -26 : 26, rotateY: i % 2 === 0 ? 22 : -22, rotateX: 12 },
              { opacity: 1, z: 0, xPercent: 0, rotateY: 0, rotateX: 0, ease: 'power3.out', duration: 0.16 }, at)
          })

          // the whole grid drifts toward you through the pass
          tl.fromTo('[data-tp-grid]', { z: -120 }, { z: 60, ease: 'none', duration: 1 }, 0)
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
        className="relative flex h-[92vh] min-h-[620px] items-center overflow-hidden rounded-[1.75rem] px-4 text-white md:rounded-[2.5rem] md:px-10"
        style={{ background: 'linear-gradient(180deg,#0d63a8 0%,#08406f 54%,#051d33 100%)' }}
      >
        <TpClouds density={0.72} from="left" className="z-0" />

        <div className="relative z-10 mx-auto w-full max-w-[1220px]">
          <h2 data-tp-line className="font-display text-center uppercase leading-[0.82] text-white will-change-transform"
            style={{ fontSize: 'min(13.5vw, 7rem)', letterSpacing: '-0.035em' }}>
            1 for now,<br className="md:hidden" /> <span data-tp-nine className="text-[var(--tp-glow)]">9</span> for later.
          </h2>

          <div data-tp-grid
            className="mt-8 grid grid-cols-1 gap-2.5 will-change-transform md:mt-12 md:grid-cols-2 md:gap-4"
            style={{ perspective: '1100px', transformStyle: 'preserve-3d' }}>
            {CLAIMS.map((claim, i) => (
              <div key={claim.text} data-tp-card={i}
                // dark glass, not light — the smoke behind is bright enough that
                // a white tint left the labels sitting on nothing
                className="flex items-center gap-3 rounded-2xl border border-white/20 bg-[#04182e]/45 px-3 py-2.5 backdrop-blur-md will-change-transform md:gap-4 md:rounded-[1.4rem] md:px-5 md:py-4">
                <span aria-hidden
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/25 md:h-14 md:w-14"
                  style={{ background: 'radial-gradient(circle at 35% 30%, #6db6ff 0%, #2e8bff 55%, #0d5fc4 100%)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- section icon */}
                  <img src={`/products/10-pack/icons/${claim.icon}.svg`} alt="" className="h-5 w-5 object-contain md:h-7 md:w-7" />
                </span>
                <span className="text-[11px] font-extrabold uppercase leading-tight tracking-wide text-white md:text-[15px]"
                  style={{ fontFamily: 'var(--font-brand)' }}>
                  {claim.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
