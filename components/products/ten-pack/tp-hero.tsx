'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// THE POUR.
//
// The jar sits in the smoke. Scrolling opens it: all TEN mini joints come up
// out of the mouth and fan into an arc across the frame — each on its own beat,
// its own angle, and its own depth.
//
// The depth is the part that sells it. The fan is laid out in real 3D: the
// container carries a perspective, and every joint gets a translateZ as well as
// an angle, so the ones that swing toward you genuinely grow and the ones that
// swing back genuinely recede. Two smoke plates drift behind at different rates.
//
// Geometry is generated, not hand-placed: ten joints across a -74deg..+74deg
// spread, dealt centre-outward so the fan opens like a hand of cards rather
// than sweeping one way. The spread comes from rotating about each joint's
// BOTTOM edge — that pivot is why it peacocks instead of sliding sideways.

const N = 10
const SPREAD = 74 // degrees either side of vertical

// deal order: centre pair first, then outward, alternating sides
const ORDER = [4, 5, 3, 6, 2, 7, 1, 8, 0, 9]

const JOINTS = Array.from({ length: N }, (_, i) => {
  const t = i / (N - 1) // 0..1 left to right
  const angle = -SPREAD + t * SPREAD * 2
  // middle of the fan reaches furthest and sits closest to camera
  const centreness = 1 - Math.abs(t - 0.5) * 2
  return {
    i,
    angle,
    reach: 30 + centreness * 16, // % of its own height, travelled up the arc
    z: -220 + centreness * 210, // px toward the camera
    beat: ORDER.indexOf(i) / N,
  }
})

const STATS = [
  { n: '10', l: 'Pre-rolls' },
  { n: '0.7g', l: 'Each' },
  { n: '7g', l: 'Total' },
]

