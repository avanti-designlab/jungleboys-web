'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// THROUGH THE PACK — a camera move, not a slideshow.
//
// The first version slid two flat joints apart and that is exactly what it
// looked like. This is a real dolly: the three Twins tubes sit at different
// depths in one preserve-3d stage and scroll drives a CAMERA through them, so
// they rush the viewer, blow past either side and are gone. Depth does all the
// work — perspective scale, focus and fade are all derived from each tube's live
// Z, not keyframed by hand.
//
// Mid-flight the pair of rolls scissors out of the middle tube, which is the
// point of the product, and the grams count up to 1.5 as they clear.
//
// Green and yellow are the outline colours sampled out of the script mark
// (#63f603 and #fdfb67) rather than the red/navy the rest of the page runs on —
// this section is the break in the middle.

const TUBES = [
  { src: 'tube-blu-zerdz', x: -24, y: 4, rot: -11, z: -2600 },
  { src: 'tube-all-cherriez', x: 5, y: -3, rot: 5, z: -1750 },
  { src: 'tube-motor-breath', x: 25, y: 7, rot: 13, z: -1000 },
]

// perspective in px — every scale/blur below is derived from this
const PERSP = 1150
const CAM_END = 3500

const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export default function TwDouble() {
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

          const tubes = TUBES.map((_, i) => root.querySelector<HTMLElement>(`[data-tw-tube="${i}"]`))
          // quickSetters: this writes three properties per tube on every scrub
          // tick, and the generic setter path is measurably slower at that rate
          const setZ = tubes.map((el) => (el ? gsap.quickSetter(el, 'z', 'px') : null))
          const setOp = tubes.map((el) => (el ? gsap.quickSetter(el, 'opacity') : null))
          const setFilter = tubes.map((el) => (el ? gsap.quickSetter(el, 'filter') : null))

          const state = { cam: 0 }
          const paint = () => {
            TUBES.forEach((t, i) => {
              const z = t.z + state.cam
              setZ[i]?.(z)
              // arrive out of the far dark, then blow past the camera and go.
              // fade out well before z reaches the perspective origin, where
              // scale runs away to infinity
              const arriving = smooth(-2700, -1900, z)
              const leaving = 1 - smooth(240, 620, z)
              setOp[i]?.(Math.max(0, arriving * leaving))
              // out of focus at distance, sharp as it reaches you
              setFilter[i]?.(`blur(${(1 - smooth(-2200, -700, z)) * 7}px)`)
            })
          }
          paint()

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root, start: 'top top', end: '+=260%',
              pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true,
            },
          })

          tl.to(state, { cam: CAM_END, ease: 'none', duration: 1, onUpdate: paint }, 0)

          // the pair scissors out of the middle of the flight
          tl.fromTo('[data-tw-j="a"]',
            { rotate: 0, xPercent: 0, opacity: 0 },
            { rotate: -24, xPercent: -62, opacity: 1, ease: 'power2.out', duration: 0.3 }, 0.3)
            .fromTo('[data-tw-j="b"]',
              { rotate: 0, xPercent: 0, opacity: 0 },
              { rotate: 24, xPercent: 62, opacity: 1, ease: 'power2.out', duration: 0.3 }, 0.3)
            .to('[data-tw-pair]', { opacity: 0, ease: 'power2.in', duration: 0.18 }, 0.78)

          // headline hands over to the arithmetic
          tl.fromTo('[data-tw-head]', { opacity: 0, yPercent: 26 }, { opacity: 1, yPercent: 0, ease: 'power3.out', duration: 0.22 }, 0.06)
            .to('[data-tw-head]', { opacity: 0, yPercent: -18, ease: 'power2.in', duration: 0.16 }, 0.72)

          tl.fromTo('[data-tw-sum]', { opacity: 0, yPercent: 26 }, { opacity: 1, yPercent: 0, ease: 'power3.out', duration: 0.2 }, 0.76)

          const grams = { v: 0 }
          tl.to(grams, {
            v: 1.5, ease: 'none', duration: 0.18,
            onUpdate: () => {
              const el = root.querySelector('[data-tw-total]')
              if (el) el.textContent = grams.v.toFixed(2).replace(/0$/, '') + 'g'
            },
          }, 0.78)
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
        className="relative h-[94vh] min-h-[640px] overflow-hidden rounded-[1.75rem] md:rounded-[2.5rem]"
        style={{ background: 'radial-gradient(130% 95% at 50% 108%, #d8f52a 0%, #63f603 12%, #2f9a08 30%, #12500b 52%, #061c08 78%, #030c05 100%)' }}
      >
        {/* the mark's green and yellow, drifting */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="tw-bloom absolute -inset-[30%]"
            style={{ background: 'radial-gradient(40% 38% at 26% 30%, rgba(253,251,103,0.34) 0%, rgba(253,251,103,0) 70%)' }} />
          <div className="tw-bloom-b absolute -inset-[30%]"
            style={{ background: 'radial-gradient(42% 40% at 74% 62%, rgba(99,246,3,0.34) 0%, rgba(99,246,3,0) 72%)' }} />
        </div>

        {/* THE FLIGHT */}
        <div className="absolute inset-0 z-10" style={{ perspective: `${PERSP}px` }}>
          <div className="absolute inset-0 grid place-items-center" style={{ transformStyle: 'preserve-3d' }}>
            {TUBES.map((t, i) => (
              <div key={t.src} data-tw-tube={i} className="absolute will-change-transform"
                style={{ marginLeft: `${t.x}vw`, marginTop: `${t.y}vh`, transform: `translateZ(${t.z}px)`, opacity: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
                <img src={`/products/twins/${t.src}.webp`} alt="Jungle Boys Twins 2 Pack"
                  className="h-[58vh] w-auto drop-shadow-[0_36px_64px_rgba(0,0,0,0.8)]"
                  style={{ transform: `rotate(${t.rot}deg)` }} />
              </div>
            ))}

            {/* the pair, scissoring out mid-flight */}
            <div data-tw-pair className="absolute grid place-items-center will-change-transform" style={{ transformStyle: 'preserve-3d' }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
              <img data-tw-j="a" src="/products/twins/joint.webp" alt="Two 0.75g pre-rolls"
                className="absolute h-[40vh] w-auto opacity-0 will-change-transform drop-shadow-[0_22px_44px_rgba(0,0,0,0.7)]" />
              {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
              <img data-tw-j="b" src="/products/twins/joint.webp" alt="" aria-hidden
                className="absolute h-[40vh] w-auto opacity-0 will-change-transform drop-shadow-[0_22px_44px_rgba(0,0,0,0.7)]" />
            </div>
          </div>
        </div>

        {/* type sits above the flight */}
        <div className="pointer-events-none absolute inset-x-0 top-[13%] z-20 px-5 text-center">
          <div data-tw-head className="will-change-transform">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.42em] md:text-xs"
              style={{ fontFamily: 'var(--font-brand)', color: '#fdfb67' }}>
              Never one
            </p>
            <h2 className="font-display mt-2 uppercase leading-[0.84] text-white"
              style={{ fontSize: 'min(12vw, 6.6rem)', letterSpacing: '-0.035em', textShadow: '0 10px 44px rgba(0,30,4,0.7)' }}>
              Two in every tube.
            </h2>
          </div>
        </div>

        {/* the arithmetic, once the pair has cleared */}
        <div data-tw-sum className="pointer-events-none absolute inset-x-0 bottom-[10%] z-20 flex items-end justify-center gap-3 px-5 opacity-0 will-change-transform md:gap-6">
          {[
            { v: '0.75g', l: 'Roll one' },
            { v: '+', l: '' },
            { v: '0.75g', l: 'Roll two' },
            { v: '=', l: '' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="font-display leading-none text-white" style={{ fontSize: s.l ? 'min(7vw, 3rem)' : 'min(5vw, 2.2rem)' }}>{s.v}</span>
              {s.l && (
                <span className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.24em] text-white/60 md:text-[11px]"
                  style={{ fontFamily: 'var(--font-brand)' }}>{s.l}</span>
              )}
            </div>
          ))}
          <div className="flex flex-col items-center">
            <span data-tw-total className="font-display leading-none"
              style={{ fontSize: 'min(9vw, 4rem)', color: '#fdfb67', filter: 'drop-shadow(0 6px 22px rgba(99,246,3,0.6))' }}>0g</span>
            <span className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.24em] md:text-[11px]"
              style={{ fontFamily: 'var(--font-brand)', color: '#fdfb67' }}>Total</span>
          </div>
        </div>
      </div>
    </section>
  )
}
