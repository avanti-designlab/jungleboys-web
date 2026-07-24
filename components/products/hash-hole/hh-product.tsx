'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// The Unboxing. The section pins and opens the product under the thumb: sky
// breathes, the closed tube swings up left-of-centre, the ribbed cap wiggles
// loose and pops off along the axis with a star-burst, the joint slides ALL
// the way out of the open end, the empty tube tips away and fades out of
// frame — and the joint alone glides to centre and zooms up as the hero.
// Scroll back to re-pack it. Reduced-motion: the finished hero joint, still.
//
// GEOMETRY. One [data-grp] carries screen position + rotation; its children
// are laid out in the ART frame (vertical tube) sized off --hh-L, so a child's
// GSAP `y` travels ALONG the tube axis. For a group rotated θ, an art offset
// (0,v) lands on screen at (−v·sinθ, v·cosθ) — that identity is what centres
// the joint at the end (see FINAL). Stack: joint (z0, behind) → body (z10,
// the mask — no clip-path needed) → cap (z20) → burst (z30).
// Art: tube-cap 284×176, tube-body 284×1032, joint 230×897 — all cut in ONE
// compression pass from the 581×1456 master fill (the older 448×1123 cut,
// re-compressed twice, is what read as pixelated).

const BALLS = [
  { key: 'a', size: 'h-[40px] w-[40px] md:h-[54px] md:w-[54px]', top: '10%', dir: 1, speed: 0.75, y0: '3vh', y1: '-7vh', spin: 540 },
  { key: 'b', size: 'h-[22px] w-[22px] md:h-[30px] md:w-[30px]', top: '20%', dir: -1, speed: 0.55, y0: '-2vh', y1: '3vh', spin: -720, dim: true },
  { key: 'c', size: 'h-[30px] w-[30px] md:h-[40px] md:w-[40px]', top: '86%', dir: 1, speed: 0.62, y0: '2vh', y1: '-4vh', spin: 640 },
]

