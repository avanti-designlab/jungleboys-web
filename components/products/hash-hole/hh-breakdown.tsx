'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// What's Inside the Roll — headline left, the exploded (label-free) breakdown
// right. As the section scrolls into view the art rises in, then the four
// callouts draw out one at a time in build order: paper → flower → rosin →
// tip, each pointer line growing before its label. Not pinned (scroll stays
// smooth). Reduced-motion: everything simply present.

// pos = where the label block sits (over the art); line = the pointer stroke
const PARTS = [
  { n: 1, label: 'All-Natural Paper', sub: 'Slow, even burn', pos: 'bottom-[3%] left-1/2 -translate-x-1/2 text-center', line: 'h-[7vh] w-[3px] left-1/2 bottom-full' },
  { n: 2, label: 'Premium Indoor Flower', sub: '2g of top-shelf indoor', pos: 'top-[30%] right-[-2%] text-right', line: 'h-[3px] w-[6vw] right-full top-1/2' },
  { n: 3, label: 'Live Hash Rosin', sub: 'A .5g rope down the core', pos: 'top-[2%] left-[6%] text-left', line: 'h-[4vh] w-[3px] left-[20%] top-full' },
  { n: 4, label: 'Organic Wood Tip', sub: 'A clean, natural draw', pos: 'bottom-[26%] left-[-2%] text-left', line: 'h-[3px] w-[5vw] left-full top-1/2' },
]

export default function HhBreakdown() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const art = root.querySelector('[data-art]')
      const callouts = root.querySelectorAll('[data-callout]')
      const lines = root.querySelectorAll('[data-line]')
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top 68%', once: true },
      })
      tl.from(art, { opacity: 0, y: 60, scale: 0.9, duration: 0.7, ease: 'power3.out' })
      // sequence the four callouts: line grows, then label pops
      callouts.forEach((c, i) => {
        const line = lines[i]
        tl.fromTo(line, { scaleX: 0, scaleY: 0, opacity: 0 }, { scaleX: 1, scaleY: 1, opacity: 1, duration: 0.25, ease: 'power2.out' }, 0.7 + i * 0.35)
          .fromTo(c, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.3, ease: 'back.out(1.6)' }, '>-0.05')
      })
      return () => tl.scrollTrigger?.kill()
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative px-6 py-24 md:py-32">
      <div className="mx-auto grid max-w-[1250px] items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        {/* headline left */}
        <div className="text-center lg:text-left">
          <h2 className="font-display uppercase leading-[0.82] text-[var(--hh-green-deep)]" style={{ fontSize: 'min(16vw, 8.5rem)' }}>
            What&apos;s <br className="hidden lg:block" /> Inside <br className="hidden lg:block" /> the <span className="hh-gold-head">Roll</span>
          </h2>
          <p className="mx-auto mt-6 max-w-sm text-base font-bold uppercase leading-relaxed tracking-wide text-[var(--hh-ink)]/75 lg:mx-0 md:text-lg" style={{ fontFamily: 'var(--font-brand)' }}>
            Four parts, one perfect hole. Scroll to break it down.
          </p>
        </div>

        {/* art + callouts right */}
        <div className="relative mx-auto w-full max-w-[620px]">
          {/* eslint-disable-next-line @next/next/no-img-element -- breakdown art */}
          <img data-art src="/products/hash-hole/breakdown.webp" alt="Hash Hole broken down — rosin rope, flower, rolling paper and wood tip" className="w-full" />

          {PARTS.map((p) => (
            <div key={p.n} className={`pointer-events-none absolute ${p.pos}`}>
              {/* pointer line (transform-origin toward the art) */}
              <span data-line aria-hidden className={`absolute origin-center bg-[var(--hh-green-deep)] ${p.line}`} />
              <div data-callout className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 shadow-[0_6px_18px_rgba(19,92,43,0.2)] backdrop-blur">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--hh-gold)] text-xs font-extrabold text-[var(--hh-ink)]" style={{ fontFamily: 'var(--font-brand)' }}>{p.n}</span>
                <span className="font-display text-lg uppercase leading-none text-[var(--hh-green-deep)] md:text-xl">{p.label}</span>
              </div>
              <p className="mt-1 pl-8 text-[11px] font-bold uppercase tracking-wide text-[var(--hh-ink)]/70" style={{ fontFamily: 'var(--font-brand)' }}>{p.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
