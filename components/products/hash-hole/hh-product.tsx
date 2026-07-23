'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Built to Hit — ONE compact screen, no pinning. The tube sweeps in from the
// right and the joint from the left underneath; they settle together in the
// centre and stay. Headline above, spec line below. Everything is on screen at
// once — no scrubbed dead space. Reduced-motion: settled, still.

export default function HhProduct() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 75%', once: true } })
      tl.from('[data-head]', { opacity: 0, y: 40, duration: 0.5, ease: 'power3.out' }, 0)
        .from('[data-tube]', { opacity: 0, xPercent: 90, rotate: 20, duration: 0.85, ease: 'power3.out' }, 0.05)
        .from('[data-joint]', { opacity: 0, xPercent: -110, rotate: -26, duration: 0.85, ease: 'power3.out' }, 0.12)
        .from('[data-copy]', { opacity: 0, y: 26, duration: 0.5, ease: 'power2.out' }, 0.5)
      return () => tl.scrollTrigger?.kill()
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative overflow-hidden px-6 py-16 md:py-20">
      <h2
        data-head
        className="font-display text-center uppercase leading-[0.85] text-[var(--hh-green-deep)]"
        style={{ fontSize: 'min(13vw, 7rem)' }}
      >
        Built to <span className="hh-gold-head">Hit</span>
      </h2>

      {/* tube + joint, big, meeting in the middle */}
      <div className="relative mx-auto mt-8 flex h-[52vh] min-h-[340px] max-w-[900px] items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
        <img
          data-joint
          src="/products/hash-hole/joint.webp"
          alt=""
          aria-hidden
          className="absolute left-1/2 z-10 h-[78%] w-auto -translate-x-[92%] -rotate-[9deg] drop-shadow-[0_24px_44px_rgba(0,0,0,0.32)]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
        <img
          data-tube
          src="/products/hash-hole/tube.webp"
          alt="Jungle Boys Hash Hole tube"
          className="absolute left-1/2 z-20 h-full w-auto -translate-x-[8%] rotate-[5deg] drop-shadow-[0_30px_60px_rgba(0,0,0,0.38)]"
        />
      </div>

      <p
        data-copy
        className="mx-auto mt-8 max-w-3xl text-center text-base font-bold uppercase leading-relaxed tracking-wide text-[var(--hh-ink)]/85 md:text-xl"
        style={{ fontFamily: 'var(--font-brand)' }}
      >
        2g premium indoor flower · .5g live hash rosin · organic wood tip ·
        all-natural paper
      </p>
    </section>
  )
}
