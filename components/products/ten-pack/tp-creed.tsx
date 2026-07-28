'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// NO TRIM. NO SHAKE. NO SHORTCUTS.
//
// Three refusals, and each one gets STRUCK OUT: a red X draws itself — two
// strokes, one then the other, like it's being marked by hand — and the line
// wipes in behind it. Drawn as SVG strokes with pathLength normalised to 1, so
// the dash offset animates cleanly at any size.
//
// The left is a STACK: three oversized jars overlapping at different depths and
// angles, each idling on its own clock and counter-drifting against the others
// as you pass. They run off the bottom of the panel on purpose.

// x is a % of the left column. At -16/+14 the front jar covered all but ~26% of
// each of the two behind it, so they read as slivers rather than jars; these
// spread them out to roughly 60% clear while staying inside the column so they
// never crowd the type.
const STACK = [
  { src: 'jar-motor-breath', x: -27, y: 10, h: 46, rot: -12, z: -220, bob: 'a', dur: 12, drift: -16 },
  { src: 'jar-rainbow-belts', x: 25, y: 16, h: 44, rot: 11, z: -140, bob: 'b', dur: 10, drift: -9 },
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
            scrollTrigger: { trigger: root, start: 'top 85%', end: 'bottom 52%', scrub: 0.7 },
          })

          LINES.forEach((_, i) => {
            const at = 0.08 + i * 0.17
            // the X marks it first — one stroke, then the other
            tl.fromTo(`[data-tp-x="${i}"] [data-s="1"]`,
              { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'power2.out', duration: 0.05 }, at)
              .fromTo(`[data-tp-x="${i}"] [data-s="2"]`,
                { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'power2.out', duration: 0.05 }, at + 0.035)
              .fromTo(`[data-tp-x="${i}"]`,
                { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, ease: 'back.out(2)', duration: 0.06 }, at)
              // …then the refusal wipes in behind it
              .fromTo(`[data-tp-word="${i}"]`,
                { clipPath: 'inset(0 100% 0 0)', opacity: 0, xPercent: -3 },
                { clipPath: 'inset(0 0% 0 0)', opacity: 1, xPercent: 0, ease: 'power3.out', duration: 0.13 }, at + 0.05)
          })

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

        <div className="relative z-10 grid grid-cols-1 items-center gap-4 px-5 pt-12 md:grid-cols-[0.95fr_1.05fr] md:gap-6 md:px-12 md:pt-16">
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

          <h2 className="font-display pb-12 uppercase leading-[0.9] text-white md:pb-16" style={{ letterSpacing: '-0.035em' }}>
            {LINES.map((l, i) => (
              <span key={l} className="flex items-center gap-3 md:gap-5" style={{ fontSize: 'min(12.5vw, 7.2rem)' }}>
                <svg data-tp-x={i} viewBox="0 0 100 100" aria-hidden
                  className="h-[0.62em] w-[0.62em] shrink-0 opacity-0 will-change-transform">
                  <line data-s="1" x1="14" y1="14" x2="86" y2="86" pathLength={1} strokeDasharray={1}
                    stroke="#ff2f2f" strokeWidth="17" strokeLinecap="round" />
                  <line data-s="2" x1="86" y1="14" x2="14" y2="86" pathLength={1} strokeDasharray={1}
                    stroke="#ff2f2f" strokeWidth="17" strokeLinecap="round" />
                </svg>
                <span data-tp-word={i} className="block whitespace-nowrap will-change-[clip-path]">{l}</span>
              </span>
            ))}
          </h2>
        </div>
      </div>
    </section>
  )
}
