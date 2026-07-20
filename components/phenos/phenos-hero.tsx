'use client'

import Image from 'next/image'
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

// nugs — resting scatter spots around the logo (they pop out from center to here)
const NUGS = [
  { src: '/phenos/nug-1.png', left: '13%', top: '20%', w: 92 },
  { src: '/phenos/nug-2.png', left: '9%', top: '52%', w: 78 },
  { src: '/phenos/nug-3.png', left: '19%', top: '78%', w: 84 },
  { src: '/phenos/nug-4.png', left: '86%', top: '18%', w: 96 },
  { src: '/phenos/nug-5.png', left: '90%', top: '50%', w: 74 },
  { src: '/phenos/nug-6.png', left: '80%', top: '76%', w: 88 },
]

export default function PhenosHero() {
  const nugsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const box = nugsRef.current
    if (!box) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const els = Array.from(box.querySelectorAll<HTMLElement>('[data-nug]'))
      const pop = () => {
        const c = box.getBoundingClientRect()
        const cx = c.left + c.width / 2
        const cy = c.top + c.height / 2
        els.forEach((el, i) => {
          const r = el.getBoundingClientRect()
          // vector that would move this nug back to the logo centre
          const fromX = cx - (r.left + r.width / 2)
          const fromY = cy - (r.top + r.height / 2)
          gsap.killTweensOf(el)
          gsap.set(el, { x: fromX, y: fromY, scale: 0.2, opacity: 0, rotation: gsap.utils.random(-40, 40) })
          gsap
            .timeline({ delay: 0.35 + i * 0.09 })
            .to(el, { opacity: 1, duration: 0.2 })
            .to(el, { x: 0, y: 0, scale: 1, rotation: 0, duration: 0.85, ease: 'back.out(1.5)' }, '<')
            .to(el, {
              y: '+=14',
              duration: 2.6 + i * 0.25,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
            })
        })
      }
      pop()
      // re-pop whenever the hero scrolls back into view
      const io = new IntersectionObserver(
        (entries) => entries.forEach((e) => e.isIntersecting && pop()),
        { threshold: 0.4 }
      )
      io.observe(box)
      return () => io.disconnect()
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

        <Image
          src="/phenos/pheno-logo.png"
          alt="Pheno — Hunt With Us"
          width={852}
          height={372}
          priority
          sizes="(max-width: 768px) 92vw, 1000px"
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