export default function TpHero() {
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

          // entrance — the name and the jar land before anything opens
          gsap.timeline({ delay: 0.15 })
            .from('[data-tp-kicker]', { opacity: 0, y: -14, duration: 0.5, ease: 'power2.out' }, 0)
            .from('[data-tp-word]', { opacity: 0, yPercent: 16, filter: 'blur(14px)', duration: 0.9, stagger: 0.08, ease: 'power3.out' }, 0.08)
            .from('[data-tp-jar]', { opacity: 0, yPercent: 14, scale: 0.9, duration: 0.9, ease: 'power3.out' }, 0.2)
            .from('[data-tp-stat]', { opacity: 0, y: 20, duration: 0.5, stagger: 0.08, ease: 'power2.out' }, 0.6)

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root, start: 'top top', end: '+=190%',
              pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true,
            },
          })

          // the name pulls back so the pour owns the frame
          tl.to('[data-tp-head]', { scale: 0.52, yPercent: -12, opacity: 0, ease: 'power1.in', duration: 0.46 }, 0)
            .to('[data-tp-stats]', { opacity: 0, y: 30, ease: 'power2.in', duration: 0.2 }, 0.1)

          // …and the ten come out
          JOINTS.forEach((j) => {
            const at = 0.1 + j.beat * 0.34
            tl.fromTo(`[data-tp-joint="${j.i}"]`,
              { yPercent: 34, rotate: 0, scale: 0.5, opacity: 0, z: -420 },
              {
                yPercent: -j.reach * 1.9,
                rotate: j.angle,
                scale: 1,
                opacity: 1,
                z: j.z,
                ease: 'power2.out',
                duration: 0.42,
              }, at)
          })

          // the whole fan keeps rising and opening a little wider after it lands
          tl.to('[data-tp-fan]', { yPercent: -7, scale: 1.06, ease: 'none', duration: 0.34 }, 0.56)
            // the jar settles back as the joints take over
            .to('[data-tp-jar]', { yPercent: 10, scale: 0.92, ease: 'power1.out', duration: 0.4 }, 0.3)

          // smoke parallax
          tl.fromTo('[data-tp-smoke="far"]', { yPercent: 6 }, { yPercent: -8, ease: 'none', duration: 1 }, 0)
            .fromTo('[data-tp-smoke="near"]', { yPercent: 14 }, { yPercent: -18, ease: 'none', duration: 1 }, 0)
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
        className="media-hero-in relative h-[92vh] min-h-[600px] overflow-hidden rounded-[1.75rem] bg-[var(--tp-black)] md:rounded-[2.5rem]"
      >
        {/* two smoke plates, drifting at different rates */}
        <div data-tp-smoke="far" aria-hidden className="pointer-events-none absolute inset-0 z-0 will-change-transform">
          {/* eslint-disable-next-line @next/next/no-img-element -- texture */}
          <img src="/products/10-pack/smoke.webp" alt="" className="tp-smoke-a h-full w-full object-cover opacity-40" />
        </div>
        <div data-tp-smoke="near" aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[70%] will-change-transform">
          {/* eslint-disable-next-line @next/next/no-img-element -- texture */}
          <img src="/products/10-pack/smoke.webp" alt="" className="tp-smoke-b h-full w-full object-cover opacity-55" />
        </div>

        {/* electric wash off the bottom */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[1]"
          style={{ background: 'radial-gradient(120% 80% at 50% 108%, rgba(25,194,255,0.34) 0%, rgba(11,88,151,0.22) 34%, rgba(5,8,15,0) 72%)' }} />

        {/* THE NAME */}
        <div className="pointer-events-none absolute inset-x-0 top-[8%] z-30 px-[3vw] text-center">
          <div data-tp-head className="will-change-transform">
            <p data-tp-kicker className="text-[10px] font-extrabold uppercase tracking-[0.42em] text-[var(--tp-cyan)] md:text-sm"
              style={{ fontFamily: 'var(--font-brand)' }}>
              Ten mini joints · one jar
            </p>
            <h1 className="font-display mt-2 uppercase leading-[0.8] text-white" style={{ letterSpacing: '-0.03em' }}>
              <span data-tp-word className="block" style={{ fontSize: 'min(17vw, 9rem)' }}>10 Pack</span>
              <span data-tp-word className="block text-[var(--tp-cyan)]" style={{ fontSize: 'min(17vw, 9rem)' }}>Pre-Rolls</span>
            </h1>
          </div>
        </div>

        {/* THE POUR — jar + the ten, in a shared 3D space */}
        <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center" style={{ perspective: '1200px' }}>
          <div className="relative h-[74vh] w-full max-w-[900px]" style={{ transformStyle: 'preserve-3d' }}>
            {/* the fan of ten, pivoting at the jar mouth */}
            <div data-tp-fan className="absolute inset-x-0 bottom-[58%] z-10 will-change-transform" style={{ transformStyle: 'preserve-3d' }}>
              {JOINTS.map((j) => (
                // eslint-disable-next-line @next/next/no-img-element -- product art
                <img
                  key={j.i}
                  data-tp-joint={j.i}
                  src="/products/10-pack/joint.webp"
                  alt=""
                  aria-hidden
                  className="absolute bottom-0 left-1/2 h-[23vh] w-auto origin-bottom -translate-x-1/2 opacity-0 will-change-transform drop-shadow-[0_18px_30px_rgba(0,0,0,0.6)]"
                />
              ))}
            </div>

            {/* the jar */}
            <div data-tp-jar className="absolute inset-x-0 bottom-[8%] z-20 flex justify-center will-change-transform">
              {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
              <img src="/products/10-pack/jar-06-og.webp" alt="Jungle Boys 10 Pack Pre-Rolls"
                className="h-[54vh] max-h-[600px] w-auto drop-shadow-[0_36px_60px_rgba(0,0,0,0.75)]" />
            </div>
          </div>
        </div>

        {/* stat pills */}
        <div data-tp-stats className="absolute inset-x-0 bottom-[4%] z-30 will-change-transform">
          <div className="mx-auto flex w-full max-w-[720px] items-stretch justify-center gap-2 px-4 md:gap-4">
            {STATS.map((s) => (
              <span key={s.l} data-tp-stat
                className="flex flex-1 flex-col items-center rounded-2xl border border-white/15 bg-black/45 px-3 py-2.5 backdrop-blur-md md:px-5 md:py-3.5">
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
