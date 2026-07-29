'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// WHAT IT IS — the six spec claims, on their own.
//
// These used to live along the bottom of the hero as a single row. Six pills
// never fit the width of a phone, so the row became a sideways scroller: the
// last three sat off screen and nothing told you they were there. A claim you
// have to swipe to find is a claim nobody reads.
//
// Given a section of their own they can simply be a grid — everything visible
// at once, no horizontal scroll anywhere — and each one lands as you reach it.

const SPECS = [
  { icon: 'palm', label: 'Palm sized\nand discreet' },
  { icon: 'extracts', label: 'Built for\npure extracts' },
  { icon: 'vapor', label: 'Big vapor,\nsmooth pull' },
  { icon: 'taste', label: 'Uncompromised\ntaste' },
  { icon: 'lasts', label: 'Performance\nthat lasts' },
  { icon: 'ccell', label: 'Powered by\nCCELL tech' },
]

export default function GtSpecs() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-gt-spec]', {
          opacity: 0, y: 26, scale: 0.96,
          duration: 0.5, stagger: 0.07, ease: 'power2.out',
          scrollTrigger: { trigger: root, start: 'top 82%', once: true },
        })
        gsap.from('[data-gt-spec-head]', {
          opacity: 0, y: 20, duration: 0.5, ease: 'power2.out',
          scrollTrigger: { trigger: root, start: 'top 88%', once: true },
        })
      })
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative z-10 bg-[var(--gt-black)] px-4 py-14 md:px-6 md:py-20">
      {/* the same heat that sits under the hero, so this reads as part of the burn */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[70%]"
        style={{ background: 'radial-gradient(120% 80% at 50% 118%, rgba(255,122,24,0.20) 0%, rgba(225,27,11,0.09) 38%, rgba(10,9,8,0) 74%)' }} />

      <div className="relative z-10 mx-auto w-full max-w-[1180px]">
        <h2 data-gt-spec-head
          className="font-display mb-8 text-center uppercase leading-[0.86] text-white will-change-transform md:mb-12"
          style={{ fontSize: 'min(13vw, 4.6rem)', letterSpacing: '-0.03em' }}>
          Built <span className="text-[var(--gt-yellow)]">for this.</span>
        </h2>

        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-4">
          {SPECS.map((s) => (
            <span
              key={s.icon}
              data-gt-spec
              className="flex items-center gap-3 rounded-2xl border border-white/15 bg-black/55 px-3.5 py-3.5 text-left text-[11px] font-extrabold uppercase leading-[1.25] tracking-wider text-white/90 backdrop-blur-md will-change-transform md:gap-4 md:rounded-full md:px-6 md:py-4 md:text-[17px]"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- inline icon */}
              <img src={`/products/gas-tank/icons/${s.icon}.svg`} alt="" aria-hidden
                className="h-6 w-6 shrink-0 object-contain md:h-7 md:w-7" />
              {/* two lines on a phone, where that is what fits; one line from md
                  up, at a size that actually fills the pill */}
              <span className="block md:hidden">
                {s.label.split('\n')[0]}<br />{s.label.split('\n')[1]}
              </span>
              <span className="hidden whitespace-nowrap md:block">
                {s.label.replace('\n', ' ')}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
