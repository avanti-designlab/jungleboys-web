'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import GtFire, { type GtFireHandle } from './gt-fire'

gsap.registerPlugin(ScrollTrigger)

// THE IGNITION SEQUENCE.
//
// Cold start: a black frame, GAS TANK edge to edge, and a bed of embers barely
// alive at the bottom. Scrolling is what feeds the fire — the scrub drives the
// simulation's intensity directly, so the flames climb the frame under your
// thumb instead of looping on a timer.
//
// As the burn takes hold the wordmark doesn't cut out: the camera pulls back
// from it, shrinking it into the distance. The three devices then RISE UP OUT
// OF THE FLAMES from below the fold, growing to fill the frame, with a tongue
// of the same fire drawn IN FRONT of them so it licks over the bases. On the
// way out the whole rig zooms back rather than disappearing.
//
// Nothing here is an image or a video — the fire is simulated per frame in
// gt-fire.tsx, which is why it can react to scroll at all.
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

// embers drifting up off the bed — left/delay/duration/size, hand-scattered so
// they don't read as a grid
const EMBERS = [
  [6, 0, 7.5, 3], [14, 2.4, 9, 2], [23, 4.1, 8, 4], [31, 1.2, 10, 2],
  [39, 5.6, 7, 3], [47, 3.0, 9.5, 2], [54, 6.4, 8.5, 3], [62, 0.8, 10.5, 2],
  [70, 4.8, 7.8, 4], [78, 2.0, 9.2, 2], [86, 5.2, 8.2, 3], [94, 3.6, 10, 2],
] as const

