'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Product beat — the Hash Hole tube + joint float up and slowly twirl (Y-axis
// spin) as the section scrolls through, with a headline calling it out.
// Scrub-tied; reduced-motion leaves it upright and still.

export default function HhProduct() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tube = root.querySelector('[data-hh-tube]')
      if (!tube) return
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top 80%', end: 'bottom top', scrub: 0.8 },
      })
      // rise + a full lazy spin across the scroll
      tl.fromTo(tube, { yPercent: 30, rotateY: -35, scale: 0.9 }, { yPercent: -10, rotateY: 340, scale: 1.05, ease: 'none' })
      return () => tl.scrollTrigger?.kill()
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative overflow-hidden px-6 py-16 md:py-24">
      <div className="mx-auto grid max-w-[1100px] items-center gap-8 md:grid-cols-2">
        <div className="media-reveal order-2 text-center md:order-1 md:text-left">
          <h2 className="font-display uppercase leading-[0.9] text-[var(--hh-green-deep)]" style={{ fontSize: 'min(12vw, 5.5rem)' }}>
            One <span className="hh-gold-head">Perfect</span> Hole
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm font-bold uppercase leading-relaxed tracking-wide text-[var(--hh-ink)]/80 md:mx-0 md:text-base" style={{ fontFamily: 'var(--font-brand)' }}>
            2g of premium indoor flower wrapped in all-natural paper, cored and
            filled with a .5g rope of live hash rosin, capped with an organic
            wood tip. One clean burn, start to finish.
          </p>
        </div>
        <div className="order-1 flex justify-center md:order-2" style={{ perspective: '1200px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
          <img
            data-hh-tube
            src="/products/hash-hole/product.webp"
            alt="Jungle Boys Hash Hole tube and infused joint"
            className="w-[min(72vw,420px)] drop-shadow-[0_30px_50px_rgba(0,0,0,0.3)] will-change-transform"
          />
        </div>
      </div>
    </section>
  )
}
