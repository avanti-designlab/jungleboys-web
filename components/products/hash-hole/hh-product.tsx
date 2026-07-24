'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// The Hole-In-One. The section pins and plays an assembly story under the
// thumb: first the sky breathes — nothing but clouds and the ball volley —
// then the joint launches from the left on a rising arc, the tube swings up
// from the right to meet it, and the joint slides INTO the tube (a clip edge
// hidden behind the mouth swallows it) with a star-burst on contact. The
// loaded tube glides to centre, pulses, and hands off to "What's Inside the
// Roll" — which unpacks exactly what just went in. Scrolling back replays it
// in reverse. Reduced-motion: the finished tube, centred, still.

// Assets are vertical (tube 220×932, joint 179×692); imgs hold a local
// rotate(90) pose and the flight DIVS carry the choreography, so trails and
// sparks travel with their piece.

const BALLS = [
  { key: 'a', size: 'h-[40px] w-[40px] md:h-[58px] md:w-[58px]', top: '10%', dir: 1, speed: 0.75, y0: '3vh', y1: '-7vh', spin: 540 },
  { key: 'b', size: 'h-[22px] w-[22px] md:h-[30px] md:w-[30px]', top: '20%', dir: -1, speed: 0.55, y0: '-2vh', y1: '3vh', spin: -720, dim: true },
  { key: 'c', size: 'h-[30px] w-[30px] md:h-[42px] md:w-[42px]', top: '86%', dir: 1, speed: 0.62, y0: '2vh', y1: '-4vh', spin: 640 },
]

// speed trails behind the joint's tail (it flies rightward, tail on the left)
function Trails() {
  const strokes = [
    { w: '78%', t: '18%', o: 0.5 },
    { w: '52%', t: '48%', o: 0.32 },
    { w: '64%', t: '78%', o: 0.18 },
  ]
  return (
    <span aria-hidden className="pointer-events-none absolute top-0 h-[12vw] w-[20vw] -translate-y-1/2" style={{ right: 'calc(50% + 26vw)' }}>
      {strokes.map((s, i) => (
        <span key={i} className="absolute right-0 h-[4px] rounded-full bg-white md:h-[6px]" style={{ width: s.w, top: s.t, opacity: s.o }} />
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
      // local poses; flight divs start at the FINISHED composition so
      // reduced-motion (which never runs the timeline) shows the loaded tube
      gsap.set('[data-timg], [data-jimg]', { xPercent: -50, yPercent: -50, rotate: 90 })
      gsap.set('[data-tflight]', { rotate: 2 })
      gsap.set('[data-jflight]', { x: '9vw', rotate: 4 }) // fully swallowed by the clip
      gsap.set('[data-burst]', { opacity: 0 })

      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root, start: 'top top', end: '+=175%',
            pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
          },
        })

        // balls fly the whole span — for the first ~quarter they ARE the scene
        BALLS.forEach((b) => {
          tl.fromTo(`[data-ball="${b.key}"]`,
            { x: () => -b.dir * (window.innerWidth || 1440) * b.speed, y: b.y0 },
            { x: () => b.dir * (window.innerWidth || 1440) * b.speed, y: b.y1, ease: 'none', duration: 1 }, 0)
            .fromTo(`[data-ball="${b.key}"] [data-ball-spin]`, { rotate: 0 }, { rotate: b.spin, ease: 'none', duration: 1 }, 0)
        })

        // tube swings up from bottom-right into the catch pose (mouth left)
        tl.fromTo('[data-tflight]', { x: '12vw', y: '62vh', rotate: 28 },
          { x: '12vw', y: 0, rotate: 4, ease: 'power2.out', duration: 0.2 }, 0.22)

        // joint launches, arcs level, then drives into the mouth
        tl.fromTo('[data-jflight]', { x: '-78vw', rotate: -28 },
          { x: '9vw', rotate: 4, ease: 'power1.inOut', duration: 0.42 }, 0.3)
          .fromTo('[data-jflight]', { y: '42vh' }, { y: 0, ease: 'sine.out', duration: 0.25 }, 0.3)

        // contact: star-burst at the mouth + the tube takes the hit
        tl.fromTo('[data-burst]', { opacity: 1, scale: 0.2 }, { scale: 1.15, ease: 'back.out(2)', duration: 0.06 }, 0.62)
          .to('[data-burst]', { opacity: 0, duration: 0.08 }, 0.68)
          .to('[data-tflight]', { rotate: 7, duration: 0.04, ease: 'power1.out' }, 0.63)
          .to('[data-tflight]', { rotate: 2, duration: 0.08, ease: 'power1.inOut' }, 0.67)

        // loaded: glide to dead centre, grow, settle
        tl.to('[data-tflight]', { x: 0, scale: 1.12, rotate: 1, ease: 'power2.inOut', duration: 0.2 }, 0.76)
        tl.to({}, { duration: 0.04 }) // beat of stillness before release
      })
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative h-screen min-h-[560px] overflow-hidden">
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

      {/* joint flight inside the swallow clip — everything past the tube
          mouth vanishes, so the joint reads as sliding in */}
      <div aria-hidden className="hh-joint-clip absolute inset-0 z-10">
        <div data-jflight className="absolute left-1/2 top-[52%] will-change-transform">
          <Trails />
          {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
          <img data-jimg src="/products/hash-hole/joint.webp" alt="" className="absolute left-0 top-0 h-[72vw] w-[18.6vw] max-w-none will-change-transform drop-shadow-[0_30px_50px_rgba(0,0,0,0.30)] md:h-[56vw] md:w-[14.5vw]" />
        </div>
      </div>

      {/* star-burst pinned to the mouth point */}
      <div data-burst aria-hidden className="absolute top-[52%] z-30" style={{ left: 'calc(50% - 23vw)' }}>
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <span key={deg} className="absolute h-[4px] w-[6vw] max-w-[70px] rounded-full bg-white"
            style={{ transform: `rotate(${deg}deg) translateX(3vw)`, transformOrigin: '0 50%' }} />
        ))}
      </div>

      {/* tube — the catch */}
      <div data-tflight className="absolute left-1/2 top-[52%] z-20 will-change-transform">
        {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
        <img data-timg src="/products/hash-hole/tube.webp" alt="Jungle Boys Hash Hole tube" className="absolute left-0 top-0 h-[88vw] w-[20.8vw] max-w-none will-change-transform drop-shadow-[0_36px_64px_rgba(0,0,0,0.38)] md:h-[70vw] md:w-[16.5vw]" />
      </div>
    </section>
  )
}
