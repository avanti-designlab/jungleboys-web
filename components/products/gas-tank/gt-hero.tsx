'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// IGNITION. The hero pins and the three devices arrive out of the dark like a
// rig powering up: they fly in from depth (z + blur), lock into a fanned
// three-up, and a heat bloom rises behind them while the headline stacks in.
// Scrolling on, the trio drifts apart in PARALLAX — the centre device pushes
// toward you while the flankers recede — so the whole hero has real depth
// rather than three flat cutouts.
//
// Devices in the ART are the three tiers: Flavors (grey), Live Rosin (white,
// the new one, centre) and Live Resin (black).

const SPECS = [
  'Palm sized and discreet',
  'Built for pure extracts',
  'Big vapor, smooth pull',
  'Uncompromised taste',
  'Performance that lasts',
  'Powered by CCELL technology',
]

export default function GtHero() {
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

          // ── entrance: devices power up out of the dark on load
          const intro = gsap.timeline({ delay: 0.15 })
          intro.from('[data-dev="c"]', { opacity: 0, y: 90, scale: 0.78, filter: 'blur(14px)', duration: 1.0, ease: 'power3.out' }, 0)
            .from('[data-dev="l"]', { opacity: 0, x: -70, y: 60, rotate: -14, filter: 'blur(10px)', duration: 0.9, ease: 'power3.out' }, 0.18)
            .from('[data-dev="r"]', { opacity: 0, x: 70, y: 60, rotate: 14, filter: 'blur(10px)', duration: 0.9, ease: 'power3.out' }, 0.26)
            .from('[data-spec]', { opacity: 0, y: 18, duration: 0.5, stagger: 0.06, ease: 'power2.out' }, 0.5)

          // ── scroll: the trio separates in depth, heat swells, type recedes
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root, start: 'top top', end: '+=140%',
              pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
            },
          })
          tl.to('[data-dev="c"]', { y: '-14vh', scale: 1.22, ease: 'none' }, 0)
            .to('[data-dev="l"]', { x: '-24vw', y: '6vh', rotate: -26, scale: 0.8, opacity: 0.55, ease: 'none' }, 0)
            .to('[data-dev="r"]', { x: '24vw', y: '6vh', rotate: 26, scale: 0.8, opacity: 0.55, ease: 'none' }, 0)
            .to('[data-heat]', { scale: 1.9, opacity: 0.95, ease: 'none' }, 0)
            .to('[data-headline]', { y: '-18vh', opacity: 0, ease: 'none' }, 0)
            .to('[data-specs]', { y: 40, opacity: 0, ease: 'none' }, 0)
        }
      )
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative h-screen min-h-[620px] overflow-hidden bg-[var(--gt-black)]">
      {/* heat bloom rising from below the devices */}
      <div
        data-heat
        aria-hidden
        className="gt-heat pointer-events-none absolute left-1/2 top-[58%] z-0 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full will-change-transform"
        style={{ background: 'radial-gradient(circle, rgba(255,122,24,0.55) 0%, rgba(225,27,11,0.28) 38%, rgba(10,9,8,0) 70%)' }}
      />

      {/* headline */}
      <div data-headline className="absolute inset-x-0 top-[13%] z-20 px-6 text-center will-change-transform md:top-[15%]">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.42em] text-[var(--gt-yellow)] md:text-sm" style={{ fontFamily: 'var(--font-brand)' }}>
          Introducing the all new
        </p>
        <h1 className="font-display mt-2 uppercase leading-[0.82] text-white" style={{ fontSize: 'min(12vw, 7.6rem)' }}>
          All-In-One <br />
          <span className="text-[var(--gt-yellow)]">Gas Tank</span>
        </h1>
      </div>

      {/* the three tiers */}
      <div className="absolute inset-x-0 top-[59%] z-10 -translate-y-1/2">
        <div className="relative mx-auto h-[46vh] max-h-[520px] w-full max-w-[1100px]">
          {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
          <img data-dev="l" src="/products/gas-tank/device-flavors.webp" alt="Gas Tank Flavors"
            className="absolute bottom-0 left-[6%] h-[74%] w-auto origin-bottom -rotate-[10deg] will-change-transform drop-shadow-[0_30px_50px_rgba(0,0,0,0.6)] md:left-[12%]" />
          {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
          <img data-dev="r" src="/products/gas-tank/device-resin.webp" alt="Gas Tank Live Resin"
            className="absolute bottom-0 right-[6%] h-[74%] w-auto origin-bottom rotate-[10deg] will-change-transform drop-shadow-[0_30px_50px_rgba(0,0,0,0.6)] md:right-[12%]" />
          {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
          <img data-dev="c" src="/products/gas-tank/device-rosin.webp" alt="Gas Tank Live Rosin"
            className="absolute bottom-[4%] left-1/2 z-10 h-[92%] w-auto -translate-x-1/2 will-change-transform drop-shadow-[0_40px_70px_rgba(0,0,0,0.7)]" />
          {/* NEW PRODUCT seal on the centre device */}
          <span className="absolute left-[60%] top-[46%] z-20 flex h-[74px] w-[74px] rotate-[14deg] items-center justify-center rounded-full bg-[var(--gt-red)] text-center text-[10px] font-extrabold uppercase leading-[1.1] tracking-wide text-white shadow-[0_10px_24px_rgba(225,27,11,0.5)] md:h-[92px] md:w-[92px] md:text-xs"
            style={{ fontFamily: 'var(--font-brand)' }}>
            New<br />Product
          </span>
        </div>
      </div>

      {/* spec pills */}
      <div data-specs className="absolute inset-x-0 bottom-[7%] z-20 px-4 will-change-transform">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-stretch justify-center gap-2 md:gap-3">
          {SPECS.map((s) => (
            <span
              key={s}
              data-spec
              className="rounded-xl border border-white/12 bg-white/[0.05] px-3 py-2.5 text-center text-[9px] font-extrabold uppercase leading-tight tracking-wider text-white/85 backdrop-blur-sm md:px-4 md:text-[11px]"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
