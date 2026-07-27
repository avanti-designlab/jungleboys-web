'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// THE PARADE. The page's hard colour break: after two near-black sections this
// one goes full hazard orange, and the whole lineup marches straight across the
// frame while it's pinned.
//
// The headline is locked dead centre in black and the products pass IN FRONT of
// it — that overlap is the whole idea, and it only works because everything is
// opaque on a bright ground. (The previous dark tunnel lost the products in the
// murk; nothing here is translucent.)
//
// Four oversized hazard marks drift behind at two depths, tone-on-tone so they
// read as printed signage rather than clutter.
//
// Devices only on the belt: the pouch art is a flat card and at this scale it
// read as a blank rectangle rather than packaging.

const BELT = [
  { src: 'device-rosin', label: 'Live Rosin', w: 'w-[46vw] md:w-[25vw] md:max-w-[310px]', y: 'translate-y-[4vh]', rot: '-5deg' },
  { src: 'device-resin', label: 'Live Resin', w: 'w-[48vw] md:w-[26vw] md:max-w-[325px]', y: '-translate-y-[6vh]', rot: '6deg' },
  { src: 'device-flavors', label: 'Flavors', w: 'w-[46vw] md:w-[25vw] md:max-w-[310px]', y: 'translate-y-[3vh]', rot: '-4deg' },
]

const MARKS = [
  { cls: 'left-[-6%] top-[6%] w-[26vw]', depth: 'far' },
  { cls: 'right-[-4%] top-[14%] w-[22vw]', depth: 'near' },
  { cls: 'left-[16%] bottom-[-8%] w-[30vw]', depth: 'near' },
  { cls: 'right-[18%] bottom-[2%] w-[18vw]', depth: 'far' },
] as const

export default function GtShowcase() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add(
        {
          reduce: '(prefers-reduced-motion: reduce)',
          mobile: '(prefers-reduced-motion: no-preference) and (max-width: 767px)',
          desk: '(prefers-reduced-motion: no-preference) and (min-width: 768px)',
        },
        (mmCtx) => {
          const c = mmCtx.conditions as Record<string, boolean>
          if (c.reduce) return

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root, start: 'top top', end: '+=130%',
              pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
            },
          })

          // the lineup marches right to left across the whole pin
          tl.fromTo('[data-belt]', { xPercent: 4 }, { xPercent: c.mobile ? -46 : -32, ease: 'none', duration: 1 }, 0)
            // signage drifts at two depths behind it
            .fromTo('[data-mark="far"]', { yPercent: -6, xPercent: 2 }, { yPercent: 9, xPercent: -2, ease: 'none', duration: 1 }, 0)
            .fromTo('[data-mark="near"]', { yPercent: -14, xPercent: -3 }, { yPercent: 20, xPercent: 3, ease: 'none', duration: 1 }, 0)
            // the headline breathes forward as the parade passes
            .fromTo('[data-gtsc-head]', { scale: 0.94 }, { scale: 1.06, ease: 'none', duration: 1 }, 0)
            .fromTo('[data-gtsc-strip]', { xPercent: -16 }, { xPercent: 6, ease: 'none', duration: 1 }, 0)
        }
      )
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={rootRef}
      className="relative z-10 h-screen min-h-[620px] overflow-hidden"
      style={{ background: 'linear-gradient(175deg,#ffa41c 0%,#f4780c 44%,#cf3a08 100%)' }}
    >
      {/* oversized hazard signage, tone-on-tone */}
      {MARKS.map((m) => (
        <div key={m.cls} data-mark={m.depth} aria-hidden className={`pointer-events-none absolute ${m.cls} will-change-transform`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- hazard mark */}
          <img src="/products/gas-tank/tri-soft-orange.svg" alt="" className="w-full opacity-[0.55]" />
        </div>
      ))}

      {/* the line, locked — the parade crosses in front of it */}
      <div data-gtsc-head className="pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 px-6 text-center will-change-transform">
        <h2 className="font-display uppercase leading-[0.8] text-[#180800]" style={{ fontSize: 'min(17vw, 9.5rem)' }}>
          Handle <br /> with fire
        </h2>
      </div>

      {/* the lineup, marching */}
      <div data-belt className="absolute inset-y-0 left-0 z-20 flex w-[190%] items-center gap-[10vw] px-[10vw] md:w-[128%] md:gap-[13vw] will-change-transform">
        {BELT.map((b) => (
          <div key={b.src} className={`flex shrink-0 flex-col items-center ${b.y}`} style={{ rotate: b.rot }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
            <img
              src={`/products/gas-tank/${b.src}.webp`}
              alt={b.label ? `Gas Tank ${b.label}` : ''}
              aria-hidden={b.label ? undefined : true}
              className={`${b.w} drop-shadow-[0_28px_44px_rgba(90,26,0,0.55)]`}
            />
            {b.label && (
              <span className="mt-4 rounded-full bg-[#180800] px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--gt-yellow)] md:text-xs"
                style={{ fontFamily: 'var(--font-brand)' }}>
                {b.label}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* hazard stripe along the foot */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[7vh] min-h-[46px] overflow-hidden border-y-4 border-[#180800]">
        <div data-gtsc-strip className="h-full w-[140%] will-change-transform"
          style={{ backgroundImage: 'repeating-linear-gradient(115deg,#180800 0 42px,#ffc21c 42px 84px)' }} />
      </div>
    </section>
  )
}
