'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// What's Inside the Roll — the build is SCRUBBED to scroll position, so the
// roll assembles under your thumb: paper → its line → its pill, then flower,
// rosin, tip. Scroll back and it comes apart again. No pin, so the page keeps
// moving the whole time and nothing sits parked on a dead screen. Placements
// come from Avanti's SVG so nothing drifts.
//
// Every selector runs inside gsap.context(root) — unscoped strings leak across
// sibling sections that share attribute names and silently poison each other's
// from()-state.

const STAGE = { w: 1074.75, h: 1245.76 }

type Part = {
  key: string; n: number; label: string; img: string
  left: number; top: number; width: number
  from: { x: number; y: number; r: number }
  pill: { left: number; top: number }
  line: { left: number; top: number; w: number; h: number }
}

const PARTS: Part[] = [
  { key: 'paper', n: 1, label: 'All-Natural Paper', img: '/products/hash-hole/roll-paper.webp',
    left: 0, top: 6.74, width: 99.87, from: { x: 0, y: 60, r: 6 },
    pill: { left: 28, top: 80 }, line: { left: 37, top: 74.5, w: 0.45, h: 5 } },
  { key: 'flower', n: 2, label: 'Premium Indoor Flower', img: '/products/hash-hole/roll-flower.webp',
    left: 31.11, top: 7.11, width: 52.21, from: { x: 30, y: -45, r: -10 },
    pill: { left: 58, top: 54 }, line: { left: 68, top: 50.5, w: 0.45, h: 3.5 } },
  { key: 'rosin', n: 3, label: 'Live Hash Rosin', img: '/products/hash-hole/roll-rosin.webp',
    left: 16.75, top: 0, width: 50.12, from: { x: -40, y: -40, r: -14 },
    pill: { left: 0, top: 33 }, line: { left: 9, top: 30.5, w: 9, h: 0.4 } },
  { key: 'tip', n: 4, label: 'Organic Wood Tip', img: '/products/hash-hole/roll-tip.webp',
    left: 13.61, top: 57.68, width: 15.1, from: { x: -55, y: 25, r: 16 },
    pill: { left: 0, top: 73 }, line: { left: 9, top: 70.5, w: 7, h: 0.4 } },
]

export default function HhBreakdown() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root, start: 'top 88%', end: 'bottom 55%', scrub: 0.6 },
        })
        tl.from('[data-head]', { opacity: 0, x: -70, duration: 0.8, ease: 'power2.out' }, 0)
        PARTS.forEach((p, i) => {
          const at = 0.6 + i * 0.9
          tl.from(`[data-piece="${p.key}"]`,
            { opacity: 0, xPercent: p.from.x, yPercent: p.from.y, rotate: p.from.r, duration: 0.7, ease: 'power2.out' }, at)
            .from(`[data-line="${p.key}"]`, { scaleX: 0, scaleY: 0, opacity: 0, duration: 0.28, ease: 'power1.out' }, at + 0.5)
            .from(`[data-pill="${p.key}"]`, { opacity: 0, scale: 0.7, duration: 0.32, ease: 'back.out(2)' }, at + 0.64)
        })
      })
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative overflow-hidden px-6 py-16 md:py-24">
      <div className="mx-auto grid w-full max-w-[1250px] items-center gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <h2 data-head className="font-display text-center uppercase leading-[0.82] text-[var(--hh-green-deep)] lg:text-left" style={{ fontSize: 'min(12vw, 6.5rem)' }}>
          What&apos;s <br className="hidden lg:block" /> Inside <br className="hidden lg:block" /> the <span className="hh-gold-head">Roll</span>
        </h2>

        <div className="relative mx-auto w-full max-w-[520px]" style={{ aspectRatio: `${STAGE.w} / ${STAGE.h}` }}>
          {PARTS.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element -- positioned SVG-derived pieces
            <img key={p.key} data-piece={p.key} src={p.img} alt={p.label}
              className="absolute will-change-transform"
              style={{ left: `${p.left}%`, top: `${p.top}%`, width: `${p.width}%` }} />
          ))}
          {PARTS.map((p) => (
            <div key={p.key + '-ui'} className="pointer-events-none">
              <span data-line={p.key} aria-hidden className="absolute origin-center rounded-full bg-[var(--hh-green-deep)]"
                style={{ left: `${p.line.left}%`, top: `${p.line.top}%`, width: `${p.line.w}%`, height: `${p.line.h}%`, minWidth: 2, minHeight: 2 }} />
              <span data-pill={p.key}
                className="absolute inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white/95 px-3 py-1.5 shadow-[0_6px_18px_rgba(19,92,43,0.22)]"
                style={{ left: `${p.pill.left}%`, top: `${p.pill.top}%` }}>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--hh-gold)] text-xs font-extrabold text-[var(--hh-ink)]" style={{ fontFamily: 'var(--font-brand)' }}>{p.n}</span>
                <span className="font-display text-base uppercase leading-none text-[var(--hh-green-deep)] md:text-lg">{p.label}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
