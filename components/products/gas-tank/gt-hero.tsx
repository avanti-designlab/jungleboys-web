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
// The wordmark leaves on ONE continuous tween — the camera simply pulls back
// from it. It does not split into two words and it does not travel far enough
// to fall off frame; both of those read as a glitch rather than a move.
//
// The three devices then rise up out of the flames, with a tongue of the same
// fire drawn IN FRONT of them so it licks over the bases. On the way out the
// whole rig zooms back rather than disappearing.
//
// Nothing here is an image or a video — the fire is simulated per frame in
// gt-fire.tsx, which is why it can react to scroll at all.
//
// The devices use the `-n` (normalised) art, rebuilt from the STRAIGHT-ON
// masters in Figma (flavors-3 / magnific / resin-3) rather than the angled
// three-quarter shots the page shipped with — those read as three unrelated
// products no matter how they were sized. Each is cropped to its solid pixels,
// scaled to one shared body width and centred on one shared canvas, so equal
// width here gives a genuinely matched trio. They are NOT rotated: these are
// dead-on renders and any tilt brings the mismatch straight back.

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
        {
          isMobile: '(max-width: 767px)',
          reduce: '(prefers-reduced-motion: reduce)',
          noPref: '(prefers-reduced-motion: no-preference)',
        },
        (mmCtx) => {
          const c = mmCtx.conditions as Record<string, boolean>
          if (c.reduce) {
            // [data-rig] is opacity-0 in the markup so the devices never flash
            // before hydration — under reduced motion nothing else clears it,
            // so all three were simply invisible. Land the settled trio.
            gsap.set('[data-rig]', { opacity: 1, scale: 1 })
            gsap.set('[data-dev]', { opacity: 1, xPercent: 0, yPercent: 0, scale: 1 })
            return
          }

          // ── cold start: the name slams in, the bed is still just embers
          gsap.timeline({ delay: 0.15 })
            .from('[data-word="gas"]', { opacity: 0, xPercent: -14, filter: 'blur(16px)', duration: 0.85, ease: 'power3.out' }, 0)
            .from('[data-word="tank"]', { opacity: 0, xPercent: 14, filter: 'blur(16px)', duration: 0.85, ease: 'power3.out' }, 0.08)

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root, start: 'top top', end: '+=150%',
              pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true,
              // the scrub IS the throttle — scrolling feeds the fire
              onUpdate: (self) => {
                const p = self.progress
                const v = p < 0.45 ? 0.18 + (p / 0.45) * 0.82 : 1 - ((p - 0.45) / 0.55) * 0.28
                fireRef.current?.setIntensity(v)
              },
            },
          })

          // The rig is opacity-0 in the markup so the devices are never visible
          // before hydration. Clear that ONCE, here — it used to be a tween
          // inside the scrub, and a 0.06-long opacity flip on the parent meant
          // all three devices blinked on together in the middle of their own
          // staggered entrances. Each device now carries its own opacity, so
          // nothing is revealed except by its own beat.
          gsap.set('[data-rig]', { opacity: 1 })

          // ONE tween for the whole wordmark: a clean camera pull-back
          tl.to('[data-headline]', {
            scale: 0.5, yPercent: -6, opacity: 0,
            ease: 'power1.in', duration: 0.3,
          }, 0)

          // THE LAUNCH. The flankers sweep in from the sides, then the white
          // centre rises between them — three beats, each overshooting slightly
          // so it lands rather than fades in.
          //
          // Nothing launches until the wordmark has gone: the first device
          // starts at 0.32, just after the headline finishes pulling back at
          // 0.30. The beats are 0.09 apart, tight enough to read as one move
          // arriving in sequence; at 0.13 the flankers sat finished and alone
          // while you waited on the white one.
          const LAUNCH: [string, gsap.TweenVars, number][] = [
            ['l', { xPercent: -58, yPercent: 12, opacity: 0, scale: 1.06 }, 0.32],
            ['r', { xPercent: 58, yPercent: 12, opacity: 0, scale: 1.06 }, 0.41],
            ['c', { yPercent: 78, opacity: 0, scale: 1.06 }, 0.50],
          ]
          LAUNCH.forEach(([k, from, at]) => {
            tl.fromTo(`[data-dev="${k}"]`,
              from,
              { xPercent: 0, yPercent: 0, opacity: 1, scale: 1, ease: 'back.out(1.05)', duration: 0.3 }, at)
          })
          // and they keep growing toward you for the rest of the scrub. Kept
          // small on mobile: the group is already a touch wider than the frame,
          // and 1.07 there pushed 30px of the grey and the black off the edges.
          tl.to('[data-rig]', { scale: c.isMobile ? 1.03 : 1.07, ease: 'none', duration: 0.24 }, 0.76)
        }
      )
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    // pill panel, matching the hero treatment on the rest of the site
    <section ref={rootRef} className="relative px-2 pt-2 md:px-3">
      <div
        data-nav-theme="dark"
        className="media-hero-in relative h-[92vh] min-h-[580px] overflow-hidden rounded-[1.75rem] bg-[var(--gt-black)] md:rounded-[2.5rem]"
      >
        {/* ── the burn ── simulated, scroll-fed, behind every bit of content */}
        <GtFire
          ref={fireRef}
          className="z-0 h-[86%] opacity-90 mix-blend-screen [mask-image:linear-gradient(to_top,#000_28%,rgba(0,0,0,0.55)_62%,transparent_96%)]"
          frontClassName="z-[25] h-[24%] opacity-80 mix-blend-screen [mask-image:linear-gradient(to_top,#000_35%,transparent_92%)]"
        />

        {/* heat throw off the bed, so the black above the flames isn't dead */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[78%]"
          style={{ background: 'radial-gradient(120% 78% at 50% 100%, rgba(255,122,24,0.34) 0%, rgba(225,27,11,0.16) 34%, rgba(10,9,8,0) 72%)' }} />

        {/* embers riding the updraft */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[26] opacity-70">
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
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-[2vw]">
          <div data-headline className="w-full text-center will-change-transform">
          {/* one line, vw only — a rem cap stops it filling the frame on desktop */}
            {/* tracked and stacked tight against GAS TANK, like every other
                Bebas lockup on the site — the wide 0.1em tracking read as a
                different typeface next to it */}
            <p className="font-display mb-[0.1vw] uppercase leading-[0.82] text-white"
              style={{ fontSize: 'min(7.5vw, 3.2rem)', letterSpacing: '-0.03em' }}>
              The New All-In-One
            </p>
            <h1 className="font-display flex items-baseline justify-center whitespace-nowrap uppercase leading-[0.82] text-white"
            style={{ fontSize: '33vw', letterSpacing: '-0.03em' }}>
            {/* The sr-only phrase PLUS aria-hidden words fixed screen readers by
                duplicating the heading for crawlers — this extracted as
                "Gas TankGasTank". The 10-Pack pattern instead: no duplicate
                node, and the fixed-width spacer carries a real space so the
                text node reads "Gas Tank" to both. */}
            <span data-word="gas" className="will-change-transform drop-shadow-[0_0_60px_rgba(255,122,24,0.45)]">Gas</span>
            <span aria-hidden style={{ width: '0.16em' }} />
            <span className="sr-only"> </span>
            <span data-word="tank" className="text-[var(--gt-yellow)] will-change-transform drop-shadow-[0_0_60px_rgba(225,27,11,0.5)]">Tank</span>
            </h1>
          </div>
        </div>

        {/* The three tiers, rising out of the bed — equal width = equal device.
            On a phone all three cannot stand clear of each other at this size,
            so they overlap (-31vw) and the trio lands inside the frame instead
            of two of them hanging off the edges. items-END is what makes it
            read as a group: all three stand on one baseline with the centre
            rising taller in front, rather than hanging from a shared ceiling
            with the white one dropping 22% below the other two. */}
        <div data-rig className="absolute inset-x-0 top-[22%] z-20 h-[50%] opacity-0 will-change-transform md:top-[1%] md:h-[116%]">
          <div className="flex h-full items-end justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
            <img data-dev="l" src="/products/gas-tank/device-flavors-n.webp" alt="Gas Tank Flavors"
              className="-mr-[31vw] h-[84%] w-auto will-change-transform drop-shadow-[0_30px_60px_rgba(0,0,0,0.7)] md:-mr-[8vw] md:mt-0 md:h-full" />
            {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
            <img data-dev="c" src="/products/gas-tank/device-rosin-n.webp" alt="Gas Tank Live Rosin"
              className="z-10 h-full w-auto will-change-transform drop-shadow-[0_44px_80px_rgba(0,0,0,0.85)]" />
            {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
            <img data-dev="r" src="/products/gas-tank/device-resin-n.webp" alt="Gas Tank Live Resin"
              className="-ml-[31vw] h-[84%] w-auto will-change-transform drop-shadow-[0_30px_60px_rgba(0,0,0,0.7)] md:-ml-[8vw] md:mt-0 md:h-full" />
          </div>
        </div>

      </div>
    </section>
  )
}
