'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// The flyover. The intro's fairway rolls over the horizon at the top of this
// section, and the products fly across the open sky beneath it: the massive
// tube sweeps right-to-left on a shallow rising arc while the joint crosses
// underneath the other way, each dragging cartoon speed trails; a golf ball
// counter-arcs high above with spin. Everything is scrubbed to the section's
// pass — no pin, the page never stops. Reduced-motion: pieces centred, still.

// Assets are vertical (tube 220×932, joint 179×692) — rotating 90° makes the
// pre-rotation HEIGHT the on-screen width.
const TUBE_LEN = 96
const JOINT_LEN = 96

// cartoon speed trails: staggered dashes hanging off the piece's tail edge
// (the fly wrapper is a zero-height track line — the block sizes itself and
// re-centres on that line). dir = direction of FLIGHT; trails sit opposite.
function Trails({ dir }: { dir: 'left' | 'right' }) {
  const strokes = [
    { w: '78%', t: '18%', o: 0.5 },
    { w: '52%', t: '48%', o: 0.32 },
    { w: '64%', t: '78%', o: 0.18 },
  ]
  const tail = dir === 'left' ? 'left' : 'right' // flying left → tail extends right
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute top-0 h-[14vw] w-[24vw] -translate-y-1/2"
      style={{ [tail]: 'calc(50% + 40vw)' }}
    >
      {strokes.map((s, i) => (
        <span
          key={i}
          className="absolute h-[4px] rounded-full bg-white md:h-[6px]"
          style={{ width: s.w, top: s.t, opacity: s.o, [tail]: 0 }}
        />
      ))}
    </span>
  )
}

export default function HhProduct() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      // GSAP owns the img transforms wholesale: centring + rotation live here
      gsap.set(['[data-tube]', '[data-joint]'], { xPercent: -50, yPercent: -50, rotate: 90 })

      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const reach = () => (window.innerWidth || document.documentElement.clientWidth || 1440) * 1.15
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        })
        // wrappers travel horizontally; imgs arc + tumble inside them so the
        // paths read thrown, not conveyor-belted
        tl.fromTo('[data-fly="tube"]', { x: reach }, { x: () => -reach(), ease: 'none' }, 0)
          .fromTo('[data-fly="joint"]', { x: () => -reach() }, { x: reach, ease: 'none' }, 0)
          .fromTo('[data-tube]', { y: '4vh' }, { y: '-5vh', ease: 'sine.inOut' }, 0)
          .fromTo('[data-joint]', { y: '-3vh' }, { y: '4vh', ease: 'sine.inOut' }, 0)
          .fromTo('[data-tube]', { rotate: 93 }, { rotate: 85, ease: 'none' }, 0)
          .fromTo('[data-joint]', { rotate: 87 }, { rotate: 95, ease: 'none' }, 0)
          // the wink: a golf ball counter-arcs high across with spin
          .fromTo('[data-ball]', { x: () => -reach() * 0.7, y: '2vh' }, { x: () => reach() * 0.7, y: '-6vh', ease: 'none' }, 0)
          .fromTo('[data-ball-spin]', { rotate: 0 }, { rotate: 720, ease: 'none' }, 0)

        const refresh = () => ScrollTrigger.refresh()
        window.addEventListener('load', refresh)
        return () => window.removeEventListener('load', refresh)
      })
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative h-[78vh] min-h-[520px] overflow-hidden">
      {/* the intro's fairway rolls over the horizon — no straight cut */}
      <div aria-hidden className="absolute left-[-15%] top-0 z-0 h-[11%] w-[130%] rounded-b-[100%_100%] bg-[var(--hh-green-deep)]" />
      <div aria-hidden className="absolute left-[-10%] top-0 z-0 h-[7%] w-[120%] rounded-b-[100%_100%] bg-[var(--hh-green)]" />

      {/* golf ball, high path */}
      <div data-ball className="absolute left-1/2 top-[15%] z-10 will-change-transform">
        <div data-ball-spin className="relative h-[46px] w-[46px] rounded-full bg-white shadow-[inset_-6px_-6px_10px_rgba(0,0,0,0.18),0_10px_20px_rgba(0,0,0,0.22)] md:h-[60px] md:w-[60px]">
          <span aria-hidden className="absolute left-[30%] top-[36%] h-[8%] w-[8%] rounded-full bg-black/12" />
          <span aria-hidden className="absolute left-[54%] top-[26%] h-[8%] w-[8%] rounded-full bg-black/12" />
          <span aria-hidden className="absolute left-[46%] top-[54%] h-[8%] w-[8%] rounded-full bg-black/12" />
        </div>
      </div>

      {/* joint — flies left → right beneath the tube */}
      <div data-fly="joint" className="absolute inset-x-0 top-[72%] z-10 will-change-transform">
        <Trails dir="right" />
        {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
        <img
          data-joint
          src="/products/hash-hole/joint.webp"
          alt=""
          aria-hidden
          className="absolute left-1/2 w-auto will-change-transform drop-shadow-[0_30px_50px_rgba(0,0,0,0.30)]"
          style={{ height: `${JOINT_LEN}vw` }}
        />
      </div>

      {/* tube — flies right → left, on top */}
      <div data-fly="tube" className="absolute inset-x-0 top-[46%] z-20 will-change-transform">
        <Trails dir="left" />
        {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
        <img
          data-tube
          src="/products/hash-hole/tube.webp"
          alt="Jungle Boys Hash Hole tube"
          className="absolute left-1/2 w-auto will-change-transform drop-shadow-[0_36px_64px_rgba(0,0,0,0.38)]"
          style={{ height: `${TUBE_LEN}vw` }}
        />
      </div>
    </section>
  )
}
