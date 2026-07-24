'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// The Unboxing. The section pins and opens the actual product under the
// thumb: sky breathes first, the CLOSED tube swings up and levels out, the
// ribbed cap wiggles loose and pops off along the axis with a star-burst,
// and the joint slides OUT of the open end — emerging from behind the tube
// art, which masks it naturally — until the assembly settles in the iconic
// half-out beauty pose, tilted and slightly grown. Scroll back to re-cap it.
// Reduced-motion: the finished half-out pose, still.
//
// Geometry: one group div carries position + rotation (≈92° = cap end
// screen-right); children are laid out in the ART frame (vertical) via the
// --hh-L tube-length var (88vw mobile / 70vw desktop), so a child's GSAP `y`
// moves it ALONG the tube axis. Stack: joint (z-0, behind) → body (z-10,
// the mask) → cap (z-20) → burst (z-30). Art: tube-cap 220×163,
// tube-body 220×769 (split at the glass neck — its dark rim reads as the
// opening), joint 179×692.

const BALLS = [
  { key: 'a', size: 'h-[40px] w-[40px] md:h-[58px] md:w-[58px]', top: '10%', dir: 1, speed: 0.75, y0: '3vh', y1: '-7vh', spin: 540 },
  { key: 'b', size: 'h-[22px] w-[22px] md:h-[30px] md:w-[30px]', top: '20%', dir: -1, speed: 0.55, y0: '-2vh', y1: '3vh', spin: -720, dim: true },
  { key: 'c', size: 'h-[30px] w-[30px] md:h-[42px] md:w-[42px]', top: '86%', dir: 1, speed: 0.62, y0: '2vh', y1: '-4vh', spin: 640 },
]

// child geometry as fractions of the tube length L (art: tube 220×932 split
// at row 163; joint canvas 179×692 scaled to 0.8L long)
const F = {
  tubeW: 0.236, capH: 0.1749, capTop: -0.5, bodyH: 0.8251, bodyTop: -0.3251,
  jointW: 0.207, jointH: 0.8, jointTop: -0.3143, // centre at +0.0857L, fully behind the body
}
const cl = (f: number) => `calc(var(--hh-L) * ${f})`

