'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Act 1 — pinned intro. PREMIUM / CANNABIS / FLOWER stacked huge (near
// full-screen), entering with the site's banner language: letters drop in
// with overshoot while the block zoom-settles (same keyframes family as the
// contact/media banners, released by RevealGate so it's seen on first visit).
// On scroll the frosty live-top cutout rises to overlap the words, the type
// recedes, then the act fades to black handing off to the grow sequence.

const LINES = ['PREMIUM', 'CANNABIS', 'FLOWER']

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

  let li = 0 // running letter index for the drop stagger

  return (
    <section ref={sectionRef} className="relative h-[180vh] bg-black">
      <div data-fl-stage className="sticky top-0 flex h-screen items-start justify-center overflow-hidden bg-[#050505] pt-[9vh]">
        {/* graffiti mural texture */}
        {/* eslint-disable-next-line @next/next/no-img-element -- bg art */}
        <img
          src="/products/flower/hero-plant.webp"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-[0.5]"
        />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_45%,transparent_0%,rgba(0,0,0,0.82)_100%)]" />

        {/* headline — near full-screen stack */}
        <h1 data-fl-words className="relative z-10 select-none text-center">
          <span className="fl-zoom font-display block uppercase text-white" style={{ fontSize: 'min(26vw, 38vh, 22rem)' }}>
            {LINES.map((line, lineIdx) => (
              <span key={line} className="block">
                {line.split('').map((ch) => (
                  <span
                    key={li}
                    className="fl-letter"
                    style={{ animationDelay: `${0.1 + lineIdx * 0.2 + li++ * 0.028}s` }}
                  >
                    {ch}
                  </span>
                ))}
              </span>
            ))}
          </span>
        </h1>

        {/* the frosty live-top rises to overlap the words */}
        {/* eslint-disable-next-line @next/next/no-img-element -- hero art */}
        <img
          data-fl-plant
          src="/products/flower/plant-cutout.webp"
          alt="Frost-covered Jungle Boys live top"
          className="absolute bottom-0 left-1/2 z-20 w-[min(135vw,1350px)] max-w-none -translate-x-1/2 drop-shadow-[0_50px_90px_rgba(0,0,0,0.85)]"
          // vertical is GSAP-owned (yPercent 72 → 4); an inline transform would
          // double-stack with it, and a translate-y class did exactly that
          style={{ transform: 'translateY(72%)' }}
        />

        {/* scroll cue */}
        <div aria-hidden className="absolute bottom-7 left-1/2 z-30 -translate-x-1/2 text-[10px] font-bold uppercase tracking-[0.34em] text-white/50" style={{ fontFamily: 'var(--font-brand)' }}>
          Scroll
        </div>
      </div>
    </section>
  )
}
