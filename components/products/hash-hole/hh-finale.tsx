'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Finale — PINNED full-screen. The golf-course scene (Hash Hole mascot on the
// cart, JB carved in the sand) fills the viewport and pans top-to-bottom as you
// scrub a short, controlled distance — so the whole scene reveals without
// endless scrolling. A headline drops in over the green. Reduced-motion: the
// scene sits centered, static.

export default function HhFinale() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const scene = root.querySelector('[data-hh-scene]')
      const head = root.querySelector('[data-hh-head]')
      if (!scene) return
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.9 },
      })
      // pan the tall scene from its top (trees/cart) down to the JB sand logo
      tl.fromTo(scene, { objectPosition: '50% 0%' }, { objectPosition: '50% 100%', ease: 'none' }, 0)
      if (head) tl.fromTo(head, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.25 }, 0).to(head, { opacity: 0, duration: 0.2 }, 0.4)
      return () => tl.scrollTrigger?.kill()
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative h-[220vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- finale scene */}
        <img
          data-hh-scene
          src="/products/hash-hole/golf-scene.webp"
          alt="Jungle Boys — Hash Hole on the course"
          className="absolute inset-0 h-full w-full select-none object-cover"
          style={{ objectPosition: '50% 0%' }}
        />
        <div data-hh-head className="absolute inset-x-0 top-[12vh] z-10 text-center">
          <p className="text-sm font-extrabold uppercase tracking-[0.4em] text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.5)]" style={{ fontFamily: 'var(--font-brand)' }}>
            Playing with fire since 2006
          </p>
          <h2 className="hh-gold-head font-display mt-2 uppercase leading-[0.85]" style={{ fontSize: 'min(14vw, 8rem)' }}>
            See You on the Course
          </h2>
        </div>
      </div>
    </section>
  )
}
