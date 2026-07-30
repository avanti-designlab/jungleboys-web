'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// THROUGH THE PACK — a camera move that EARNS its reveal.
//
// It used to open on the flight already in progress, which meant the first
// frame was a near-empty field with a couple of small tubes floating in it. Now
// it opens composed: a matched pair standing centre frame, sharp and still,
// under the headline. Only once you scroll does the camera let go — the ease is
// power2.in, so it holds that opening beat, then launches.
//
// After that it is a real dolly. Everything sits at its own depth in one
// preserve-3d stage and scroll drives a CAMERA through them, so they rush the
// viewer and blow past. Scale, focus and fade are all derived from each item's
// live Z, never keyframed by hand.
//
// The stream runs in PAIRS — two tubes, then two rolls, then two tubes — so the
// twins idea holds all the way through and the frame stays full.
//
// Green and yellow are sampled off the script mark (#63f603 / #fdfb67); this
// section is deliberately the break from the page's red and navy.

type Item = { kind: 'tube' | 'joint'; src?: string; x: number; y: number; rot: number; z: number }

const FLIGHT: Item[] = [
  // the opening pair — already at a comfortable distance and sharp at cam 0
  { kind: 'tube', src: 'tube-all-cherriez', x: -10, y: 2, rot: -8, z: -400 },
  { kind: 'tube', src: 'tube-motor-breath', x: 10, y: 2, rot: 8, z: -400 },
  // then matched pairs arriving out of the dark
  { kind: 'joint', x: -21, y: -5, rot: -17, z: -1250 },
  { kind: 'joint', x: 21, y: -5, rot: 17, z: -1250 },
  { kind: 'tube', src: 'tube-blu-zerdz', x: -27, y: 6, rot: -13, z: -1980 },
  { kind: 'tube', src: 'tube-all-cherriez', x: 27, y: 6, rot: 13, z: -1980 },
  { kind: 'joint', x: -12, y: 9, rot: -8, z: -2700 },
  { kind: 'joint', x: 12, y: 9, rot: 8, z: -2700 },
  { kind: 'tube', src: 'tube-motor-breath', x: -30, y: -3, rot: -16, z: -3450 },
  { kind: 'tube', src: 'tube-blu-zerdz', x: 30, y: -3, rot: 16, z: -3450 },
]

const PERSP = 1150
// The last pair sits at z -3450 and has fully faded by z 620, so the camera
// only needs to reach 4070. 4400 overran that and left the closing stretch of
// the scrub on an empty green field.
const CAM_END = 4090

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
          if (c.reduce) {
            // show the composed opening pair rather than an empty stage
            FLIGHT.forEach((it, i) => {
              const el = root.querySelector<HTMLElement>(`[data-tw-fly="${i}"]`)
              if (el) gsap.set(el, { opacity: it.z >= -1400 ? 1 : 0, filter: 'none' })
            })
            gsap.set('[data-tw-head]', { opacity: 1, yPercent: 0 })
            return
          }

          const els = FLIGHT.map((_, i) => root.querySelector<HTMLElement>(`[data-tw-fly="${i}"]`))
          // quickSetters: three properties per item, ten items, every scrub tick
          const setZ = els.map((el) => (el ? gsap.quickSetter(el, 'z', 'px') : null))
          const setOp = els.map((el) => (el ? gsap.quickSetter(el, 'opacity') : null))
          const setFilter = els.map((el) => (el ? gsap.quickSetter(el, 'filter') : null))

          const state = { cam: 0 }
          const paint = () => {
            FLIGHT.forEach((it, i) => {
              const z = it.z + state.cam
              setZ[i]?.(z)
              // arrive out of the far dark, then blow past and go. Fade out well
              // before z reaches the perspective origin, where scale runs away.
              const arriving = smooth(-3000, -2100, z)
              const leaving = 1 - smooth(240, 620, z)
              setOp[i]?.(Math.max(0, arriving * leaving))
              setFilter[i]?.(`blur(${(1 - smooth(-2300, -750, z)) * 7}px)`)
            })
          }
          paint()

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root, start: 'top top',
              end: window.matchMedia('(max-width: 767px)').matches ? '+=200%' : '+=280%',
              pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true,
            },
          })

          // power2.in is the whole trick: the opening pair holds still while you
          // read it, then the camera lets go and the flight reveals itself
          tl.to(state, { cam: CAM_END, ease: 'power2.in', duration: 1, onUpdate: paint }, 0)

          tl.fromTo('[data-tw-head]', { opacity: 0, yPercent: 24 }, { opacity: 1, yPercent: 0, ease: 'power3.out', duration: 0.16 }, 0)
            .to('[data-tw-head]', { opacity: 0, yPercent: -16, ease: 'power2.in', duration: 0.14 }, 0.82)
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
            {FLIGHT.map((it, i) => (
              <div key={i} data-tw-fly={i} className="absolute will-change-transform"
                style={{ marginLeft: `${it.x}vw`, marginTop: `${it.y}vh`, transform: `translateZ(${it.z}px)`, opacity: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
                <img loading="lazy" decoding="async" fetchPriority="low"
                  src={it.kind === 'tube' ? `/products/twins/${it.src}.webp` : '/products/twins/joint.webp'}
                  alt={i === 0 ? 'Jungle Boys Twins 2 Pack' : ''}
                  aria-hidden={i !== 0}
                  className={`w-auto drop-shadow-[0_36px_64px_rgba(0,0,0,0.8)] ${it.kind === 'tube' ? 'h-[64vh]' : 'h-[46vh]'}`}
                  style={{ transform: `rotate(${it.rot}deg)` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* type sits above the flight */}
        <div className="pointer-events-none absolute inset-x-0 top-[12%] z-20 px-5 text-center">
          <div data-tw-head className="will-change-transform">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.42em] md:text-xs"
              style={{ fontFamily: 'var(--font-brand)', color: '#fdfb67' }}>
              Never one
            </p>
            <h2 className="font-display mt-2 uppercase leading-[0.84] text-white"
              style={{ fontSize: 'min(12vw, 6.6rem)', letterSpacing: '-0.035em', textShadow: '0 10px 44px rgba(0,30,4,0.75)' }}>
              Two in every tube.
            </h2>
          </div>
        </div>
      </div>
    </section>
  )
}