export default function GtHero() {
  const rootRef = useRef<HTMLElement>(null)
  const fireRef = useRef<GtFireHandle>(null)

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

          // ── cold start: the name slams in, the bed is still just embers
          gsap.timeline({ delay: 0.15 })
            .from('[data-kicker]', { opacity: 0, y: -14, duration: 0.5, ease: 'power2.out' }, 0)
            .from('[data-word="gas"]', { opacity: 0, xPercent: -18, filter: 'blur(16px)', duration: 0.85, ease: 'power3.out' }, 0.1)
            .from('[data-word="tank"]', { opacity: 0, xPercent: 18, filter: 'blur(16px)', duration: 0.85, ease: 'power3.out' }, 0.18)
            .from('[data-spec]', { opacity: 0, y: 18, duration: 0.45, stagger: 0.05, ease: 'power2.out' }, 0.55)

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root, start: 'top top', end: '+=150%',
              pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
              // the scrub IS the throttle — scrolling feeds the fire
              onUpdate: (self) => {
                const p = self.progress
                const v = p < 0.45 ? 0.16 + (p / 0.45) * 0.84 : 1 - ((p - 0.45) / 0.55) * 0.28
                fireRef.current?.setIntensity(v)
              },
            },
          })

          // the camera pulls back off the wordmark — it recedes, it never cuts
          tl.to('[data-word="gas"]', { xPercent: -4, ease: 'power1.inOut', duration: 0.22 }, 0)
            .to('[data-word="tank"]', { xPercent: 4, ease: 'power1.inOut', duration: 0.22 }, 0)
            .to('[data-headline]', { scale: 0.3, y: '-24vh', ease: 'power2.inOut', duration: 0.54 }, 0)
            .to('[data-headline]', { opacity: 0, filter: 'blur(6px)', ease: 'power1.in', duration: 0.2 }, 0.52)
            .to('[data-kicker]', { opacity: 0, duration: 0.12 }, 0)

          // the trio rises up out of the fire
          tl.fromTo('[data-rig]',
            { yPercent: 64, scale: 0.58, opacity: 0, filter: 'blur(10px)' },
            { yPercent: 0, scale: 1, opacity: 1, filter: 'blur(0px)', ease: 'power2.out', duration: 0.5 }, 0.12)
            // they settle and fan
            .to('[data-dev="c"]', { yPercent: -5, scale: 1.08, ease: 'power1.out', duration: 0.2 }, 0.62)
            .to('[data-dev="l"]', { xPercent: -22, rotate: -12, ease: 'power1.out', duration: 0.2 }, 0.62)
            .to('[data-dev="r"]', { xPercent: 22, rotate: 12, ease: 'power1.out', duration: 0.2 }, 0.62)
            // …then the camera pulls back off them too
            .to('[data-rig]', { scale: 0.86, yPercent: -5, ease: 'power2.in', duration: 0.18 }, 0.82)

          tl.to('[data-specs]', { y: 40, opacity: 0, ease: 'power2.in', duration: 0.2 }, 0.3)
            .to('[data-embers]', { opacity: 0.9, ease: 'none', duration: 0.4 }, 0)
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
      {/* ── the burn ── simulated, scroll-fed, behind every bit of content */}
      <GtFire
        ref={fireRef}
        className="z-0 h-[86%] opacity-90 mix-blend-screen [mask-image:linear-gradient(to_top,#000_28%,rgba(0,0,0,0.55)_62%,transparent_96%)]"
        frontClassName="z-[15] h-[24%] opacity-80 mix-blend-screen [mask-image:linear-gradient(to_top,#000_35%,transparent_92%)]"
      />

      {/* heat throw off the bed, so the black above the flames isn't dead */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[78%]"
        style={{ background: 'radial-gradient(120% 78% at 50% 100%, rgba(255,122,24,0.34) 0%, rgba(225,27,11,0.16) 34%, rgba(10,9,8,0) 72%)' }} />

      {/* embers riding the updraft */}
      <div data-embers aria-hidden className="pointer-events-none absolute inset-0 z-[16] opacity-70">
        {EMBERS.map(([left, delay, dur, size]) => (
          <span
            key={`${left}-${delay}`}
            className="gt-ember absolute bottom-[6%] rounded-full bg-[#ffb547]"
            style={{
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              animationDelay: `${delay}s`,
              animationDuration: `${dur}s`,
            }}
          />
        ))}
      </div>

      {/* THE NAME — edge to edge, the whole cold-start frame */}
      <div data-headline className="pointer-events-none absolute inset-x-0 top-[13%] z-20 px-[2vw] text-center will-change-transform">
        <p data-kicker className="mb-[1.5vw] text-[10px] font-extrabold uppercase tracking-[0.42em] text-[var(--gt-yellow)] md:text-sm" style={{ fontFamily: 'var(--font-brand)' }}>
          Introducing the all new all-in-one
        </p>
        {/* one line, vw only — a rem cap stops it filling the frame on desktop */}
        <h1 className="font-display flex items-baseline justify-center whitespace-nowrap uppercase leading-[0.82] text-white"
          style={{ fontSize: '34.5vw', letterSpacing: '-0.03em' }}>
          <span data-word="gas" className="will-change-transform drop-shadow-[0_0_60px_rgba(255,122,24,0.45)]">Gas</span>
          <span aria-hidden style={{ width: '0.16em' }} />
          <span data-word="tank" className="text-[var(--gt-yellow)] will-change-transform drop-shadow-[0_0_60px_rgba(225,27,11,0.5)]">Tank</span>
        </h1>
      </div>

      {/* the three tiers, rising out of the bed */}
      <div data-rig className="absolute inset-x-0 bottom-[3%] z-10 opacity-0 will-change-transform">
        <div className="relative mx-auto h-[74vh] max-h-[780px] w-full max-w-[880px]">
          {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
          <img data-dev="l" src="/products/gas-tank/device-flavors.webp" alt="Gas Tank Flavors"
            className="absolute bottom-0 left-[11%] h-[80%] w-auto origin-bottom -rotate-[6deg] will-change-transform drop-shadow-[0_30px_60px_rgba(0,0,0,0.7)]" />
          {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
          <img data-dev="r" src="/products/gas-tank/device-resin.webp" alt="Gas Tank Live Resin"
            className="absolute bottom-0 right-[11%] h-[80%] w-auto origin-bottom rotate-[6deg] will-change-transform drop-shadow-[0_30px_60px_rgba(0,0,0,0.7)]" />
          {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
          <img data-dev="c" src="/products/gas-tank/device-rosin.webp" alt="Gas Tank Live Rosin"
            className="absolute bottom-[2%] left-1/2 z-10 h-full w-auto -translate-x-1/2 will-change-transform drop-shadow-[0_44px_80px_rgba(0,0,0,0.8)]" />
        </div>
      </div>

      {/* spec pills — one line, Figma icons, sitting over the burn */}
      <div data-specs className="absolute inset-x-0 bottom-[5%] z-30 will-change-transform">
        <div className="gt-specs-row mx-auto flex w-full max-w-[1320px] items-stretch justify-start gap-1.5 overflow-x-auto px-4 md:justify-center md:gap-2.5 md:overflow-visible">
          {SPECS.map((s) => (
            <span
              key={s.icon}
              data-spec
              className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-white/15 bg-black/55 px-2.5 py-2 text-left text-[9px] font-extrabold uppercase leading-[1.15] tracking-wider text-white/90 backdrop-blur-md md:px-3.5 md:py-2.5 md:text-[10px]"
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