export default function HhProduct() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add(
        {
          isMobile: '(max-width: 767px)',
          isDesktop: '(min-width: 768px)',
          reduce: '(prefers-reduced-motion: reduce)',
          noPref: '(prefers-reduced-motion: no-preference)',
        },
        (mmCtx) => {
          const c = mmCtx.conditions as Record<string, boolean>
          const L = c.isMobile ? 88 : 70 // tube length in vw — mirrors --hh-L
          const v = (f: number) => `${(f * L).toFixed(2)}vw`

          if (c.reduce) {
            // resting pose: opened, joint half-out, tilted
            gsap.set('[data-grp]', { rotate: 78, scale: 1.08 })
            gsap.set('[data-cap]', { opacity: 0 })
            gsap.set('[data-jnt]', { y: v(-0.43) })
            gsap.set('[data-burst]', { opacity: 0 })
            return
          }

          gsap.set('[data-grp]', { rotate: 92 })
          gsap.set('[data-burst]', { opacity: 0 })

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root, start: 'top top', end: '+=185%',
              pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
            },
          })

          // balls the whole span — the breathe beat's only actors until 0.18
          BALLS.forEach((b) => {
            tl.fromTo(`[data-ball="${b.key}"]`,
              { x: () => -b.dir * (window.innerWidth || 1440) * b.speed, y: b.y0 },
              { x: () => b.dir * (window.innerWidth || 1440) * b.speed, y: b.y1, ease: 'none', duration: 1 }, 0)
              .fromTo(`[data-ball="${b.key}"] [data-ball-spin]`, { rotate: 0 }, { rotate: b.spin, ease: 'none', duration: 1 }, 0)
          })

          // the closed tube swings up and levels out
          tl.fromTo('[data-grp]', { x: '-6vw', y: '70vh', rotate: 116 },
            { x: '-6vw', y: 0, rotate: 92, ease: 'power2.out', duration: 0.16 }, 0.18)

          // cap works itself loose…
          tl.to('[data-cap]', { rotate: 7, duration: 0.025, ease: 'power1.inOut' }, 0.40)
            .to('[data-cap]', { rotate: -6, duration: 0.025, ease: 'power1.inOut' }, 0.425)
            .to('[data-cap]', { rotate: 5, duration: 0.02, ease: 'power1.inOut' }, 0.45)
            .to('[data-cap]', { rotate: 0, duration: 0.02, ease: 'power1.inOut' }, 0.47)
            // …and POPS off along the axis, tumbling away
            .to('[data-cap]', { y: v(-0.30), rotate: 120, duration: 0.1, ease: 'power2.in' }, 0.50)
            .to('[data-cap]', { y: v(-0.62), x: v(0.06), rotate: 240, opacity: 0, duration: 0.12, ease: 'power1.in' }, 0.60)

          // star-burst at the opening
          tl.fromTo('[data-burst]', { opacity: 1, scale: 0.2 }, { scale: 1.2, ease: 'back.out(2)', duration: 0.05 }, 0.50)
            .to('[data-burst]', { opacity: 0, duration: 0.06 }, 0.56)

          // the joint slides out of the open end (tube recoils a touch)
          tl.to('[data-jnt]', { y: v(-0.40), duration: 0.25, ease: 'power1.inOut' }, 0.55)
            .to('[data-grp]', { x: '-7.5vw', duration: 0.04, ease: 'power1.out' }, 0.56)

          // settle into the beauty pose: centred, tilted, grown, joint half-out
          tl.to('[data-grp]', { x: 0, rotate: 78, scale: 1.08, ease: 'power2.inOut', duration: 0.16 }, 0.80)
            .to('[data-jnt]', { y: v(-0.43), duration: 0.16, ease: 'power2.inOut' }, 0.80)
          tl.to({}, { duration: 0.04 }) // stillness before release
        }
      )
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="hh-unbox relative h-screen min-h-[560px] overflow-hidden">
      {/* fairway rolls over the horizon from the intro */}
      <div aria-hidden className="absolute left-[-15%] top-0 z-0 h-[11%] w-[130%] rounded-b-[100%_100%] bg-[var(--hh-green-deep)]" />
      <div aria-hidden className="absolute left-[-10%] top-0 z-0 h-[7%] w-[120%] rounded-b-[100%_100%] bg-[var(--hh-green)]" />

      {/* the volley */}
      {BALLS.map((b) => (
        <div key={b.key} data-ball={b.key} className="absolute left-1/2 z-10 will-change-transform" style={{ top: b.top, opacity: b.dim ? 0.82 : 1 }}>
          <div data-ball-spin className={`relative rounded-full bg-white shadow-[inset_-5px_-5px_9px_rgba(0,0,0,0.18),0_8px_16px_rgba(0,0,0,0.2)] ${b.size}`}>
            <span aria-hidden className="absolute left-[30%] top-[36%] h-[9%] w-[9%] rounded-full bg-black/12" />
            <span aria-hidden className="absolute left-[54%] top-[26%] h-[9%] w-[9%] rounded-full bg-black/12" />
            <span aria-hidden className="absolute left-[46%] top-[54%] h-[9%] w-[9%] rounded-full bg-black/12" />
          </div>
        </div>
      ))}

      {/* the product group — children live in the art frame; GSAP y = along the axis */}
      <div data-grp className="absolute left-1/2 top-[52%] z-20 will-change-transform">
        {/* joint — hidden behind the body until it emerges */}
        {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
        <img data-jnt src="/products/hash-hole/joint.webp" alt="" aria-hidden
          className="absolute z-0 max-w-none will-change-transform"
          style={{ width: cl(F.jointW), height: cl(F.jointH), left: cl(-F.jointW / 2), top: cl(F.jointTop) }} />
        {/* body — the mask; its glass neck is the opening */}
        {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
        <img src="/products/hash-hole/tube-body.webp" alt="Jungle Boys Hash Hole tube"
          className="absolute z-10 max-w-none drop-shadow-[0_30px_54px_rgba(0,0,0,0.34)]"
          style={{ width: cl(F.tubeW), height: cl(F.bodyH), left: cl(-F.tubeW / 2), top: cl(F.bodyTop) }} />
        {/* cap — pops off */}
        {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
        <img data-cap src="/products/hash-hole/tube-cap.webp" alt="" aria-hidden
          className="absolute z-20 max-w-none will-change-transform drop-shadow-[0_18px_32px_rgba(0,0,0,0.3)]"
          style={{ width: cl(F.tubeW), height: cl(F.capH), left: cl(-F.tubeW / 2), top: cl(F.capTop) }} />
        {/* star-burst at the opening */}
        <div data-burst aria-hidden className="absolute z-30" style={{ left: 0, top: cl(-0.36) }}>
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <span key={deg} className="absolute h-[4px] w-[6vw] max-w-[70px] rounded-full bg-white"
              style={{ transform: `rotate(${deg}deg) translateX(3vw)`, transformOrigin: '0 50%' }} />
          ))}
        </div>
      </div>
    </section>
  )
}
