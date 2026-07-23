'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Product beat — the tube and the joint are separate units now, each drifting
// and tilting on its own path as the section scrolls through (scrub-tied but
// NOT pinned, so the page scrolls smoothly). Headline left, product right.
// Reduced-motion: both sit still, centered.

export default function HhProduct() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tube = root.querySelector('[data-tube]')
      const joint = root.querySelector('[data-joint]')
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 0.7 },
      })
      // tube: rises and un-tilts as it passes
      tl.fromTo(tube, { yPercent: 22, rotate: 10 }, { yPercent: -18, rotate: -4, ease: 'none' }, 0)
      // joint: drifts up from the left on a different path + opposite tilt
      tl.fromTo(joint, { yPercent: 42, xPercent: -12, rotate: -26 }, { yPercent: -24, xPercent: 6, rotate: 10, ease: 'none' }, 0)
      return () => tl.scrollTrigger?.kill()
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative px-6 py-16 md:py-20">
      <div className="mx-auto grid max-w-[1150px] items-center gap-8 md:grid-cols-2">
        <div className="order-2 text-center md:order-1 md:text-left">
          <h2 className="font-display uppercase leading-[0.85] text-[var(--hh-green-deep)]" style={{ fontSize: 'min(16vw, 8rem)' }}>
            Built <br className="hidden md:block" />to <span className="hh-gold-head">Hit</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-base font-bold uppercase leading-relaxed tracking-wide text-[var(--hh-ink)]/80 md:mx-0 md:text-lg" style={{ fontFamily: 'var(--font-brand)' }}>
            2g of premium indoor flower, a .5g rope of live hash rosin, an
            organic wood tip, all-natural paper. One clean burn, start to finish.
          </p>
        </div>

        <div className="relative order-1 flex h-[64vh] min-h-[440px] items-center justify-center md:order-2">
          {/* joint — left, its own motion */}
          {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
          <img
            data-joint
            src="/products/hash-hole/joint.webp"
            alt=""
            aria-hidden
            className="absolute left-[6%] z-10 h-[80%] w-auto drop-shadow-[0_20px_36px_rgba(0,0,0,0.3)] will-change-transform"
          />
          {/* tube — right, larger */}
          {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
          <img
            data-tube
            src="/products/hash-hole/tube.webp"
            alt="Jungle Boys Hash Hole tube"
            className="absolute right-[2%] z-20 h-[104%] w-auto drop-shadow-[0_30px_50px_rgba(0,0,0,0.35)] will-change-transform"
          />
        </div>
      </div>
    </section>
  )
}
