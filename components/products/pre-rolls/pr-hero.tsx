'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// PRE-ROLLS, full width.
//
// The name owns the first frame on one line, sized in vw only so it keeps
// growing on a wide screen. Under it a row of tubes sits deliberately oversized
// and cropped off the bottom edge — cropping is the point, it lets them be far
// bigger than the frame. Each idles on its own clock so the row never pulses in
// unison.
//
// The light is doing the work here rather than a texture: two slow aurora
// blooms in JB green behind everything, and a hard lime rake off the floor.

const TUBES = [
  { src: 'tube-zangria', x: -33, y: 10, h: 62, rot: -8, z: -220, bob: 'a', dur: 11 },
  { src: 'tube-pop-rockets', x: -12, y: -2, h: 76, rot: 4, z: 60, bob: 'b', dur: 9 },
  { src: 'tube-cherry-gelato', x: 12, y: -4, h: 80, rot: -3, z: 130, bob: 'a', dur: 13 },
  { src: 'tube-blu-og', x: 33, y: 12, h: 60, rot: 9, z: -260, bob: 'b', dur: 10 },
]

const STATS = [
  { n: '1G', l: 'Every roll' },
  { n: '100%', l: 'Indoor flower' },
  { n: '0', l: 'Trim, ever' },
]

export default function PrHero() {
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

          gsap.timeline({ delay: 0.15 })
            .from('[data-pr-kicker]', { opacity: 0, y: -14, duration: 0.5, ease: 'power2.out' }, 0)
            .from('[data-pr-word]', { opacity: 0, yPercent: 22, filter: 'blur(18px)', duration: 0.95, ease: 'power3.out' }, 0.06)
            .from('[data-pr-tube-in]', { opacity: 0, yPercent: 24, duration: 1, stagger: 0.08, ease: 'power3.out' }, 0.26)
            .from('[data-pr-stat]', { opacity: 0, y: 20, duration: 0.5, stagger: 0.08, ease: 'power2.out' }, 0.72)

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root, start: 'top top', end: '+=180%',
              pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true,
            },
          })

          tl.to('[data-pr-head]', { scale: 0.52, yPercent: -12, opacity: 0, ease: 'power1.in', duration: 0.46 }, 0)
            .to('[data-pr-stats]', { opacity: 0, y: 30, ease: 'power2.in', duration: 0.2 }, 0.08)

          // the row breathes forward as you travel through it. The entrance owns
          // [data-pr-tube-in] and the scrub owns the parent — two timelines on
          // one property snap at the handover.
          TUBES.forEach((t, i) => {
            tl.fromTo(`[data-pr-tube="${i}"]`,
              { yPercent: 0 },
              { yPercent: -10 - (t.z + 300) / 85, ease: 'none', duration: 1 }, 0)
          })
          tl.to('[data-pr-row]', { scale: 1.16, ease: 'none', duration: 1 }, 0)
        }
      )
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative px-2 pt-2 md:px-3">
      <div
        data-nav-theme="dark"
        className="media-hero-in relative h-[92vh] min-h-[600px] overflow-hidden rounded-[1.75rem] bg-[var(--pr-black)] md:rounded-[2.5rem]"
      >
        {/* two slow blooms, counter-rotating, so the light never sits still */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="pr-aurora absolute -inset-[30%]"
            style={{ background: 'radial-gradient(45% 42% at 32% 68%, rgba(20,160,74,0.55) 0%, rgba(20,160,74,0) 70%)' }} />
          <div className="pr-aurora-b absolute -inset-[30%]"
            style={{ background: 'radial-gradient(40% 38% at 70% 40%, rgba(125,255,79,0.3) 0%, rgba(125,255,79,0) 72%)' }} />
        </div>

        {/* hard lime rake off the floor */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[1]"
          style={{ background: 'radial-gradient(115% 72% at 50% 110%, rgba(125,255,79,0.42) 0%, rgba(20,160,74,0.2) 32%, rgba(4,16,10,0) 72%)' }} />

        {/* THE NAME — one line, edge to edge, vw only */}
        <div className="pointer-events-none absolute inset-x-0 top-[14%] z-30 px-[2vw] text-center">
          <div data-pr-head className="will-change-transform">
            <p data-pr-kicker className="text-[10px] font-extrabold uppercase tracking-[0.42em] text-[var(--pr-lime)] md:text-sm"
              style={{ fontFamily: 'var(--font-brand)' }}>
              One gram · single strain
            </p>
            <h1 data-pr-word
              className="font-display mt-1 whitespace-nowrap uppercase leading-[0.82] text-white will-change-transform"
              style={{ fontSize: '19.5vw', letterSpacing: '-0.04em', textShadow: '0 10px 60px rgba(2,20,8,0.8)' }}>
              Pre-Rolls
            </h1>
          </div>
        </div>

        {/* light behind the row — the tubes are glossy and need something to catch */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[8] h-[68%]"
          style={{ background: 'radial-gradient(78% 60% at 50% 90%, rgba(182,255,138,0.34) 0%, rgba(20,160,74,0.15) 42%, rgba(4,16,10,0) 74%)' }} />

        {/* THE ROW — oversized tubes, cropped off the bottom on purpose */}
        <div data-pr-row className="absolute inset-x-0 bottom-[-14%] z-10 will-change-transform" style={{ perspective: '1400px' }}>
          <div className="relative mx-auto h-[74vh] w-full max-w-[1500px]" style={{ transformStyle: 'preserve-3d' }}>
            {TUBES.map((t, i) => (
              <div key={t.src} data-pr-tube={i}
                // w-max: an absolutely positioned wrapper is shrink-to-fit, and a
                // percentage marginLeft eats the width it is measured against
                className="absolute bottom-0 left-1/2 w-max will-change-transform"
                style={{ marginLeft: `${t.x}vw`, transform: `translateZ(${t.z}px)`, zIndex: Math.round(t.z / 10) + 40 }}>
                <div data-pr-tube-in className="will-change-transform">
                  <div className={`pr-bob-${t.bob}`} style={{ ['--pr-rot' as string]: `${t.rot}deg`, ['--pr-dur' as string]: `${t.dur}s` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
                    <img src={`/products/pre-rolls/${t.src}.webp`} alt="Jungle Boys 1G Pre-Roll"
                      className="w-auto -translate-x-1/2 drop-shadow-[0_40px_70px_rgba(0,0,0,0.85)]"
                      style={{ height: `${t.h}vh`, marginTop: `${t.y}vh` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div data-pr-stats className="absolute inset-x-0 bottom-[4%] z-30 will-change-transform">
          <div className="mx-auto flex w-full max-w-[720px] items-stretch justify-center gap-2 px-4 md:gap-4">
            {STATS.map((s) => (
              <span key={s.l} data-pr-stat
                className="flex flex-1 flex-col items-center rounded-2xl border border-[var(--pr-lime)]/30 bg-black/72 px-3 py-2.5 backdrop-blur-md md:px-5 md:py-3.5">
                <span className="font-display leading-none text-white" style={{ fontSize: 'min(8vw, 2.4rem)' }}>{s.n}</span>
                <span className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.24em] text-[var(--pr-lime)] md:text-[11px]"
                  style={{ fontFamily: 'var(--font-brand)' }}>{s.l}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
