'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// COUNT THEM. The ten joints arrive scattered and deep, then fly into a
// perfectly even rank across a giant "10" — so the number is proved rather
// than stated, without a counter having to say it.
//
// Same 3D space as the hero: the scatter is a real translateZ spread, so the
// joints resolve out of depth rather than just sliding in from the sides.
//
// Near-black with the blue radiating up off the floor, deliberately: it sits
// between two solid blue panels and needs to break the run.

const N = 10

// where each joint starts — scattered, deep, tumbled. Deterministic, not
// random, so the composition is the same every load.
const SCATTER = Array.from({ length: N }, (_, i) => {
  const s = Math.sin(i * 12.9898) * 43758.5453
  const r = s - Math.floor(s)
  const s2 = Math.sin((i + 7) * 78.233) * 12345.6789
  const r2 = s2 - Math.floor(s2)
  return {
    x: -60 + r * 120, // vw
    y: -30 + r2 * 70, // vh
    rot: -160 + r * 320,
    z: -900 + r2 * 700,
  }
})

export default function TpTen() {
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
              trigger: root, start: 'top top', end: '+=170%',
              pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true,
            },
          })

          // the numeral swells behind them the whole way
          tl.fromTo('[data-tp-numeral]', { scale: 0.72, opacity: 0 }, { scale: 1, opacity: 1, ease: 'power2.out', duration: 0.34 }, 0)
            .to('[data-tp-numeral]', { scale: 1.12, ease: 'none', duration: 0.6 }, 0.34)

          // each joint resolves out of the scatter into its slot in the rank
          SCATTER.forEach((s, i) => {
            const at = 0.1 + (i / N) * 0.44
            tl.fromTo(`[data-tp-rank="${i}"]`,
              { xPercent: s.x * 1.2, yPercent: s.y * 1.2, rotate: s.rot, z: s.z, opacity: 0 },
              { xPercent: 0, yPercent: 0, rotate: 0, z: 0, opacity: 1, ease: 'power3.out', duration: 0.34 }, at)
          })

          // the settled rank drifts up as the section releases
          tl.to('[data-tp-rank-wrap]', { yPercent: -6, ease: 'none', duration: 0.3 }, 0.7)
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
        className="relative h-[92vh] min-h-[600px] overflow-hidden rounded-[1.75rem] md:rounded-[2.5rem]"
        style={{ background: 'radial-gradient(125% 82% at 50% 104%, #1a7ad0 0%, #0b3f70 26%, #05192e 56%, #02060c 100%)' }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%]"
          style={{ background: 'radial-gradient(90% 100% at 50% 100%, rgba(46,139,255,0.34) 0%, rgba(2,6,12,0) 72%)' }} />

        {/* the giant numeral */}
        <span data-tp-numeral aria-hidden
          className="font-display pointer-events-none absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 leading-none text-white/[0.07] will-change-transform md:top-1/2"
          style={{ fontSize: 'min(130vw, 40rem)', letterSpacing: '-0.04em' }}>
          10
        </span>

        <div className="pointer-events-none absolute inset-x-0 top-[8%] z-20 px-6 text-center">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.42em] text-[var(--tp-cyan)] md:text-xs"
            style={{ fontFamily: 'var(--font-brand)' }}>
            Count them
          </p>
          <h2 className="font-display mt-2 uppercase leading-[0.84] text-white" style={{ fontSize: 'min(11vw, 5rem)', letterSpacing: '-0.03em' }}>
            Ten in every jar
          </h2>
        </div>

        {/* the rank */}
        <div className="absolute inset-x-0 bottom-[13%] z-10 flex justify-center" style={{ perspective: '1400px' }}>
          <div data-tp-rank-wrap className="flex w-full max-w-[1040px] items-end justify-center gap-[1.2vw] px-4 will-change-transform"
            style={{ transformStyle: 'preserve-3d' }}>
            {SCATTER.map((_, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- product art
              <img key={i} data-tp-rank={i} src="/products/10-pack/joint.webp" alt="" aria-hidden
                className="h-[21vh] w-auto opacity-0 md:h-[36vh] md:max-h-[400px] will-change-transform drop-shadow-[0_18px_28px_rgba(0,0,0,0.6)]" />
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
