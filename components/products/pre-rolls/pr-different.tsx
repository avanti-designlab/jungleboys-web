'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// WE ROLL DIFFERENT — built as an actual 3D scene, not a diagram with lines.
//
// The Figma version was eight labels pinned around a flat joint with leader
// lines. Here the eight claims are real cards on a real ring: each sits at
// rotateY(i * 45deg) translateZ(R), so the ring is a genuine circle in space and
// the joint stands at its centre on translateZ(0). Because the ring and the
// joint are siblings inside one preserve-3d context, the browser depth-sorts
// them against each other — cards physically pass in front of the joint on the
// near side and behind it on the far side. That is the whole effect.
//
// Scroll turns the ring, so every claim is delivered to the front in turn.
//
// Radius and card width are clamp()ed rather than measured in JS: the ring has
// to stay wider than its cards at every viewport or they collide, and letting
// CSS solve that removes a resize listener and a whole class of stale-measurement
// bug.

const CLAIMS: { icon: string; text: string }[] = [
  { icon: 'indoor', text: '100% Indoor Flower' },
  { icon: 'quality', text: 'Crafted from ACTUAL Nugs' },
  { icon: 'sharing', text: 'Rolled to Perfection' },
  { icon: 'burn', text: 'Clean & Potent' },
  { icon: 'strain', text: 'Strain-Specific Options' },
  { icon: 'batches', text: 'Fresh Batches Only' },
  { icon: 'sealed', text: 'Even Burn & Smooth Draw' },
  { icon: 'quality-b', text: 'Lab-Tested & Trusted' },
]

const STEP = 360 / CLAIMS.length

