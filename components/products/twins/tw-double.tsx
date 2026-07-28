'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// TWO. ALWAYS. — the section that has to make "double" felt rather than stated.
//
// Two joints start perfectly overlapped, reading as one. Scroll scissors them
// apart into a wide X in real 3D: they counter-rotate, and they separate in Z as
// well as in the plane, so one passes clearly in FRONT of the other. Depth is
// what stops it looking like two flat images sliding — the joints are siblings
// in a single preserve-3d stage, so the browser sorts them against each other.
//
// The arithmetic counts up alongside it. 0.75 + 0.75 = 1.5 is the entire pitch
// of this product, so it gets to be the headline rather than a footnote.

export default function TwDouble() {
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
              trigger: root, start: 'top top', end: '+=230%',
              pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true,
            },
          })

          // the scissor. z separates them so one is unambiguously in front.
          tl.fromTo('[data-tw-j="a"]',
            { rotate: 0, xPercent: 0, z: 0 },
            { rotate: -26, xPercent: -58, z: 180, ease: 'power2.out', duration: 0.55 }, 0)
            .fromTo('[data-tw-j="b"]',
              { rotate: 0, xPercent: 0, z: 0 },
              { rotate: 26, xPercent: 58, z: -180, ease: 'power2.out', duration: 0.55 }, 0)

          // the stage tips as they part, so the split is read in perspective
          tl.fromTo('[data-tw-stage]', { rotateX: 0, rotateY: 0 }, { rotateX: -10, rotateY: 8, ease: 'none', duration: 1 }, 0)

          // "ONE" hands over to "TWO" exactly as they separate
          tl.fromTo('[data-tw-one]', { opacity: 1, scale: 1 }, { opacity: 0, scale: 0.8, ease: 'power2.in', duration: 0.22 }, 0.06)
            .fromTo('[data-tw-two]', { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, ease: 'back.out(2)', duration: 0.3 }, 0.3)

          // the maths lands after the split has read
          tl.fromTo('[data-tw-sum] > *',
            { opacity: 0, yPercent: 40 },
            { opacity: 1, yPercent: 0, stagger: 0.06, ease: 'power3.out', duration: 0.3 }, 0.62)

          const grams = { v: 0 }
          tl.to(grams, {
            v: 1.5, ease: 'none', duration: 0.32,
            onUpdate: () => {
              const el = root.querySelector('[data-tw-total]')
              if (el) el.textContent = grams.v.toFixed(2).replace(/0$/, '') + 'g'
            },
          }, 0.66)
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
        className="relative flex h-[94vh] min-h-[640px] flex-col overflow-hidden rounded-[1.75rem] md:rounded-[2.5rem]"
        style={{ background: 'radial-gradient(125% 92% at 50% 106%, #1b3fb0 0%, #10225e 26%, #070d24 58%, #04050c 100%)' }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="tw-bloom absolute -inset-[30%]"
            style={{ background: 'radial-gradient(40% 38% at 26% 30%, rgba(230,36,44,0.42) 0%, rgba(230,36,44,0) 70%)' }} />
          <div className="tw-bloom-b absolute -inset-[30%]"
            style={{ background: 'radial-gradient(42% 40% at 74% 64%, rgba(47,92,224,0.4) 0%, rgba(47,92,224,0) 72%)' }} />
        </div>

        {/* the count swaps in place, so ONE literally becomes TWO */}
        <div className="pointer-events-none relative z-20 grid place-items-center px-5 pt-10 md:pt-14">
          <div className="relative grid place-items-center">
            <span data-tw-one className="font-display absolute leading-none text-white/80 will-change-transform"
              style={{ fontSize: 'min(21vw, 12.5rem)', letterSpacing: '-0.05em' }}>1</span>
            <span data-tw-two className="font-display leading-none opacity-0 will-change-transform"
              style={{
                fontSize: 'min(21vw, 12.5rem)', letterSpacing: '-0.05em',
                background: 'linear-gradient(180deg, #ff6b70 0%, #e6242c 40%, #8a0d13 100%)',
                WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                filter: 'drop-shadow(0 10px 30px rgba(230,36,44,0.45))',
              }}>2</span>
          </div>
          <h2 className="font-display mt-1 uppercase leading-[0.84] text-white"
            style={{ fontSize: 'min(11vw, 6rem)', letterSpacing: '-0.035em' }}>
            In every tube.
          </h2>
        </div>

        {/* THE SCISSOR — real depth, one joint passes in front of the other */}
        <div className="relative z-10 flex-1" style={{ perspective: '1300px' }}>
          <div data-tw-stage className="absolute inset-0 grid place-items-center will-change-transform"
            style={{ transformStyle: 'preserve-3d' }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
            <img data-tw-j="a" src="/products/twins/joint.webp" alt="Jungle Boys 0.75g pre-roll"
              className="absolute h-[44vh] w-auto will-change-transform drop-shadow-[0_26px_50px_rgba(0,0,0,0.75)]" />
            {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
            <img data-tw-j="b" src="/products/twins/joint.webp" alt="" aria-hidden
              className="absolute h-[44vh] w-auto will-change-transform drop-shadow-[0_26px_50px_rgba(0,0,0,0.75)]" />
          </div>
        </div>

        {/* the arithmetic that is the whole product */}
        <div data-tw-sum className="relative z-20 flex items-end justify-center gap-3 px-5 pb-10 md:gap-6 md:pb-14">
          {[
            { v: '0.75g', l: 'Roll one' },
            { v: '+', l: '' },
            { v: '0.75g', l: 'Roll two' },
            { v: '=', l: '' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center will-change-transform">
              <span className="font-display leading-none text-white" style={{ fontSize: s.l ? 'min(7vw, 3rem)' : 'min(5vw, 2.2rem)' }}>{s.v}</span>
              {s.l && (
                <span className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.24em] text-white/55 md:text-[11px]"
                  style={{ fontFamily: 'var(--font-brand)' }}>{s.l}</span>
              )}
            </div>
          ))}
          <div className="flex flex-col items-center will-change-transform">
            <span data-tw-total className="font-display leading-none text-[var(--tw-red-hot)]"
              style={{ fontSize: 'min(9vw, 4rem)', filter: 'drop-shadow(0 6px 22px rgba(230,36,44,0.5))' }}>0g</span>
            <span className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.24em] text-[var(--tw-red-hot)] md:text-[11px]"
              style={{ fontFamily: 'var(--font-brand)' }}>Total</span>
          </div>
        </div>
      </div>
    </section>
  )
}
