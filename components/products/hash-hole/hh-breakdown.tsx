'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// What's Inside the Roll — the section PINS when it reaches the top and the
// roll assembles while the page holds still: paper drops in, its line draws
// out thin toward the label, the pill pops; then flower, rosin, tip — strictly
// one by one, scrubbed so scrolling back unbuilds it. Release after the tip.
// Mobile + reduced-motion skip the pin and show a fast build on entry.
// Placements come from Avanti's SVG so nothing drifts.

const STAGE = { w: 1074.75, h: 1245.76 }

type Part = {
  key: string; label: string; img: string
  left: number; top: number; width: number
  from: { x: number; y: number; r: number }
  pill: { left: number; top: number }
  // Thin connector stub: a fixed-thickness vertical line that DRAWS downward
  // and lands exactly on its pill's top edge.
  //
  // Its `top` is NOT authored — it is derived as pill.top - len, so a connector
  // can never float free of the pill it belongs to. Two of the four used to be
  // horizontal bars with a hand-typed `top` that sat 2.5% ABOVE the pill,
  // pointing at nothing. Deriving the position removes that whole class of bug.
  line: { left: number; len: number }
}

const PARTS: Part[] = [
  { key: 'paper', label: 'All-Natural Paper', img: '/products/hash-hole/roll-paper.webp',
    left: 0, top: 6.74, width: 99.87, from: { x: 0, y: 60, r: 6 },
    pill: { left: 34, top: 84 }, line: { left: 43, len: 6 } },
  { key: 'flower', label: 'Premium Indoor Flower', img: '/products/hash-hole/roll-flower.webp',
    left: 31.11, top: 7.11, width: 52.21, from: { x: 30, y: -45, r: -10 },
    pill: { left: 58, top: 54 }, line: { left: 68, len: 3.5 } },
  { key: 'rosin', label: 'Live Hash Rosin', img: '/products/hash-hole/roll-rosin.webp',
    left: 16.75, top: 0, width: 50.12, from: { x: -40, y: -40, r: -14 },
    pill: { left: 0, top: 33 }, line: { left: 18, len: 5 } },
  { key: 'tip', label: 'Organic Wood Tip', img: '/products/hash-hole/roll-tip.webp',
    left: 13.61, top: 57.68, width: 15.1, from: { x: -55, y: 25, r: 16 },
    pill: { left: 0, top: 73 }, line: { left: 18, len: 5 } },
]

// one build beat per piece: piece → line draws → pill pops
function addBuild(tl: gsap.core.Timeline, p: Part, at: number) {
  tl.from(`[data-piece="${p.key}"]`,
    { opacity: 0, xPercent: p.from.x, yPercent: p.from.y, rotate: p.from.r, duration: 0.5, ease: 'power2.out' }, at)
    .from(`[data-line="${p.key}"]`,
      { scaleY: 0, duration: 0.22, ease: 'power1.inOut' }, at + 0.42)
    .from(`[data-pill="${p.key}"]`,
      { opacity: 0, scale: 0.6, duration: 0.24, ease: 'back.out(2.2)' }, at + 0.66)
}

export default function HhBreakdown() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      // desktop: pin and build while the page holds still
      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root, start: 'top top', end: '+=240%',
            pin: true, scrub: 0.6, anticipatePin: 1,
          },
        })
        tl.from('[data-head]', { opacity: 0, x: -60, duration: 0.4, ease: 'power2.out' }, 0)
        PARTS.forEach((p, i) => addBuild(tl, p, 0.35 + i))
        tl.to({}, { duration: 0.3 }) // beat of stillness before release
      })

      // mobile: no pin, but the build is still SCRUBBED to the scroll, so each
      // piece lands as she scrolls to it. A one-shot timeline fired all four on
      // a timer, so on a slow scroll the roll was already assembled before the
      // stage was on screen, and on a fast one it played to an empty viewport.
      mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root, start: 'top 88%', end: 'bottom 62%', scrub: 0.5 },
        })
        tl.from('[data-head]', { opacity: 0, x: -40, duration: 0.4, ease: 'power2.out' }, 0)
        PARTS.forEach((p, i) => addBuild(tl, p, 0.5 + i * 0.9))
      })

      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative overflow-hidden px-6 pb-14 pt-2 md:flex md:min-h-screen md:items-center md:py-0">
      <div className="mx-auto grid w-full max-w-[1250px] items-center gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <h2 data-head className="font-display text-center uppercase leading-[0.82] text-[var(--hh-green-deep)] lg:text-left" style={{ fontSize: 'min(13vw, 8.75rem)' }}>
          What&apos;s <br className="hidden lg:block" /> Inside <br className="hidden lg:block" /> the{' '}
          {/* on mobile ROLL gets its own line so it can run much bigger than the
              rest of the heading without ever wrapping */}
          <span className="hh-gold-head block whitespace-nowrap text-[26vw] leading-[0.9] lg:inline lg:text-[length:inherit] lg:leading-[inherit]">
            Roll
          </span>
        </h2>

        <div className="relative mx-auto w-full max-w-[520px]" style={{ aspectRatio: `${STAGE.w} / ${STAGE.h}` }}>
          {PARTS.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element -- positioned SVG-derived pieces
            <img loading="lazy" decoding="async" key={p.key} data-piece={p.key} src={p.img} alt={p.label}
              className="absolute will-change-transform"
              style={{ left: `${p.left}%`, top: `${p.top}%`, width: `${p.width}%` }} />
          ))}
          {PARTS.map((p) => (
            <div key={p.key + '-ui'} className="pointer-events-none">
              <span
                data-line={p.key}
                aria-hidden
                className="absolute bg-[var(--hh-green-deep)]"
                style={{
                  left: `${p.line.left}%`,
                  // derived, never authored — always lands on the pill's top edge
                  top: `${p.pill.top - p.line.len}%`,
                  width: '2px',
                  height: `${p.line.len}%`,
                  // draw AWAY from the piece, toward the pill
                  transformOrigin: 'top center',
                }}
              />
              <span data-pill={p.key}
                className="absolute inline-flex items-center whitespace-nowrap rounded-full bg-white/95 px-4 py-2 shadow-[0_6px_18px_rgba(19,92,43,0.22)]"
                style={{ left: `${p.pill.left}%`, top: `${p.pill.top}%` }}>
                <span className="font-display text-base uppercase leading-none text-[var(--hh-green-deep)] md:text-lg">{p.label}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
