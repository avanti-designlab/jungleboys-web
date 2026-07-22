'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Act 1 — pinned intro. The PREMIUM / CANNABIS FLOWER lockup converges in
// film-title style (letters pan in from the sides, blur settling to sharp,
// line by line); on scroll the frosty live-top cutout rises to overlap the
// words, the type recedes, then the act fades to black handing off to the
// grow sequence. Scrub-driven; reduced-motion gets the static composition.

// Equal-width lockup: PREMIUM huge, CANNABIS FLOWER sized to match its width.
const LINES = [
  { text: 'PREMIUM', size: 'min(19vw, 15.5rem)', delay: 0.2 },
  { text: 'CANNABIS FLOWER', size: 'min(9vw, 7.35rem)', delay: 0.55 },
]

export default function FlowerHero() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const words = section.querySelector('[data-fl-words]')
      const plant = section.querySelector('[data-fl-plant]')
      const stage = section.querySelector('[data-fl-stage]')
      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
      })
      tl.fromTo(plant, { yPercent: 72, scale: 0.92 }, { yPercent: 4, scale: 1.08, ease: 'none', duration: 0.62 }, 0)
        .to(words, { yPercent: -16, opacity: 0.22, scale: 0.96, ease: 'none', duration: 0.62 }, 0)
        .to(stage, { opacity: 0, ease: 'power1.in', duration: 0.3 }, 0.7)
      return () => tl.scrollTrigger?.kill()
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative h-[230vh] bg-black">
      <div data-fl-stage className="sticky top-0 flex h-screen items-center justify-center overflow-hidden bg-[#050505]">
        {/* graffiti mural texture */}
        {/* eslint-disable-next-line @next/next/no-img-element -- bg art */}
        <img
          src="/products/flower/hero-plant.webp"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-[0.5]"
        />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_45%,transparent_0%,rgba(0,0,0,0.82)_100%)]" />

        {/* headline lockup */}
        <h1
          data-fl-words
          className="font-display relative z-10 select-none text-center uppercase text-white"
        >
          {LINES.map((line) => {
            const chars = line.text.split('')
            const mid = (chars.length - 1) / 2
            return (
              <span key={line.text} className="block leading-[0.82]" style={{ fontSize: line.size }}>
                {chars.map((ch, i) => (
                  <span
                    key={i}
                    className="fl-letter inline-block"
                    style={{
                      // converge: each letter pans in from its side of center
                      ['--fl-tx' as string]: `${((i - mid) * 0.55).toFixed(2)}em`,
                      animationDelay: `${line.delay}s`,
                    }}
                  >
                    {ch === ' ' ? ' ' : ch}
                  </span>
                ))}
              </span>
            )
          })}
        </h1>

        {/* the frosty live-top rises to overlap the words */}
        {/* eslint-disable-next-line @next/next/no-img-element -- hero art */}
        <img
          data-fl-plant
          src="/products/flower/plant-cutout.webp"
          alt="Frost-covered Jungle Boys live top"
          className="absolute bottom-0 left-1/2 z-20 w-[min(135vw,1350px)] max-w-none -translate-x-1/2 translate-y-[72%] drop-shadow-[0_50px_90px_rgba(0,0,0,0.85)]"
        />

        {/* scroll cue */}
        <div aria-hidden className="absolute bottom-7 left-1/2 z-30 -translate-x-1/2 text-[10px] font-bold uppercase tracking-[0.34em] text-white/50" style={{ fontFamily: 'var(--font-brand)' }}>
          Scroll
        </div>
      </div>
    </section>
  )
}
