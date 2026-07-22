'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Act 1 — pinned intro. "PREMIUM CANNABIS FLOWER" pans in letter-by-letter on
// load; on scroll the frosty live-top plant rises to overlap the words, the
// type recedes, then the whole act fades to black handing off to the grow
// sequence (Act 2). Scrub-driven; reduced-motion gets the static composition.

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
      tl.fromTo(plant, { yPercent: 72, scale: 0.92 }, { yPercent: 6, scale: 1.06, ease: 'none', duration: 0.62 }, 0)
        .to(words, { yPercent: -16, opacity: 0.22, scale: 0.96, ease: 'none', duration: 0.62 }, 0)
        .to(stage, { opacity: 0, ease: 'power1.in', duration: 0.3 }, 0.7)
      return () => tl.scrollTrigger?.kill()
    })
    return () => mm.revert()
  }, [])

  let li = 0 // running letter index for the stagger

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

        {/* headline */}
        <h1
          data-fl-words
          className="font-display relative z-10 select-none text-center uppercase leading-[0.84] text-white"
          style={{ fontSize: 'min(17vw, 15rem)' }}
        >
          {LINES.map((line) => (
            <span key={line} className="block overflow-hidden pb-[0.06em]">
              {line.split('').map((ch) => (
                <span key={li} className="fl-letter inline-block" style={{ animationDelay: `${0.15 + li++ * 0.045}s` }}>
                  {ch}
                </span>
              ))}
            </span>
          ))}
        </h1>

        {/* the frosty live-top rises to overlap the words */}
        {/* eslint-disable-next-line @next/next/no-img-element -- hero art */}
        <img
          data-fl-plant
          src="/products/flower/plant-portrait.webp"
          alt="Frosted Jungle Boys live top against black"
          className="absolute bottom-0 left-1/2 z-20 w-[min(120vw,1200px)] max-w-none -translate-x-1/2 translate-y-[72%]"
          style={{
            // the shot has a solid black bg — feather the box edges so it melts
            // into the stage instead of showing a hard seam over the mural
            WebkitMaskImage: 'radial-gradient(ellipse 72% 74% at 50% 52%, black 58%, transparent 96%)',
            maskImage: 'radial-gradient(ellipse 72% 74% at 50% 52%, black 58%, transparent 96%)',
          }}
        />

        {/* scroll cue */}
        <div aria-hidden className="absolute bottom-7 left-1/2 z-30 -translate-x-1/2 text-[10px] font-bold uppercase tracking-[0.34em] text-white/50" style={{ fontFamily: 'var(--font-brand)' }}>
          Scroll
        </div>
      </div>
    </section>
  )
}
