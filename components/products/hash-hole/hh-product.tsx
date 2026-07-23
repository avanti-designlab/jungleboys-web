'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// The crossing. Nothing but product: a massive horizontal tube sweeps in from
// the right and travels all the way off the left edge, while the joint runs the
// opposite way underneath it. Both are scrubbed to the section's own pass
// through the viewport — continuously scroll-driven with no pin, so the page
// never stops moving. Reduced-motion: both sit still, centred.

// Assets are vertical (tube 220×932, joint 179×692 — alpha-split from the raw
// Figma fill, complete tip to filter) — rotating 90° makes the pre-rotation
// HEIGHT the on-screen width, hence the vw heights below.
const TUBE_LEN = 96 // vw of horizontal reach
const JOINT_LEN = 96

export default function HhProduct() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      // GSAP writes transform wholesale, so centring + rotation live here rather
      // than in Tailwind classes it would overwrite. Runs unconditionally so the
      // reduced-motion path still lands centred.
      gsap.set(['[data-tube]', '[data-joint]'], { xPercent: -50, yPercent: -50, rotate: 90 })

      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // never read a 0 width — a stale reach() bakes in a zero-length tween
        const reach = () => (window.innerWidth || document.documentElement.clientWidth || 1440) * 1.15

        // ONE timeline / ONE trigger. Two tweens sharing a single scrollTrigger
        // config object silently clobber each other — ScrollTrigger mutates it.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5,
            invalidateOnRefresh: true, // re-evaluate reach() on every resize
          },
        })
        tl.fromTo('[data-tube]', { x: reach }, { x: () => -reach(), ease: 'none' }, 0)
          .fromTo('[data-joint]', { x: () => -reach() }, { x: reach, ease: 'none' }, 0)

        // the art is heavy; its late layout shift leaves trigger positions stale
        const refresh = () => ScrollTrigger.refresh()
        window.addEventListener('load', refresh)
        return () => window.removeEventListener('load', refresh)
      })
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative h-[64vh] min-h-[440px] overflow-hidden">
      {/* joint — runs left → right, sitting under the tube */}
      {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
      <img
        data-joint
        src="/products/hash-hole/joint.webp"
        alt=""
        aria-hidden
        className="absolute left-1/2 top-[63%] z-10 w-auto will-change-transform drop-shadow-[0_30px_50px_rgba(0,0,0,0.30)]"
        style={{ height: `${JOINT_LEN}vw` }}
      />
      {/* tube — runs right → left, on top */}
      {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
      <img
        data-tube
        src="/products/hash-hole/tube.webp"
        alt="Jungle Boys Hash Hole tube"
        className="absolute left-1/2 top-[36%] z-20 w-auto will-change-transform drop-shadow-[0_36px_64px_rgba(0,0,0,0.38)]"
        style={{ height: `${TUBE_LEN}vw` }}
      />
    </section>
  )
}
