'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Built to Hit — a cinematic sweep. The stage holds still while a MASSIVE tube
// flies in from the right and an equally massive joint comes from the left
// underneath it; they cross into the centre, hang for a beat, then blow past
// the camera and fade. Headline is centred above, the spec line sits at the
// bottom. Scrub-tied to one sticky stage. Reduced-motion: both centred, still.

export default function HhProduct() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tube = root.querySelector('[data-tube]')
      const joint = root.querySelector('[data-joint]')
      const head = root.querySelector('[data-head]')
      const copy = root.querySelector('[data-copy]')

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.75 },
      })
      // ── travel in and meet ──
      tl.fromTo(tube, { xPercent: 130, yPercent: -6, rotate: 26, opacity: 0 },
                      { xPercent: 8, yPercent: -6, rotate: 8, opacity: 1, ease: 'power2.out', duration: 0.46 }, 0)
        .fromTo(joint, { xPercent: -145, yPercent: 12, rotate: -34, opacity: 0 },
                       { xPercent: -10, yPercent: 12, rotate: -12, opacity: 1, ease: 'power2.out', duration: 0.46 }, 0)
      // ── hang together in the centre ──
        .to(tube, { xPercent: 2, rotate: 4, ease: 'none', duration: 0.16 }, 0.46)
        .to(joint, { xPercent: -4, rotate: -8, ease: 'none', duration: 0.16 }, 0.46)
      // ── blow past the camera and fade ──
        .to(tube, { scale: 2.1, opacity: 0, rotate: -6, ease: 'power2.in', duration: 0.3 }, 0.66)
        .to(joint, { scale: 1.9, opacity: 0, rotate: 8, ease: 'power2.in', duration: 0.3 }, 0.68)
      // headline + copy breathe with it
        .fromTo(head, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.2 }, 0.02)
        .to(head, { opacity: 0, y: -30, duration: 0.2 }, 0.74)
        .fromTo(copy, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.2 }, 0.3)
        .to(copy, { opacity: 0, duration: 0.18 }, 0.76)
      return () => tl.scrollTrigger?.kill()
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative h-[240vh]">
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        {/* headline — centred */}
        <h2
          data-head
          className="font-display pointer-events-none absolute top-[12vh] z-30 w-full text-center uppercase leading-[0.82] text-[var(--hh-green-deep)]"
          style={{ fontSize: 'min(15vw, 9rem)' }}
        >
          Built to <span className="hh-gold-head">Hit</span>
        </h2>

        {/* joint — from the left, underneath */}
        {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
        <img
          data-joint
          src="/products/hash-hole/joint.webp"
          alt=""
          aria-hidden
          className="absolute z-10 h-[68vh] w-auto drop-shadow-[0_30px_60px_rgba(0,0,0,0.35)] will-change-transform"
        />
        {/* tube — from the right, on top */}
        {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
        <img
          data-tube
          src="/products/hash-hole/tube.webp"
          alt="Jungle Boys Hash Hole tube"
          className="absolute z-20 h-[86vh] w-auto drop-shadow-[0_40px_80px_rgba(0,0,0,0.4)] will-change-transform"
        />

        {/* spec line — bottom */}
        <p
          data-copy
          className="pointer-events-none absolute bottom-[9vh] z-30 mx-auto w-full max-w-3xl px-6 text-center text-base font-bold uppercase leading-relaxed tracking-wide text-[var(--hh-ink)]/85 md:text-xl"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          2g premium indoor flower · .5g live hash rosin · organic wood tip ·
          all-natural paper
        </p>
      </div>
    </section>
  )
}
