'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// IGNITION. GAS TANK lands almost edge to edge — the whole first frame is the
// name. Then it blows through you (scale up + blur out) and the three devices
// rush forward out of the same vanishing point, huge and tightly stacked, so
// the type literally becomes the product. Heat swells behind the whole move.
//
// Devices in the ART are the three tiers: Flavors (grey), Live Rosin (white,
// the new one, centre) and Live Resin (black).

const SPECS = [
  { icon: 'palm', label: 'Palm sized\nand discreet' },
  { icon: 'extracts', label: 'Built for\npure extracts' },
  { icon: 'vapor', label: 'Big vapor,\nsmooth pull' },
  { icon: 'taste', label: 'Uncompromised\ntaste' },
  { icon: 'lasts', label: 'Performance\nthat lasts' },
  { icon: 'ccell', label: 'Powered by\nCCELL tech' },
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

          // ── entrance: the name slams in first, devices stay in the dark
          gsap.timeline({ delay: 0.15 })
            .from('[data-kicker]', { opacity: 0, y: -14, duration: 0.5, ease: 'power2.out' }, 0)
            .from('[data-word="gas"]', { opacity: 0, xPercent: -18, filter: 'blur(16px)', duration: 0.85, ease: 'power3.out' }, 0.1)
            .from('[data-word="tank"]', { opacity: 0, xPercent: 18, filter: 'blur(16px)', duration: 0.85, ease: 'power3.out' }, 0.18)
            .from('[data-spec]', { opacity: 0, y: 18, duration: 0.45, stagger: 0.05, ease: 'power2.out' }, 0.55)

          // ── scroll: type blows past, devices rush forward out of the same point
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root, start: 'top top', end: '+=90%',
              pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
            },
          })
          // 0 → 0.42: the wordmark scales through the camera and clears out
          tl.to('[data-word="gas"]', { xPercent: -26, scale: 1.9, opacity: 0, filter: 'blur(18px)', ease: 'power2.in', duration: 0.42 }, 0)
            .to('[data-word="tank"]', { xPercent: 26, scale: 1.9, opacity: 0, filter: 'blur(18px)', ease: 'power2.in', duration: 0.42 }, 0)
            .to('[data-kicker]', { opacity: 0, y: -30, duration: 0.2 }, 0)
            // 0.16 → 0.62: the trio arrives from depth, huge and tight
            .fromTo('[data-rig]',
              { scale: 0.26, yPercent: 26, opacity: 0, filter: 'blur(12px)' },
              { scale: 1, yPercent: 0, opacity: 1, filter: 'blur(0px)', ease: 'power2.out', duration: 0.46 }, 0.16)
            // 0.62 → 1: they settle and fan a touch, centre pushing forward
            .to('[data-dev="c"]', { yPercent: -6, scale: 1.1, ease: 'none', duration: 0.38 }, 0.62)
            .to('[data-dev="l"]', { xPercent: -26, rotate: -13, ease: 'none', duration: 0.38 }, 0.62)
            .to('[data-dev="r"]', { xPercent: 26, rotate: 13, ease: 'none', duration: 0.38 }, 0.62)
            .to('[data-heat]', { scale: 2, opacity: 0.95, ease: 'none', duration: 1 }, 0)
            .to('[data-specs]', { y: 34, opacity: 0, ease: 'none', duration: 0.35 }, 0.05)
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
      className="relative h-screen min-h-[620px] overflow-hidden bg-[var(--gt-black)]"
    >
      {/* heat bloom rising behind the whole frame */}
      <div
        data-heat
        aria-hidden
        className="gt-heat pointer-events-none absolute left-1/2 top-[56%] z-0 h-[68vh] w-[68vh] -translate-x-1/2 -translate-y-1/2 rounded-full will-change-transform"
        style={{ background: 'radial-gradient(circle, rgba(255,122,24,0.5) 0%, rgba(225,27,11,0.26) 38%, rgba(10,9,8,0) 70%)' }}
      />

      {/* THE NAME — near edge to edge, the entire first frame */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 -translate-y-[58%] px-[2vw] text-center">
        <p data-kicker className="mb-[1.5vw] text-[10px] font-extrabold uppercase tracking-[0.42em] text-[var(--gt-yellow)] md:text-sm" style={{ fontFamily: 'var(--font-brand)' }}>
          Introducing the all new all-in-one
        </p>
        {/* one line, edge to edge — vw only, never a rem cap, or it stops
            filling the frame on wide screens */}
        <h1 className="font-display flex items-baseline justify-center whitespace-nowrap uppercase leading-[0.82] text-white"
          style={{ fontSize: '34.5vw', letterSpacing: '-0.03em' }}>
          <span data-word="gas" className="will-change-transform">Gas</span>
          <span aria-hidden style={{ width: '0.16em' }} />
          <span data-word="tank" className="text-[var(--gt-yellow)] will-change-transform">Tank</span>
        </h1>
      </div>

      {/* the three tiers — one rig that rushes forward as one */}
      <div data-rig className="absolute inset-x-0 top-[52%] z-10 -translate-y-1/2 opacity-0 will-change-transform">
        <div className="relative mx-auto h-[62vh] max-h-[640px] w-full max-w-[720px]">
          {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
          <img data-dev="l" src="/products/gas-tank/device-flavors.webp" alt="Gas Tank Flavors"
            className="absolute bottom-0 left-[13%] h-[82%] w-auto origin-bottom -rotate-[7deg] will-change-transform drop-shadow-[0_30px_50px_rgba(0,0,0,0.6)]" />
          {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
          <img data-dev="r" src="/products/gas-tank/device-resin.webp" alt="Gas Tank Live Resin"
            className="absolute bottom-0 right-[13%] h-[82%] w-auto origin-bottom rotate-[7deg] will-change-transform drop-shadow-[0_30px_50px_rgba(0,0,0,0.6)]" />
          {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
          <img data-dev="c" src="/products/gas-tank/device-rosin.webp" alt="Gas Tank Live Rosin"
            className="absolute bottom-[3%] left-1/2 z-10 h-full w-auto -translate-x-1/2 will-change-transform drop-shadow-[0_44px_74px_rgba(0,0,0,0.75)]" />
        </div>
      </div>

      {/* spec pills — one line, Figma icons */}
      <div data-specs className="absolute inset-x-0 bottom-[5%] z-20 will-change-transform">
        <div className="gt-specs-row mx-auto flex w-full max-w-[1320px] items-stretch justify-start gap-1.5 overflow-x-auto px-4 md:justify-center md:gap-2.5 md:overflow-visible">
          {SPECS.map((s) => (
            <span
              key={s.icon}
              data-spec
              className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-white/12 bg-white/[0.05] px-2.5 py-2 text-left text-[9px] font-extrabold uppercase leading-[1.15] tracking-wider text-white/85 backdrop-blur-sm md:px-3.5 md:py-2.5 md:text-[10px]"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- inline icon */}
              <img src={`/products/gas-tank/icons/${s.icon}.svg`} alt="" aria-hidden className="h-4 w-4 shrink-0 object-contain md:h-[18px] md:w-[18px]" />
              <span className="block">
                {s.label.split('\n')[0]}<br />{s.label.split('\n')[1]}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