export default function PrDifferent() {
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

          const cards = gsap.utils.toArray<HTMLElement>('[data-pr-card]')
          // quickSetters: this runs for 8 cards on every scrub tick, and going
          // through the generic setter path each time is measurably slower
          const setOpacity = cards.map((el) => gsap.quickSetter(el, 'opacity'))
          const setBlur = cards.map((el) => gsap.quickSetter(el, 'filter'))

          const state = { rot: 0 }
          const paint = () => {
            cards.forEach((_, i) => {
              // where this card currently sits relative to the viewer
              const a = ((i * STEP + state.rot) % 360 + 360) % 360
              const facing = Math.cos((a * Math.PI) / 180) // 1 = dead front
              const t = (facing + 1) / 2
              setOpacity[i](0.3 + t * 0.7)
              setBlur[i](`blur(${(1 - t) * 3.2}px)`)
            })
          }
          paint()

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root, start: 'top top', end: '+=260%',
              pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true,
            },
          })

          tl.fromTo('[data-pr-ring]',
            { rotateY: 18 },
            { rotateY: -342, ease: 'none', duration: 1 }, 0)
          // one tween owns the ring angle; this mirrors it into the per-card
          // emphasis rather than running a second competing tween
          tl.to(state, {
            rot: -360, ease: 'none', duration: 1, onUpdate: paint,
          }, 0)

          tl.fromTo('[data-pr-joint]', { yPercent: 6, rotate: -2 }, { yPercent: -6, rotate: 2, ease: 'none', duration: 1 }, 0)

          gsap.from('[data-pr-diff-head]', {
            opacity: 0, yPercent: 30, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: root, start: 'top 78%' },
          })
        }
      )
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative z-10 px-2 py-2 md:px-3 md:py-3">
      <div
        data-nav-theme="dark"
        className="relative flex h-[92vh] min-h-[640px] flex-col overflow-hidden rounded-[1.75rem] md:rounded-[2.5rem]"
        style={{ background: 'radial-gradient(130% 90% at 50% 108%, #1cc257 0%, #0d7a38 22%, #06381d 52%, #02120a 100%)' }}
      >
        {/* aurora blooms so the green is alive rather than a flat wash */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="pr-aurora absolute -inset-[30%]"
            style={{ background: 'radial-gradient(42% 40% at 28% 34%, rgba(125,255,79,0.4) 0%, rgba(125,255,79,0) 70%)' }} />
          <div className="pr-aurora-b absolute -inset-[30%]"
            style={{ background: 'radial-gradient(44% 42% at 74% 62%, rgba(0,255,163,0.28) 0%, rgba(0,255,163,0) 72%)' }} />
        </div>

        <div className="relative z-20 px-5 pt-10 text-center md:pt-14">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.42em] text-[var(--pr-glow)] md:text-xs"
            style={{ fontFamily: 'var(--font-brand)' }}>
            Eight reasons
          </p>
          <h2 data-pr-diff-head
            className="font-display mt-2 uppercase leading-[0.84] text-white will-change-transform"
            style={{ fontSize: 'min(11.5vw, 6.5rem)', letterSpacing: '-0.035em', textShadow: '0 8px 50px rgba(0,40,15,0.6)' }}>
            We roll different.
          </h2>
        </div>

        {/* THE RING */}
        <div className="relative z-10 flex-1" style={{ perspective: '1200px' }}>
          <div className="absolute inset-0 grid place-items-center" style={{ transformStyle: 'preserve-3d' }}>
            {/* the joint stands at the ring's centre, on translateZ(0), so cards
                orbit in front of it and behind it */}
            {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
            <img data-pr-joint src="/products/pre-rolls/joint.webp" alt="Jungle Boys 1G pre-roll"
              className="absolute h-[56vh] w-auto will-change-transform drop-shadow-[0_30px_60px_rgba(0,0,0,0.7)]"
              style={{ transform: 'translateZ(0px)' }} />

            <div data-pr-ring className="absolute h-0 w-0 will-change-transform"
              style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-7deg) rotateY(18deg)' }}>
              {CLAIMS.map((claim, i) => (
                <div key={claim.text} data-pr-card
                  className="absolute grid place-items-center will-change-transform"
                  style={{
                    width: 'clamp(150px, 21vw, 268px)',
                    left: 'calc(clamp(150px, 21vw, 268px) / -2)',
                    top: '-58px',
                    transform: `rotateY(${i * STEP}deg) translateZ(clamp(232px, 30vw, 400px))`,
                    backfaceVisibility: 'hidden',
                  }}>
                  <div className="w-full rounded-2xl border border-[var(--pr-lime)]/35 px-3 py-3.5 text-center backdrop-blur-md md:rounded-[1.3rem] md:px-4 md:py-5"
                    style={{
                      background: 'linear-gradient(160deg, rgba(11,66,33,0.95) 0%, rgba(3,22,12,0.94) 100%)',
                      boxShadow: '0 18px 44px rgba(0,0,0,0.45), inset 0 1px 0 rgba(182,255,138,0.25)',
                    }}>
                    <span aria-hidden
                      className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-[var(--pr-lime)]/40 md:h-14 md:w-14"
                      style={{ background: 'radial-gradient(circle at 35% 30%, #b6ff8a 0%, #4fd97a 45%, #12903f 100%)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- section icon */}
                      <img src={`/products/pre-rolls/icons/${claim.icon}.svg`} alt="" className="h-5 w-5 md:h-7 md:w-7"
                        style={{ filter: 'brightness(0) saturate(100%) invert(6%) sepia(30%) saturate(1400%) hue-rotate(100deg)' }} />
                    </span>
                    <span className="mt-2 block text-[12px] font-extrabold uppercase leading-tight tracking-[0.08em] text-white md:text-[14px]"
                      style={{ fontFamily: 'var(--font-brand)' }}>
                      {claim.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* floor bloom under the ring */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[42%]"
          style={{ background: 'radial-gradient(70% 100% at 50% 100%, rgba(182,255,138,0.32) 0%, rgba(28,194,87,0) 72%)' }} />
      </div>
    </section>
  )
}
