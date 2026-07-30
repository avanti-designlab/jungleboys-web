'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// THE BANK.
//
// The name owns the whole first frame — one line, edge to edge, vw-only so it
// never stops growing on a wide screen. Below it a ROW of jars sits deliberately
// oversized and cropped off the bottom edge: five of them at different heights,
// angles and depths, each idling on its own clock so the row never pulses in
// unison. Cropping is the point — it lets them be far bigger than the frame.
//
// The ten don't fan any more; they RISE. Each joint climbs up through the row
// from behind, on its own lane, speed, spin and depth, so you're watching a
// stream come up through the weather rather than a fan open in place. That also
// frees the jars to be as large as they like.
//
// The smoke behind it is a real filmed plate, screen-blended onto the panel.

const JARS = [
  { src: 'jar-la-gelato', x: -40, y: 16, h: 58, rot: -9, z: -260, bob: 'a', dur: 11 },
  { src: 'jar-all-cherriez', x: -21, y: 4, h: 70, rot: 5, z: -80, bob: 'b', dur: 9 },
  { src: 'jar-06-og', x: 0, y: -4, h: 80, rot: -3, z: 120, bob: 'a', dur: 13 },
  { src: 'jar-rs1000', x: 21, y: 6, h: 68, rot: 8, z: -60, bob: 'b', dur: 10 },
  { src: 'jar-blu-zerdz', x: 40, y: 18, h: 56, rot: -11, z: -280, bob: 'a', dur: 12 },
]

// ten lanes across the frame — deterministic, so the composition never shuffles
const N = 10
const RISERS = Array.from({ length: N }, (_, i) => {
  const t = (i + 0.5) / N
  const s = Math.sin(i * 45.233) * 3571.17
  const r = s - Math.floor(s)
  return {
    i,
    x: -46 + t * 92 + (r - 0.5) * 5, // vw lane
    h: 15 + r * 11, // vh tall — the far ones are smaller
    rot: -26 + r * 52,
    z: -520 + r * 620,
    lead: r * 0.3, // stagger
    climb: 118 + r * 40, // vh travelled
  }
})

const STATS = [
  { n: '10', l: 'Pre-rolls' },
  { n: '0.7g', l: 'Each' },
  { n: '7g', l: 'Total' },
]

