'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// HANDLE WITH FIRE. A tunnel, not a wallpaper. The section pins and you fly
// INTO a hazard triangle: it swells from a speck to bigger than the frame while
// the whole lineup streams past you from the same vanishing point — each piece
// starting as a dot dead centre, then scaling up and peeling off toward its own
// corner. Two slow hazard walls drift behind at different depths for parallax.
//
// Dark ground on purpose: the earlier yellow tile field fought the products.

// where each piece exits, and how big it gets on the way out
const STREAM = [
  { src: 'device-rosin', alt: 'Gas Tank Live Rosin', x: '-2vw', y: '30vh', end: 1.35, rot: 4, at: 0, w: 'w-[26vw] max-w-[300px]' },
  { src: 'pouch-flavors', alt: '', x: '-42vw', y: '-24vh', end: 1.1, rot: -22, at: 0.14, w: 'w-[24vw] max-w-[270px]' },
  { src: 'device-resin', alt: 'Gas Tank Live Resin', x: '40vw', y: '-18vh', end: 1.2, rot: 18, at: 0.26, w: 'w-[24vw] max-w-[270px]' },
  { src: 'pouch-resin', alt: '', x: '38vw', y: '30vh', end: 1.1, rot: 14, at: 0.4, w: 'w-[24vw] max-w-[270px]' },
  { src: 'device-flavors', alt: 'Gas Tank Flavors', x: '-38vw', y: '28vh', end: 1.25, rot: -16, at: 0.52, w: 'w-[24vw] max-w-[270px]' },
]

export default function GtShowcase() {
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
              pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
            },
          })

          // fly into the hazard mark
          tl.fromTo('[data-tunnel]',
            { scale: 0.3, rotate: -14, opacity: 0.35 },
            { scale: 2.2, rotate: 10, opacity: 0.85, ease: 'power1.in', duration: 1 }, 0)
            .to('[data-tunnel]', { opacity: 0, ease: 'none', duration: 0.22 }, 0.78)

          // two hazard walls drifting behind at different depths
          tl.fromTo('[data-wall="far"]', { yPercent: -8, xPercent: 3 }, { yPercent: 14, xPercent: -3, ease: 'none', duration: 1 }, 0)
            .fromTo('[data-wall="near"]', { yPercent: -20, xPercent: -4 }, { yPercent: 30, xPercent: 4, ease: 'none', duration: 1 }, 0)

          // the lineup streams past, one piece at a time
          STREAM.forEach((s, i) => {
            tl.fromTo(`[data-stream="${i}"]`,
              { x: 0, y: 0, scale: 0.1, rotate: 0, opacity: 0 },
              { x: s.x, y: s.y, scale: s.end, rotate: s.rot, opacity: 1, ease: 'power1.in', duration: 0.48 }, s.at)
              .to(`[data-stream="${i}"]`, { opacity: 0, ease: 'none', duration: 0.14 }, s.at + 0.36)
          })

          // the line sits in front of the whole flight
          tl.set('[data-gtsc-head]', { opacity: 1 }, 0)
            .fromTo('[data-gtsc-head]', { scale: 0.94 }, { scale: 1, ease: 'power2.out', duration: 0.14 }, 0)
            .to('[data-gtsc-head]', { scale: 1.14, opacity: 0, ease: 'power2.in', duration: 0.22 }, 0.74)
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
      className="relative z-10 h-screen min-h-[620px] overflow-hidden"
      style={{ background: 'radial-gradient(circle at 50% 50%, #3a1405 0%, #170a04 46%, #0a0908 100%)' }}
    >
      {/* hazard walls — parallax texture behind everything */}
      <div data-wall="far" aria-hidden className="gt-tri-field pointer-events-none absolute -inset-x-[10%] -inset-y-[30%] -rotate-[7deg] opacity-[0.045] will-change-transform" style={{ backgroundSize: '92px' }} />
      <div data-wall="near" aria-hidden className="gt-tri-field pointer-events-none absolute -inset-x-[14%] -inset-y-[34%] rotate-[5deg] opacity-[0.07] will-change-transform" style={{ backgroundSize: '190px' }} />

      {/* the mark you fly into */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2">
        {/* eslint-disable-next-line @next/next/no-img-element -- hazard mark */}
        <img data-tunnel src="/products/gas-tank/caution-triangle.svg" alt="" aria-hidden
          className="h-[52vh] w-auto opacity-0 will-change-transform" />
      </div>

      {/* the lineup streaming past */}
      <div className="pointer-events-none absolute inset-0 z-[3]">
        {STREAM.map((s, i) => (
          <div key={s.src} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
            <img
              data-stream={i}
              src={`/products/gas-tank/${s.src}.webp`}
              alt={s.alt}
              aria-hidden={s.alt ? undefined : true}
              className={`${s.w} opacity-0 will-change-transform drop-shadow-[0_40px_70px_rgba(0,0,0,0.65)]`}
            />
          </div>
        ))}
      </div>

      {/* the line, held in front */}
      <div data-gtsc-head className="pointer-events-none absolute inset-x-0 top-1/2 z-[2] -translate-y-1/2 px-6 text-center opacity-0 will-change-transform">
        <h2 className="font-display uppercase leading-[0.82] text-white drop-shadow-[0_10px_40px_rgba(0,0,0,0.9)]" style={{ fontSize: 'min(15vw, 8rem)' }}>
          Handle <br /> <span className="text-[var(--gt-yellow)]">with fire</span>
        </h2>
        <p className="mx-auto mt-4 max-w-[36ch] text-[10px] font-extrabold uppercase tracking-[0.3em] text-white/60 md:text-xs" style={{ fontFamily: 'var(--font-brand)' }}>
          Three tiers. One tank.
        </p>
      </div>
    </section>
  )
}
