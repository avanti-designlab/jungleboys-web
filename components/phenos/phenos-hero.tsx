'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

// Pheno hero: the "PHENO HUNT WITH US!" logo is the hero imagery. Four jars
// float and bob behind it (lower band, not up top), and six nugs pop out from
// behind the logo — like the rewards coin burst — then settle into a scatter
// and gently drift. Reduced-motion: jars/nugs sit still at rest (CSS).

// jars — behind the logo, spread across a lower band. big center jar = jar-3.
const JARS = [
  { src: '/phenos/jar-2.png', left: '25%', top: '30%', w: 118, tilt: -5, dur: 6.5, del: 0.2, z: 4 },
  { src: '/phenos/jar-3.png', left: '50%', top: '24%', w: 168, tilt: 0, dur: 7.2, del: 0, z: 5 },
  { src: '/phenos/jar-1.png', left: '15%', top: '46%', w: 92, tilt: -8, dur: 5.6, del: 0.6, z: 3 },
  { src: '/phenos/jar-4.png', left: '84%', top: '40%', w: 100, tilt: 7, dur: 6.1, del: 0.4, z: 4 },
]

// nugs — they burst out from behind the logo (centre) and fade, on a loop, like
// the rewards coins. The left/top here are only the reduced-motion resting spots.
const NUGS = [
  { src: '/phenos/nug-1.png', left: '15%', top: '22%', w: 90 },
  { src: '/phenos/nug-4.png', left: '85%', top: '20%', w: 94 },
  { src: '/phenos/nug-2.png', left: '10%', top: '54%', w: 76 },
  { src: '/phenos/nug-5.png', left: '90%', top: '52%', w: 74 },
  { src: '/phenos/nug-3.png', left: '20%', top: '80%', w: 82 },
  { src: '/phenos/nug-6.png', left: '80%', top: '78%', w: 86 },
  { src: '/phenos/nug-2.png', left: '50%', top: '14%', w: 70 },
  { src: '/phenos/nug-4.png', left: '50%', top: '88%', w: 80 },
]

export default function PhenosHero() {
  const nugsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const box = nugsRef.current
    if (!box) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const els = Array.from(box.querySelectorAll<HTMLElement>('[data-nug]'))
      const R = gsap.utils.random
      // one wave: every nug launches from the logo centre and arcs outward + fades
      const burst = () => {
        const c = box.getBoundingClientRect()
        const cx = c.left + c.width / 2
        const cy = c.top + c.height / 2
        els.forEach((el, i) => {
          gsap.killTweensOf(el)
          // reset to its CSS home, measure, derive the vector back to centre
          gsap.set(el, { x: 0, y: 0, xPercent: -50, yPercent: -50, rotation: 0, scale: 1 })
          const r = el.getBoundingClientRect()
          const toCX = cx - (r.left + r.width / 2)
          const toCY = cy - (r.top + r.height / 2)
          const ang = R(0, Math.PI * 2)
          const dist = R(300, 680)
          const outX = toCX + Math.cos(ang) * dist
          const outY = toCY + Math.sin(ang) * dist * 0.82
          gsap.set(el, { x: toCX, y: toCY, xPercent: -50, yPercent: -50, scale: R(0.25, 0.5), opacity: 0, rotation: R(-40, 40) })
          gsap
            .timeline({ delay: i * 0.12 })
            .to(el, { opacity: 1, duration: 0.22 })
            .to(el, { x: outX, y: outY, scale: R(0.85, 1.2), rotation: `+=${R(-160, 160)}`, duration: R(1, 1.6), ease: 'power2.out' }, '<')
            .to(el, { opacity: 0, duration: 0.5 }, '-=0.55')
        })
      }
      burst()
      const loop = setInterval(burst, 2500)
      return () => {
        clearInterval(loop)
        gsap.killTweensOf(els)
      }
    })
    return () => mm.revert()
  }, [])

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-4 pb-16 pt-28 md:pt-24">
      {/* jars — float behind the logo */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {JARS.map((j) => (
          <div
            key={j.src}
            className="pheno-jar absolute -translate-x-1/2"
            style={{
              left: j.left,
              top: j.top,
              zIndex: j.z,
              width: j.w,
              ['--tilt' as string]: `${j.tilt}deg`,
              ['--dur' as string]: `${j.dur}s`,
              ['--del' as string]: `${j.del}s`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- transparent product PNG */}
            <img src={j.src} alt="" className="h-auto w-full drop-shadow-[0_30px_50px_rgba(0,0,0,0.6)]" />
          </div>
        ))}
      </div>

      {/* logo + nug burst */}
      <div className="relative z-10 mx-auto w-full max-w-[1120px]">
        {/* nugs pop out from behind the logo */}
        <div ref={nugsRef} aria-hidden className="pointer-events-none absolute inset-0 z-20">
          {NUGS.map((n) => (
            <div
              key={n.src}
              data-nug
              className="pheno-nug absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: n.left, top: n.top, width: n.w }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- transparent bud PNG */}
              <img src={n.src} alt="" className="h-auto w-full drop-shadow-[0_18px_30px_rgba(0,0,0,0.55)]" />
            </div>
          ))}
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element -- crisp vector lockup */}
        <img
          src="/phenos/pheno-logo.svg"
          alt="Pheno — Hunt With Us"
          fetchPriority="high"
          className="pheno-logo-in relative z-10 mx-auto w-[min(92vw,1000px)]"
        />
      </div>

      {/* scroll cue */}
      <div
        aria-hidden
        className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 text-[11px] font-bold uppercase tracking-[0.35em] text-white/45"
        style={{ fontFamily: 'var(--font-brand)' }}
      >
        Scroll ↓
      </div>
    </section>
  )
}