// child geometry as fractions of tube length L (measured off the new masters)
const F = {
  tubeW: 0.2351,
  capH: 0.1457, capTop: -0.5,
  bodyH: 0.8543, bodyTop: -0.3543, // body top edge = the open mouth
  jointW: 0.1904, jointH: 0.7425, jointTop: -0.25, // starts fully inside the body
  slide: -0.90, // travel that clears the joint completely of the mouth
  // the tube rises from the lower left and points up-right; art-up maps to
  // screen direction (sin θ, −cos θ), so 58° = pointing up at ~32° above level
  entryRot: 74, restRot: 58, finalRot: 68,
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
          const L = c.isMobile ? 68 : 52 // tube length in vw — mirrors --hh-L
          const restX = c.isMobile ? -12 : -18 // sits left of centre
          const restY = c.isMobile ? 6 : 5 // …and low, so it reads as rising from the corner
          const zoom = c.isMobile ? 1.3 : 1.45
          const v = (f: number) => `${(f * L).toFixed(2)}vw`

          // FINAL: centre the joint for the hero beat. Its centre sits at art-y
          // C after the slide; at rotation θ that lands at screen
          // (−C·sinθ, C·cosθ), so the group moves by the negation of that.
          const C = F.jointTop + F.jointH / 2 + F.slide
          const th = (F.finalRot * Math.PI) / 180
          const endX = `${(C * Math.sin(th) * L).toFixed(2)}vw`
          const endY = `${(-C * Math.cos(th) * L).toFixed(2)}vw`

          if (c.reduce) {
            gsap.set('[data-grp]', { x: endX, y: endY, rotate: F.finalRot })
            gsap.set('[data-cap]', { opacity: 0 })
            gsap.set('[data-body]', { opacity: 0 })
            gsap.set('[data-jslide]', { y: v(F.slide) })
            gsap.set('[data-jzoom]', { scale: zoom })
            gsap.set('[data-burst]', { opacity: 0 })
            return
          }

          gsap.set('[data-grp]', { rotate: F.restRot })
          gsap.set('[data-burst]', { opacity: 0 })

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root, start: 'top top', end: '+=145%',
              pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
            },
          })

          // balls run the whole span — the breathe beat's only actors until 0.18
          BALLS.forEach((b) => {
            tl.fromTo(`[data-ball="${b.key}"]`,
              { x: () => -b.dir * (window.innerWidth || 1440) * b.speed, y: b.y0 },
              { x: () => b.dir * (window.innerWidth || 1440) * b.speed, y: b.y1, ease: 'none', duration: 1 }, 0)
              .fromTo(`[data-ball="${b.key}"] [data-ball-spin]`, { rotate: 0 }, { rotate: b.spin, ease: 'none', duration: 1 }, 0)
          })

          // the closed tube rises out of the bottom-left corner, angled up
          tl.fromTo('[data-grp]',
            { x: `${restX - 14}vw`, y: '58vw', rotate: F.entryRot },
            { x: `${restX}vw`, y: `${restY}vw`, rotate: F.restRot, ease: 'power2.out', duration: 0.18 }, 0.16)

          // cap works itself loose…
          tl.to('[data-cap]', { rotate: 7, duration: 0.022, ease: 'power1.inOut' }, 0.38)
            .to('[data-cap]', { rotate: -6, duration: 0.022, ease: 'power1.inOut' }, 0.402)
            .to('[data-cap]', { rotate: 5, duration: 0.02, ease: 'power1.inOut' }, 0.424)
            .to('[data-cap]', { rotate: 0, duration: 0.02, ease: 'power1.inOut' }, 0.444)
            // …and pops off along the axis, tumbling clear
            .to('[data-cap]', { y: v(-0.34), rotate: 130, duration: 0.09, ease: 'power2.in' }, 0.47)
            .to('[data-cap]', { y: v(-0.72), x: v(0.10), rotate: 260, opacity: 0, duration: 0.11, ease: 'power1.in' }, 0.56)

          // star-burst at the opening
          tl.fromTo('[data-burst]', { opacity: 1, scale: 0.2 }, { scale: 1.2, ease: 'back.out(2)', duration: 0.045 }, 0.47)
            .to('[data-burst]', { opacity: 0, duration: 0.055 }, 0.525)

          // the joint slides ALL the way out; the group drifts left in the same
          // window so the emerging tip never reaches the right edge
          tl.to('[data-jslide]', { y: v(F.slide), duration: 0.24, ease: 'power1.inOut' }, 0.53)
            .to('[data-grp]', { x: endX, y: endY, duration: 0.26, ease: 'power1.inOut' }, 0.53)

          // the empty tube tips away and fades out of frame
          tl.to('[data-body]', { x: v(0.85), rotate: 34, opacity: 0, duration: 0.16, ease: 'power2.in' }, 0.74)

          // the joint alone: settle level and zoom up as the hero
          tl.to('[data-grp]', { rotate: F.finalRot, duration: 0.16, ease: 'power2.inOut' }, 0.80)
            .to('[data-jzoom]', { scale: zoom, duration: 0.18, ease: 'power2.out' }, 0.80)
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

      {/* the product group — children live in the art frame; child y = along the axis */}
      <div data-grp className="absolute left-1/2 top-[52%] z-20 will-change-transform">
        {/* joint: slide wrapper travels the axis, inner img zooms about its own centre */}
        <div data-jslide className="absolute z-0 will-change-transform"
          style={{ width: cl(F.jointW), height: cl(F.jointH), left: cl(-F.jointW / 2), top: cl(F.jointTop) }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
          <img data-jzoom src="/products/hash-hole/joint.webp" alt="Jungle Boys Hash Hole infused pre-roll"
            className="h-full w-full origin-center will-change-transform drop-shadow-[0_26px_44px_rgba(0,0,0,0.30)]" />
        </div>
        {/* body — the mask; its glass neck is the opening */}
        {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
        <img data-body src="/products/hash-hole/tube-body.webp" alt="" aria-hidden
          className="absolute z-10 max-w-none will-change-transform drop-shadow-[0_28px_50px_rgba(0,0,0,0.32)]"
          style={{ width: cl(F.tubeW), height: cl(F.bodyH), left: cl(-F.tubeW / 2), top: cl(F.bodyTop) }} />
        {/* cap — pops off */}
        {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
        <img data-cap src="/products/hash-hole/tube-cap.webp" alt="" aria-hidden
          className="absolute z-20 max-w-none will-change-transform drop-shadow-[0_16px_28px_rgba(0,0,0,0.28)]"
          style={{ width: cl(F.tubeW), height: cl(F.capH), left: cl(-F.tubeW / 2), top: cl(F.capTop) }} />
        {/* star-burst at the opening */}
        <div data-burst aria-hidden className="absolute z-30" style={{ left: 0, top: cl(F.bodyTop) }}>
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <span key={deg} className="absolute h-[4px] w-[5vw] max-w-[58px] rounded-full bg-white"
              style={{ transform: `rotate(${deg}deg) translateX(2.4vw)`, transformOrigin: '0 50%' }} />
          ))}
        </div>
      </div>
    </section>
  )
}
