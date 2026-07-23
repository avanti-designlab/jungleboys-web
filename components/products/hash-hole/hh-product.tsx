'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Product beat — PINNED. The Hash Hole tube grows massive and spins (in-plane
// Z rotation, so the flat art never flips edge-on or mirrors) as the section
// scrubs, while a headline flanks it. Reduced-motion: upright, centered, still.

export default function HhProduct() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tube = root.querySelector('[data-hh-tube]')
      const copy = root.querySelectorAll('[data-hh-copy]')
      if (!tube) return
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.8 },
      })
      // grow from small to huge while spinning in-plane (never mirrors)
      tl.fromTo(tube, { scale: 0.55, rotate: -14, y: 40 }, { scale: 1.85, rotate: 14, y: 0, ease: 'none' }, 0)
      if (copy.length) {
        tl.fromTo(copy, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.05 }, 0.05)
          .to(copy, { opacity: 0, y: -20, duration: 0.25 }, 0.7)
      }
      return () => tl.scrollTrigger?.kill()
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative h-[240vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* flanking copy fades through */}
        <p data-hh-copy className="font-display absolute left-[4vw] top-[16vh] max-w-[26vw] text-left uppercase leading-[0.9] text-[var(--hh-green-deep)]" style={{ fontSize: 'min(6vw, 4rem)' }}>
          One <span className="hh-gold-head">Perfect</span> Hole
        </p>
        <p data-hh-copy className="absolute bottom-[14vh] right-[4vw] max-w-[30vw] text-right text-sm font-bold uppercase leading-relaxed tracking-wide text-[var(--hh-ink)]/80 md:text-base" style={{ fontFamily: 'var(--font-brand)' }}>
          2g indoor flower, a .5g rope of live hash rosin, an organic wood tip —
          all-natural paper. One clean burn, start to finish.
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
        <img
          data-hh-tube
          src="/products/hash-hole/product.webp"
          alt="Jungle Boys Hash Hole tube and infused joint"
          className="relative z-10 h-[62vh] w-auto drop-shadow-[0_30px_60px_rgba(0,0,0,0.35)] will-change-transform"
        />
      </div>
    </section>
  )
}
