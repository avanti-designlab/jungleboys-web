'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// THE CHARACTER. The Gas Tank character is revealed the way a shutter opens:
// the band starts clipped to a thin slit and expands vertically as you scroll,
// while the artwork itself pushes the other way in parallax — so the character
// appears to be revealed BEHIND the opening rather than sliding into it.

export default function GtCharacter() {
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
          const tl = gsap.timeline({
            scrollTrigger: { trigger: root, start: 'top 88%', end: 'bottom 40%', scrub: 0.7 },
          })
          // the slit opens… (clip-path, NOT height: a % height resolves against
          // a parent with no fixed height and collapses the band to 0)
          tl.fromTo('[data-slit]',
            { clipPath: 'inset(43% 0% 43% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.out' }, 0)
            // …while the art drifts the opposite way (parallax depth)
            .fromTo('[data-art]', { yPercent: -16, scale: 1.18 }, { yPercent: 6, scale: 1, ease: 'none' }, 0)
        }
      )
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative z-10 overflow-hidden bg-[var(--gt-black)] px-2 py-6 md:px-3 md:py-10">
      <div data-slit className="relative mx-auto h-[26vh] max-h-[300px] w-full overflow-hidden rounded-[1.75rem] will-change-[clip-path] md:rounded-[2.5rem]" style={{ clipPath: 'inset(43% 0% 43% 0%)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- character band art */}
        <img
          data-art
          src="/products/gas-tank/character-band.webp"
          alt="Jungle Boys Gas Tank character"
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
        />
      </div>
    </section>
  )
}
