'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

// Pheno hero: the "PHENO HUNT WITH US!" logo is the hero imagery. Four jars
// float and bob behind it, and a stream of nugs flows out from behind/around
// the logo (radiating outward on a loop, like the rewards coins).
// Reduced-motion: jars sit still + a handful of static nugs (CSS).

// jars — framing the logo: big center peeks over the top, flanks left + right,
// one accent upper-right. big center jar = jar-3.
const JARS = [
  { src: '/phenos/jar-3.png', left: '38%', top: '16%', w: 150, tilt: 0, dur: 7.2, del: 0, z: 5 },
  { src: '/phenos/jar-1.png', left: '12%', top: '44%', w: 132, tilt: -7, dur: 5.9, del: 0.5, z: 3 },
  { src: '/phenos/jar-4.png', left: '88%', top: '42%', w: 134, tilt: 7, dur: 6.3, del: 0.35, z: 4 },
  { src: '/phenos/jar-2.png', left: '73%', top: '12%', w: 122, tilt: 5, dur: 6.6, del: 0.2, z: 4 },
]

// nugs — a stream that flows out from behind/around the logo. left/top here are
// only the reduced-motion resting spots (a subset shows; the rest are motion-only).
const NUG_IMGS = ['/phenos/nug-1.png', '/phenos/nug-2.png', '/phenos/nug-3.png', '/phenos/nug-4.png', '/phenos/nug-5.png', '/phenos/nug-6.png']
const NUGS = Array.from({ length: 20 }, (_, i) => ({
  src: NUG_IMGS[i % NUG_IMGS.length],
  left: `${8 + ((i * 61) % 84)}%`,
  top: `${14 + ((i * 37) % 72)}%`,
  w: 62 + (i % 4) * 12,
  extra: i >= 7, // beyond the first 7 → hidden under reduced-motion
}))

export default function PhenosHero() {
  const nugsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const box = nugsRef.current
    if (!box) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const els = Array.from(box.querySelectorAll<HTMLElement>('[data-nug]'))
      const R = gsap.utils.random
      // each nug is born somewhere behind/around the logo, then flows outward
      // (radiating away from centre) and fades. Staggered → a continuous stream.
      const flow = (el: HTMLElement, i: number) => {
        const c = box.getBoundingClientRect()
        const cx = c.left + c.width / 2
        const cy = c.top + c.height / 2
        gsap.killTweensOf(el)
        gsap.set(el, { x: 0, y: 0, xPercent: -50, yPercent: -50, rotation: 0, scale: 1 })
        const r = el.getBoundingClientRect()
        const homeX = r.left + r.width / 2
        const homeY = r.top + r.height / 2
        // origin: a random point within the logo's area (behind it)
        const ox = cx + R(-c.width * 0.46, c.width * 0.46)
        const oy = cy + R(-c.height * 0.42, c.height * 0.42)
        const startX = ox - homeX
        const startY = oy - homeY
        // radiate outward from the logo centre through the origin, with jitter
        const dir = Math.atan2(oy - cy, ox - cx) + R(-0.55, 0.55)
        const dist = R(220, 560)
        const endX = startX + Math.cos(dir) * dist
        const endY = startY + Math.sin(dir) * dist
        gsap.set(el, { x: startX, y: startY, xPercent: -50, yPercent: -50, scale: R(0.3, 0.55), opacity: 0, rotation: R(-40, 40) })
        gsap
          .timeline({ delay: i * 0.08 })
          .to(el, { opacity: 1, duration: 0.35 })
          .to(el, { x: endX, y: endY, scale: R(0.75, 1.15), rotation: `+=${R(-130, 130)}`, duration: R(1.6, 2.6), ease: 'power1.out' }, '<')
          .to(el, { opacity: 0, duration: 0.6 }, '-=0.7')
      }
      const burst = () => els.forEach((el, i) => flow(el, i))
      burst()
      const loop = setInterval(burst, 1900)
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
        {/* nugs flow out from behind/around the logo */}
        <div ref={nugsRef} aria-hidden className="pointer-events-none absolute inset-0 z-20">
          {NUGS.map((n, i) => (
            <div
              key={i}
              data-nug
              className={`pheno-nug absolute -translate-x-1/2 -translate-y-1/2 ${n.extra ? 'pheno-nug--extra' : ''}`}
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

      {/* scroll cue — "SCROLL" + a bobbing down arrow (scrolls to the survey on click) */}
      <button
        type="button"
        aria-label="Scroll to the feedback form"
        onClick={() => {
          // scroll the window directly — scrollIntoView is unreliable here because
          // the overflow-hidden <main> (clips the texture) swallows it.
          const el = document.getElementById('join')
          if (!el) return
          const y = el.getBoundingClientRect().top + window.scrollY - 96
          window.scrollTo({ top: y, behavior: 'smooth' })
        }}
        className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 cursor-pointer flex-col items-center gap-2.5 text-white/55 transition-colors duration-200 hover:text-white"
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.45em]" style={{ fontFamily: 'var(--font-brand)' }}>
          Scroll
        </span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="pheno-scroll-arrow h-5 w-5" aria-hidden>
          <path d="M12 5v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </section>
  )
}
