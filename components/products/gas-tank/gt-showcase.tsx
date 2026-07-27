'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import GtFire, { type GtFireHandle } from './gt-fire'

gsap.registerPlugin(ScrollTrigger)

// ONE PULL.
//
// Every other section on this page shows the product. This one shows what it
// DOES — which is the only way out of looking at the same three devices for a
// fifth time.
//
// A single device, alone and huge. Scrolling is the draw: the oil window
// ignites, heat climbs the body, and vapor pours out of the mouthpiece and
// floods the frame until it whites out. The line lands inside the whiteout,
// then the cloud thins and clears.
//
// The vapor is the SAME solver as the hero's fire, run in its vapor mode — a
// narrow plume at the mouthpiece, cooling slowly so it climbs the whole frame,
// fanning off-axis as it rises so it billows instead of running up as a column.
// Nothing here is a video or a sprite, which is why it can react to scroll.
//
// Geometry constants are measured off device-rosin-n.webp, not eyeballed:
//   mouthpiece centre  x 0.606 / top y 0.082
//   oil window centre  x 0.707 / y 0.446
// The vapor canvas is 3.4x the device width, offset 1.2x left, and its BOTTOM
// edge sits on the mouthpiece — so the plume centre in canvas space is
// (1.2 + 0.606) / 3.4.
const MOUTH_TOP = 0.082
const PLUME_X = (1.2 + 0.606) / 3.4

const MARKS = [
  { cls: 'left-[-8%] top-[4%] w-[28vw]', depth: 'far' },
  { cls: 'right-[-6%] top-[12%] w-[24vw]', depth: 'near' },
  { cls: 'left-[10%] bottom-[-10%] w-[32vw]', depth: 'near' },
  { cls: 'right-[14%] bottom-[-2%] w-[20vw]', depth: 'far' },
] as const

export default function GtShowcase() {
  const rootRef = useRef<HTMLElement>(null)
  const vaporRef = useRef<GtFireHandle>(null)

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
              pin: true, scrub: 0.65, anticipatePin: 1, invalidateOnRefresh: true,
              // the draw: vapor builds, holds, then thins out
              onUpdate: (self) => {
                const p = self.progress
                let v = 0
                if (p > 0.14) v = Math.min(1, (p - 0.14) / 0.4)
                if (p > 0.74) v = Math.max(0, 1 - (p - 0.74) / 0.26)
                vaporRef.current?.setIntensity(v)
              },
            },
          })

          // the device pushes toward you the whole way
          tl.fromTo('[data-dev]', { yPercent: 8, scale: 0.94 }, { yPercent: 0, scale: 1.06, ease: 'none', duration: 1 }, 0)
            // the coil lights
            .fromTo('[data-glow]', { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, ease: 'power2.out', duration: 0.2 }, 0.08)
            .to('[data-glow]', { opacity: 0.35, ease: 'power1.in', duration: 0.22 }, 0.72)
            // heat climbing the body
            .fromTo('[data-heat]', { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1.25, ease: 'power2.out', duration: 0.34 }, 0.1)
            .to('[data-heat]', { opacity: 0, ease: 'none', duration: 0.2 }, 0.76)
            // the cloud reveals itself
            .fromTo('[data-vapor]', { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.12 }, 0.14)
            .to('[data-vapor]', { opacity: 0, ease: 'none', duration: 0.2 }, 0.8)
            // whiteout at the peak of the draw
            .fromTo('[data-white]', { opacity: 0 }, { opacity: 0.88, ease: 'power2.in', duration: 0.16 }, 0.52)
            .to('[data-white]', { opacity: 0, ease: 'power2.out', duration: 0.2 }, 0.74)
            // the line punches through it
            .fromTo('[data-line]', { opacity: 0, scale: 1.16 }, { opacity: 1, scale: 1, ease: 'power3.out', duration: 0.14 }, 0.56)
            .to('[data-line]', { opacity: 0, scale: 0.96, ease: 'power2.in', duration: 0.14 }, 0.78)
            // signage parallax
            .fromTo('[data-mark="far"]', { yPercent: -5 }, { yPercent: 8, ease: 'none', duration: 1 }, 0)
            .fromTo('[data-mark="near"]', { yPercent: -12 }, { yPercent: 18, ease: 'none', duration: 1 }, 0)
        }
      )
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative z-10 px-2 py-2 md:px-3 md:py-3">
      <div
        className="relative h-[92vh] min-h-[620px] overflow-hidden rounded-[1.75rem] md:rounded-[2.5rem]"
        style={{ background: 'linear-gradient(175deg,#ffa41c 0%,#f4780c 44%,#cf3a08 100%)' }}
      >
        {/* oversized hazard signage, tone-on-tone */}
        {MARKS.map((m) => (
          <div key={m.cls} data-mark={m.depth} aria-hidden className={`pointer-events-none absolute ${m.cls} will-change-transform`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- hazard mark */}
            <img src="/products/gas-tank/tri-soft-orange.svg" alt="" className="w-full opacity-[0.5]" />
          </div>
        ))}

        <span className="absolute left-5 top-[7%] z-40 text-[10px] font-extrabold uppercase tracking-[0.42em] text-[#180800] md:left-10 md:text-xs"
          style={{ fontFamily: 'var(--font-brand)' }}>
          One pull
        </span>

        {/* ── the draw ── */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center pb-[2%]">
          <div className="relative aspect-[780/1240] h-[46vh] max-h-[520px] md:h-[56vh]">
            {/* heat bloom behind the body */}
            <div data-heat aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 will-change-transform"
              style={{ background: 'radial-gradient(circle, rgba(255,238,190,0.75) 0%, rgba(255,158,40,0.35) 40%, rgba(255,120,12,0) 70%)' }} />

            {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
            <img data-dev src="/products/gas-tank/device-rosin-n.webp" alt="Gas Tank All-In-One"
              className="absolute inset-0 h-full w-full object-contain will-change-transform drop-shadow-[0_36px_60px_rgba(90,26,0,0.55)]" />

            {/* the coil lighting up, on the measured oil window */}
            <span data-glow aria-hidden
              className="pointer-events-none absolute z-10 h-[26%] w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 mix-blend-screen will-change-transform"
              style={{ left: '70.7%', top: '44.6%', background: 'radial-gradient(circle, rgba(255,236,150,0.95) 0%, rgba(255,170,30,0.5) 38%, rgba(255,120,0,0) 70%)' }} />

            {/* the cloud — 5x the device width, bottom edge on the mouthpiece */}
            <div data-vapor className="pointer-events-none absolute left-[-120%] z-20 h-[84%] w-[340%] opacity-0"
              style={{ bottom: `${100 - MOUTH_TOP * 100}%` }}>
              <GtFire ref={vaporRef} mode="vapor" plumeX={PLUME_X} initial={0} className="h-full" />
            </div>
          </div>
        </div>

        {/* whiteout at the peak of the draw */}
        <div data-white aria-hidden className="pointer-events-none absolute inset-0 z-30 bg-white opacity-0" />

        {/* the line, inside the whiteout */}
        <div data-line className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center px-6 text-center opacity-0 will-change-transform">
          <h2 className="font-display uppercase leading-[0.8] text-[#180800]" style={{ fontSize: 'min(15vw, 8.5rem)' }}>
            All gas. <br /> No brakes.
          </h2>
        </div>
      </div>
    </section>
  )
}
