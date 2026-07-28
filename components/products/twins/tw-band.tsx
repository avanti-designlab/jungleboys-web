'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// THE BAND — full bleed, no pill, the way the crossover band works on the 1G
// page.
//
// This uses the mural Figma actually drew for this strip (a 4.6:1 artwork), not
// a hard crop of the tall mascot-pair lockup. Cover-cropping a portrait image
// into a wide band zoomed it to the point where it read as a garbled close-up
// rather than the design.
//
// Two layers of type run in OPPOSITE directions across it, which is the same
// mirror idea as the rest of the page and stops a single marquee reading as a
// generic ticker.

export default function TwBand() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add(
        { reduce: '(prefers-reduced-motion: reduce)', noPref: '(prefers-reduced-motion: no-preference)' },
        (mmCtx) => {
          const c = mmCtx.conditions as Record<string, boolean>
          if (c.reduce) return

          gsap.to('[data-tw-marq="a"]', { xPercent: -50, duration: 26, ease: 'none', repeat: -1 })
          gsap.fromTo('[data-tw-marq="b"]', { xPercent: -50 }, { xPercent: 0, duration: 32, ease: 'none', repeat: -1 })

          // the mural drifts against the scroll — parallax, transform only
          gsap.fromTo('[data-tw-mural]',
            { yPercent: -8, scale: 1.12 },
            {
              yPercent: 8, scale: 1.12, ease: 'none',
              scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
            })
        }
      )
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  const row = (key: string) => (
    <div data-tw-marq={key} className="flex w-max will-change-transform">
      {[0, 1].map((copy) => (
        <div key={copy} aria-hidden={copy === 1} className="flex shrink-0">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="font-display whitespace-nowrap px-5 uppercase leading-none"
              style={{
                fontSize: 'min(9vw, 5.5rem)',
                letterSpacing: '-0.03em',
                color: 'transparent',
                WebkitTextStroke: 'clamp(1px, 0.14vw, 2px) rgba(255,255,255,0.5)',
              }}>
              Twins · 2 Pack ·
            </span>
          ))}
        </div>
      ))}
    </div>
  )

  return (
    <section ref={rootRef} className="relative z-10">
      <div data-nav-theme="dark" className="relative h-[46vh] min-h-[320px] overflow-hidden bg-[var(--tw-black)]">
        {/* the mural, cropped to the faces */}
        <div className="absolute inset-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element -- brand art */}
          <img data-tw-mural src="/products/twins/band.webp" alt="Jungle Boys Twins"
            className="absolute inset-0 h-full w-full object-cover will-change-transform"
            style={{ objectPosition: '50% 50%' }} />
        </div>

        {/* darken top and bottom so the type reads over the artwork */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[1]"
          style={{ background: 'linear-gradient(180deg, rgba(4,5,12,0.85) 0%, rgba(4,5,12,0.1) 32%, rgba(4,5,12,0.15) 66%, rgba(4,5,12,0.9) 100%)' }} />

        <div className="absolute inset-x-0 top-[6%] z-10 overflow-hidden">{row('a')}</div>
        <div className="absolute inset-x-0 bottom-[6%] z-10 overflow-hidden">{row('b')}</div>
      </div>
    </section>
  )
}
