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

const LINES = ['PREMIUM', 'CANNABIS']

export default function FlowerHero() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const words = section.querySelector('[data-fl-words]')
      const stage = section.querySelector('[data-fl-stage]')
      // plant is NOT scrubbed — it rises on load via .fl-plant CSS; the scroll
      // only recedes the words and fades the stage out
      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
      })
      tl.to(words, { yPercent: -16, opacity: 0.22, scale: 0.96, ease: 'none', duration: 0.6 }, 0)
      // NO fade on the stage. It is sticky inside a 180vh section, so once its
      // travel is spent it scrolls out of frame on its own, artwork and all.
      // Fading it to 0 first left the remainder of the section as bare
      // bg-black — a measured 600px corridor with nothing in it. Retiming the
      // fade did not help because the fade was never the point; the emptiness
      // after it was.
      return () => tl.scrollTrigger?.kill()
    })
    return () => mm.revert()
  }, [])

  let li = 0 // running letter index for the drop stagger

  return (
    <section ref={sectionRef} className="relative h-[150vh] bg-black">
      <div data-fl-stage className="sticky top-0 flex h-screen items-start justify-center overflow-hidden bg-[#050505] pt-[17vh] md:pt-[13vh]">
        {/* graffiti mural texture */}
        {/* eslint-disable-next-line @next/next/no-img-element -- bg art */}
        <img
          src="/products/flower/hero-plant.webp"
          alt=""
          // Decorative mural texture, NOT the LCP element — it was completing at
          // 1049ms and spending bandwidth the LCP image needed. Let it load lazily.
          loading="lazy"
          fetchPriority="low"
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-[0.5]"
        />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_45%,transparent_0%,rgba(0,0,0,0.82)_100%)]" />

        {/* headline — near full-screen stack */}
        {/* aria-label supplies the accessible name for a heading built from
            per-letter spans. The sr-only phrase that used to sit here did the
            same job for screen readers but ALSO duplicated the heading for
            crawlers — it extracted as "Premium CannabisPREMIUMCANNABIS". Google
            ignores aria-label and reads the DOM text, so the per-line space
            below is what it needs. */}
        <h1 data-fl-words aria-label="Premium Cannabis" className="relative z-10 select-none text-center">
          <span className="fl-zoom font-display block uppercase text-white" style={{ fontSize: 'min(26vw, 48vh, 24rem)' }}>
            {LINES.map((line, lineIdx) => (
              <span key={line} className="block">
                {lineIdx > 0 && <span className="sr-only"> </span>}
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
        {/* The LCP element, and it was the whole constraint: 165KB finishing at
            3779ms on a 1.6 Mbps pipe. A phone renders it at 663 CSS px from a
            1200px file, so most of those bytes were never seen. Media-scoped
            source, same pattern as the Twins wordmark. */}
        <picture>
          <source media="(max-width: 767px)" srcSet="/products/flower/plant-cutout-m.webp" />
        <img
          data-fl-plant
          fetchPriority="high"
          src="/products/flower/plant-cutout.webp"
          alt="Frost-covered Jungle Boys live top"
          className="fl-plant absolute bottom-0 left-1/2 z-20 w-[170vw] max-w-none md:w-[min(135vw,1350px)] drop-shadow-[0_50px_90px_rgba(0,0,0,0.85)]"
        />
        </picture>

        {/* scroll cue */}
        <div aria-hidden className="absolute bottom-7 left-1/2 z-30 -translate-x-1/2 text-[10px] font-bold uppercase tracking-[0.34em] text-white/50" style={{ fontFamily: 'var(--font-brand)' }}>
          Scroll
        </div>
      </div>
    </section>
  )
}