export default function TpHero() {
  const rootRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

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
            videoRef.current?.pause()
            return
          }

          gsap.timeline({ delay: 0.15 })
            .from('[data-tp-kicker]', { opacity: 0, y: -14, duration: 0.5, ease: 'power2.out' }, 0)
            .from('[data-tp-word]', { opacity: 0, xPercent: -10, filter: 'blur(16px)', duration: 0.9, ease: 'power3.out' }, 0.06)
            .from('[data-tp-word2]', { opacity: 0, xPercent: 10, filter: 'blur(16px)', duration: 0.9, ease: 'power3.out' }, 0.14)
            .from('[data-tp-jar-in]', { opacity: 0, yPercent: 22, duration: 1, stagger: 0.07, ease: 'power3.out' }, 0.24)
            .from('[data-tp-stat]', { opacity: 0, y: 20, duration: 0.5, stagger: 0.08, ease: 'power2.out' }, 0.7)

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root, start: 'top top', end: '+=190%',
              pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true,
            },
          })

          // the name pulls back, one clean move
          tl.to('[data-tp-head]', { scale: 0.5, yPercent: -10, opacity: 0, ease: 'power1.in', duration: 0.46 }, 0)
            .to('[data-tp-stats]', { opacity: 0, y: 30, ease: 'power2.in', duration: 0.2 }, 0.08)

          // the row breathes forward and drifts up as you travel through it
          JARS.forEach((j, i) => {
            tl.fromTo(`[data-tp-jar="${i}"]`,
              { yPercent: 0 },
              { yPercent: -10 - (j.z + 300) / 90, ease: 'none', duration: 1 }, 0)
          })
          tl.to('[data-tp-row]', { scale: 1.14, ease: 'none', duration: 1 }, 0)

          // the ten rise through the row
          RISERS.forEach((r) => {
            // ONE tween with an opacity keyframe track — two overlapping opacity
            // tweens on a scrub fight each other and read as a flicker
            tl.fromTo(`[data-tp-rise="${r.i}"]`,
              { yPercent: 60, rotate: r.rot * 0.3, z: r.z, opacity: 0 },
              {
                yPercent: -r.climb, rotate: r.rot, z: r.z, ease: 'none', duration: 0.88,
                keyframes: { opacity: [0, 1, 1, 0], ease: 'none' },
              },
              0.06 + r.lead)
          })
        }
      )
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative px-2 pb-2 pt-2 md:px-3 md:pb-3">
      <div
        data-nav-theme="dark"
        className="media-hero-in relative h-[92vh] min-h-[600px] overflow-hidden rounded-[1.75rem] bg-[var(--tp-black)] [--tp-jar-k:0.82] [--tp-jar-kc:0.62] md:rounded-[2.5rem] md:[--tp-jar-k:1] md:[--tp-jar-kc:1]"
      >
        {/* Real smoke plate. The source is white smoke on pure black — despite
            being sold as an "alpha channel" clip it is plain H.264, which has
            no alpha — so `screen` does the compositing: black contributes
            nothing, the smoke stays. The panel's entrance animation makes it a
            stacking context, which conveniently keeps the blend scoped to this
            panel instead of leaking onto the page behind it.
            It also opens and closes on black, so the loop has no visible seam. */}
        <video
          ref={videoRef}
          aria-hidden
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover mix-blend-screen"
        >
          <source src="/products/10-pack/smoke.mp4" type="video/mp4" />
        </video>

        {/* electric wash off the bottom */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[1]"
          style={{ background: 'radial-gradient(120% 80% at 50% 108%, rgba(46,139,255,0.4) 0%, rgba(11,88,151,0.24) 34%, rgba(5,8,15,0) 74%)' }} />

        {/* THE NAME — one line, edge to edge, vw only */}
        <div className="pointer-events-none absolute inset-x-0 top-[13%] z-30 px-[2vw] text-center">
          <div data-tp-head className="will-change-transform">
            <p data-tp-kicker className="text-[10px] font-extrabold uppercase tracking-[0.42em] text-[var(--tp-cyan)] md:text-sm"
              style={{ fontFamily: 'var(--font-brand)' }}>
              Ten mini joints · one jar
            </p>
            <h1 className="font-display mt-1 flex items-baseline justify-center whitespace-nowrap uppercase leading-[0.84] text-white"
              style={{ fontSize: '17.4vw', letterSpacing: '-0.035em', textShadow: '0 8px 44px rgba(2,10,24,0.75)' }}>
              <span data-tp-word className="will-change-transform">10PK</span>
              <span aria-hidden style={{ width: '0.14em' }} />
              <span className="sr-only"> </span>
              <span data-tp-word2 className="text-[var(--tp-cyan)] will-change-transform">Pre-Rolls</span>
            </h1>
          </div>
        </div>

        {/* THE RISERS — ten climbing up through the row */}
        <div className="pointer-events-none absolute inset-0 z-[22]" style={{ perspective: '1300px' }}>
          <div className="relative h-full w-full" style={{ transformStyle: 'preserve-3d' }}>
            {RISERS.map((r) => (
              // eslint-disable-next-line @next/next/no-img-element -- product art
              <img key={r.i} data-tp-rise={r.i} loading="lazy" decoding="async" src="/products/10-pack/joint.webp" alt="" aria-hidden
                className="absolute bottom-0 left-1/2 w-auto opacity-0 will-change-transform drop-shadow-[0_14px_24px_rgba(0,0,0,0.55)]"
                style={{ height: `${r.h}vh`, marginLeft: `${r.x}vw` }} />
            ))}
          </div>
        </div>

        {/* light behind the row — glass needs something to catch */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[8] h-[70%]"
          style={{ background: 'radial-gradient(80% 62% at 50% 88%, rgba(120,190,255,0.34) 0%, rgba(46,139,255,0.16) 40%, rgba(5,8,15,0) 74%)' }} />

        {/* THE ROW — oversized jars, cropped off the bottom on purpose */}
        <div data-tp-row className="absolute inset-x-0 bottom-[-6%] z-10 will-change-transform md:bottom-[-16%]" style={{ perspective: '1400px' }}>
          <div className="relative mx-auto h-[67vh] w-full max-w-[1500px] md:h-[74vh]" style={{ transformStyle: 'preserve-3d' }}>
            {JARS.map((j, i) => (
              <div key={j.src} data-tp-jar={i}
                className="absolute bottom-0 left-1/2 w-max will-change-transform"
                style={{ marginLeft: `${j.x}vw`, transform: `translateZ(${j.z}px)`, zIndex: Math.round(j.z / 10) + 40 }}>
                {/* entrance lives on its OWN element — the scrub owns yPercent on
                    the parent, and two timelines on one property snap */}
                <div data-tp-jar-in className="will-change-transform">
                  <div className={`tp-bob-${j.bob}`} style={{ ['--tp-rot' as string]: `${j.rot}deg`, ['--tp-dur' as string]: `${j.dur}s` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
                    <img
                      // NO fetchPriority hint at all. I guessed the LCP jar twice and
                      // was wrong twice: "tallest" is not "largest painted area" —
                      // jar-rs1000 (h:68) renders 131,130px2 against jar-06-og's
                      // 115,008px2, because the shorter jars sit lower and wider in
                      // frame. A wrong hint is worse than none, and the browser's own
                      // selection is exactly the thing LCP measures.
                      src={`/products/10-pack/${j.src}.webp`} alt="Jungle Boys 10 Pack Pre-Rolls"
                      className="w-auto -translate-x-1/2 drop-shadow-[0_40px_70px_rgba(0,0,0,0.8)]"
                      style={{
                        height: `calc(${j.h}vh * var(${j.h === 80 ? '--tp-jar-kc' : '--tp-jar-k'}, 1))`,
                        marginTop: `calc(${j.y}vh * var(--tp-jar-k, 1))`,
                      }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* stat pills */}
        <div data-tp-stats className="absolute inset-x-0 bottom-[14%] z-30 will-change-transform md:bottom-[4%]">
          <div className="mx-auto flex w-full max-w-[720px] items-stretch justify-center gap-2 px-4 md:gap-4">
            {STATS.map((s) => (
              <span key={s.l} data-tp-stat
                className="flex flex-1 flex-col items-center rounded-2xl border border-white/15 bg-black/55 px-3 py-2.5 backdrop-blur-md md:px-5 md:py-3.5">
                <span className="font-display leading-none text-white" style={{ fontSize: 'min(8vw, 2.4rem)' }}>{s.n}</span>
                <span className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.24em] text-[var(--tp-cyan)] md:text-[11px]"
                  style={{ fontFamily: 'var(--font-brand)' }}>{s.l}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
