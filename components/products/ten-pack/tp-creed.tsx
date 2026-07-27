'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TpClouds from './tp-clouds'

gsap.registerPlugin(ScrollTrigger)

// NO TRIM. NO SHAKE. NO SHORTCUTS.
//
// Three refusals, so they land as three — each wipes in on its own beat rather
// than the block fading up together.
//
// The left is a STACK, not a single jar: three oversized jars overlapping at
// different depths and angles, each idling on its own clock and counter-drifting
// against the others as you pass. They run off the bottom of the panel on
// purpose, which is what lets them be this big.

const STACK = [
  { src: 'jar-motor-breath', x: -16, y: 10, h: 46, rot: -12, z: -220, bob: 'a', dur: 12, drift: -16 },
  { src: 'jar-rainbow-belts', x: 14, y: 16, h: 44, rot: 11, z: -140, bob: 'b', dur: 10, drift: -9 },
  { src: 'jar-all-cherriez', x: 0, y: 0, h: 58, rot: -3, z: 90, bob: 'a', dur: 14, drift: -24 },
]

const LINES = ['No trim.', 'No shake.', 'No shortcuts.']

export default function TpCreed() {
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
            scrollTrigger: { trigger: root, start: 'top 88%', end: 'bottom 55%', scrub: 0.7 },
          })

          LINES.forEach((_, i) => {
            tl.fromTo(`[data-tp-creed="${i}"]`,
              { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
              { clipPath: 'inset(0 0% 0 0)', opacity: 1, ease: 'power2.out', duration: 0.22 },
              0.1 + i * 0.15)
          })

          // each jar travels at its own rate — the stack opens as you pass
          STACK.forEach((j, i) => {
            tl.fromTo(`[data-tp-stack="${i}"]`,
              { yPercent: 18, xPercent: j.x * 0.25 },
              { yPercent: j.drift, xPercent: 0, ease: 'none', duration: 1 }, 0)
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
        className="relative overflow-hidden rounded-[1.75rem] md:rounded-[2.5rem]"
        style={{ background: 'linear-gradient(110deg,#0d63a8 0%,#1178c9 44%,#07406f 100%)' }}
      >
        <TpClouds density={1} className="z-0" />

        <div className="relative z-10 grid grid-cols-1 items-center gap-4 px-5 pt-12 md:grid-cols-[1.05fr_1fr] md:gap-8 md:px-14 md:pt-16">
          {/* the stack — oversized, overlapping, cropped off the floor */}
          <div className="relative h-[38vh] md:h-[62vh]" style={{ perspective: '1300px' }}>
            <div className="absolute inset-x-0 bottom-[-14%]" style={{ transformStyle: 'preserve-3d' }}>
              {STACK.map((j, i) => (
                <div key={j.src} data-tp-stack={i}
                  className="absolute bottom-0 left-1/2 w-max will-change-transform"
                  style={{ marginLeft: `${j.x}%`, transform: `translateZ(${j.z}px)`, zIndex: Math.round(j.z / 10) + 40 }}>
                  <div className={`tp-bob-${j.bob}`} style={{ ['--tp-rot' as string]: `${j.rot}deg`, ['--tp-dur' as string]: `${j.dur}s` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
                    <img src={`/products/10-pack/${j.src}.webp`} alt="Jungle Boys 10 Pack Pre-Rolls"
                      className="w-auto -translate-x-1/2 drop-shadow-[0_36px_60px_rgba(2,20,40,0.7)]"
                      style={{ height: `${j.h}vh`, marginTop: `${j.y}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <h2 className="font-display pb-12 uppercase leading-[0.86] text-white md:pb-16" style={{ letterSpacing: '-0.035em' }}>
            {LINES.map((l, i) => (
              <span key={l} data-tp-creed={i} className="block will-change-[clip-path]" style={{ fontSize: 'min(14vw, 6.6rem)' }}>
                {l}
              </span>
            ))}
          </h2>
        </div>
      </div>
    </section>
  )
}
