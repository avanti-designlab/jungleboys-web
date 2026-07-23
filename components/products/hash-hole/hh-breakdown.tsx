'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// What's Inside the Roll — a real build sequence on a fixed stage.
// Headline arrives first on the left, then as you keep scrolling the roll
// assembles piece by piece, each followed by its pointer line and pill:
//   1 paper → 2 flower → 3 rosin → 4 wood tip
// Piece placements come straight from Avanti's SVG (viewBox 1074.75×1245.76),
// so nothing can drift. Reduced-motion: the finished roll, fully labelled.

const STAGE = { w: 1074.75, h: 1245.76 }

type Part = {
  key: string
  n: number
  label: string
  img: string
  // placement in stage %
  left: number
  top: number
  width: number
  // where the piece flies in from
  from: { x: number; y: number; r: number }
  // pill + line
  pill: { left: number; top: number }
  line: { left: number; top: number; w: number; h: number }
}

const PARTS: Part[] = [
  {
    key: 'paper', n: 1, label: 'All-Natural Paper', img: '/products/hash-hole/roll-paper.webp',
    left: 0, top: 6.74, width: 99.87,
    from: { x: 0, y: 120, r: 8 },
    pill: { left: 28, top: 80 },
    line: { left: 37, top: 74.5, w: 0.45, h: 5 },
  },
  {
    key: 'flower', n: 2, label: 'Premium Indoor Flower', img: '/products/hash-hole/roll-flower.webp',
    left: 31.11, top: 7.11, width: 52.21,
    from: { x: 60, y: -70, r: -12 },
    pill: { left: 58, top: 54 },
    line: { left: 68, top: 50.5, w: 0.45, h: 3.5 },
  },
  {
    key: 'rosin', n: 3, label: 'Live Hash Rosin', img: '/products/hash-hole/roll-rosin.webp',
    left: 16.75, top: 0, width: 50.12,
    from: { x: -70, y: -60, r: -18 },
    pill: { left: 0, top: 33 },
    line: { left: 9, top: 30.5, w: 9, h: 0.4 },
  },
  {
    key: 'tip', n: 4, label: 'Organic Wood Tip', img: '/products/hash-hole/roll-tip.webp',
    left: 13.61, top: 57.68, width: 15.1,
    from: { x: -80, y: 40, r: 20 },
    pill: { left: 0, top: 73 },
    line: { left: 9, top: 70.5, w: 7, h: 0.4 },
  },
]

export default function HhBreakdown() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const head = root.querySelector('[data-head]')
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.8 },
      })
      // headline first, on the left
      tl.fromTo(head, { opacity: 0, x: -70 }, { opacity: 1, x: 0, duration: 0.14, ease: 'power2.out' }, 0)

      // then each piece, followed by its line and pill — one after another
      PARTS.forEach((p, i) => {
        const at = 0.18 + i * 0.19
        const piece = root.querySelector(`[data-piece="${p.key}"]`)
        const line = root.querySelector(`[data-line="${p.key}"]`)
        const pill = root.querySelector(`[data-pill="${p.key}"]`)
        tl.fromTo(piece,
          { opacity: 0, xPercent: p.from.x, yPercent: p.from.y, rotate: p.from.r },
          { opacity: 1, xPercent: 0, yPercent: 0, rotate: 0, duration: 0.11, ease: 'power3.out' }, at)
          .fromTo(line, { scaleX: 0, scaleY: 0, opacity: 0 }, { scaleX: 1, scaleY: 1, opacity: 1, duration: 0.045, ease: 'power2.out' }, at + 0.1)
          .fromTo(pill, { opacity: 0, scale: 0.75 }, { opacity: 1, scale: 1, duration: 0.05, ease: 'back.out(2)' }, at + 0.13)
      })
      return () => tl.scrollTrigger?.kill()
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative h-[340vh]">
      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden px-6">
        <div className="mx-auto grid w-full max-w-[1300px] items-center gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          {/* headline — arrives first, on the left */}
          <h2 data-head className="font-display text-center uppercase leading-[0.82] text-[var(--hh-green-deep)] lg:text-left" style={{ fontSize: 'min(13vw, 7.5rem)' }}>
            What&apos;s <br className="hidden lg:block" /> Inside <br className="hidden lg:block" /> the <span className="hh-gold-head">Roll</span>
          </h2>

          {/* the build stage — exact SVG geometry */}
          <div className="relative mx-auto w-full max-w-[560px]" style={{ aspectRatio: `${STAGE.w} / ${STAGE.h}` }}>
            {PARTS.map((p) => (
              <img
                key={p.key}
                data-piece={p.key}
                src={p.img}
                alt={p.label}
                className="absolute will-change-transform"
                style={{ left: `${p.left}%`, top: `${p.top}%`, width: `${p.width}%` }}
              />
            ))}

            {PARTS.map((p) => (
              <div key={p.key + '-ui'} className="pointer-events-none">
                <span
                  data-line={p.key}
                  aria-hidden
                  className="absolute origin-center rounded-full bg-[var(--hh-green-deep)]"
                  style={{ left: `${p.line.left}%`, top: `${p.line.top}%`, width: `${p.line.w}%`, height: `${p.line.h}%`, minWidth: 2, minHeight: 2 }}
                />
                <span
                  data-pill={p.key}
                  className="absolute inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white/95 px-3 py-1.5 shadow-[0_6px_18px_rgba(19,92,43,0.22)]"
                  style={{ left: `${p.pill.left}%`, top: `${p.pill.top}%` }}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--hh-gold)] text-xs font-extrabold text-[var(--hh-ink)]" style={{ fontFamily: 'var(--font-brand)' }}>
                    {p.n}
                  </span>
                  <span className="font-display text-base uppercase leading-none text-[var(--hh-green-deep)] md:text-xl">{p.label}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
