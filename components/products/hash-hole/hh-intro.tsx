'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Intro — "The Tee Box". The HASH HOLE flag plants in the middle of the green
// and four course-signage plaques swing down around it on staggered arcs, each
// hand-tilted so it reads placed rather than gridded. Number and label sit
// inline when the number is short (2G / .5G) and stack when the word is long
// (ORGANIC / ALL NATURAL) — matching the pack design. One compact screen, no
// pinning. Reduced-motion: everything settled, still.

type Plaque = {
  big: string
  small: string
  layout: 'inline' | 'stacked'
  // desktop placement on the stage (%) + resting tilt
  left: number
  top: number
  rot: number
  from: number // swing-in direction
}

const PLAQUES: Plaque[] = [
  { big: '2G', small: 'Indoor\nFlower', layout: 'inline', left: 1, top: 20, rot: -4, from: -70 },
  { big: '.5G', small: 'Hash\nRosin', layout: 'inline', left: 5, top: 57, rot: 3, from: -70 },
  { big: 'Organic', small: 'Wood Tip', layout: 'stacked', left: 74, top: 20, rot: 4, from: 70 },
  { big: 'All Natural', small: 'Unrefined Paper', layout: 'stacked', left: 70, top: 57, rot: -3, from: 70 },
]

function PlaqueCard({ p }: { p: Plaque }) {
  return (
    <div
      className="hh-plaque flex items-center justify-center text-white"
      style={{ ['--rot' as string]: `${p.rot}deg` }}
    >
      {p.layout === 'inline' ? (
        <span className="flex items-center gap-[0.35em] px-[0.7em] py-[0.45em]">
          <span className="font-display whitespace-nowrap leading-none" style={{ fontSize: '1em' }}>{p.big}</span>
          <span className="font-extrabold uppercase leading-[1.05] tracking-tight" style={{ fontFamily: 'var(--font-brand)', fontSize: '0.4em' }}>
            {p.small.split('\n').map((l) => <span key={l} className="block">{l}</span>)}
          </span>
        </span>
      ) : (
        <span className="flex flex-col items-center px-[0.7em] py-[0.4em] text-center">
          <span className="font-display whitespace-nowrap leading-none" style={{ fontSize: '0.62em' }}>{p.big}</span>
          <span className="whitespace-nowrap font-extrabold uppercase leading-none tracking-tight" style={{ fontFamily: 'var(--font-brand)', fontSize: '0.34em' }}>
            {p.small}
          </span>
        </span>
      )}
    </div>
  )
}

export default function HhIntro() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    // scoped: unscoped selector strings leak into sibling sections sharing attr names
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 80%', once: true } })
        tl.from('[data-kicker]', { opacity: 0, y: -24, duration: 0.5, ease: 'power3.out' }, 0)
          .from('[data-logo]', { opacity: 0, y: -70, scale: 0.86, duration: 0.75, ease: 'back.out(1.5)' }, 0.1)
        // plaques swing down from their own side, one after another (desktop and
        // mobile stages both render, so stagger on i % 4 not raw index)
        root.querySelectorAll<HTMLElement>('[data-plaque]').forEach((el, i) => {
          const from = Number(el.dataset.from)
          tl.from(el, { opacity: 0, y: -90, x: from, rotate: from > 0 ? 16 : -16, duration: 0.6, ease: 'back.out(1.6)' }, 0.35 + (i % 4) * 0.11)
        })
      })
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="hh-intro" ref={rootRef} className="relative px-6 pb-14 pt-20 md:pt-24">
      <p
        data-kicker
        className="text-center font-extrabold uppercase tracking-[0.3em] text-[var(--hh-green-deep)]"
        style={{ fontFamily: 'var(--font-brand)', fontSize: 'min(3.4vw, 44px)' }}
      >
        Introducing the all new
      </p>

      {/* ── desktop stage: flag centre, plaques planted around it ── */}
      <div className="relative mx-auto mt-4 hidden w-full max-w-[1400px] md:block" style={{ aspectRatio: '1400 / 720' }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- hero logo */}
        <img
          data-logo
          src="/products/hash-hole/hashhole-logo.webp"
          alt="Jungle Boys Hash Hole"
          className="hh-float absolute left-1/2 top-0 h-full w-auto -translate-x-1/2"
        />
        {PLAQUES.map((p) => (
          <div
            key={p.big}
            data-plaque
            data-from={p.from}
            className="absolute"
            style={{ left: `${p.left}%`, top: `${p.top}%`, fontSize: 'min(4.4vw, 62px)' }}
          >
            <PlaqueCard p={p} />
          </div>
        ))}
      </div>

      {/* ── mobile: flag, then plaques 2×2 ── */}
      <div className="mt-4 md:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- hero logo */}
        <img src="/products/hash-hole/hashhole-logo.webp" alt="Jungle Boys Hash Hole" className="hh-float mx-auto w-[76vw]" />
        <div className="mx-auto mt-8 grid max-w-[520px] grid-cols-2 gap-4" style={{ fontSize: '8.5vw' }}>
          {PLAQUES.map((p) => (
            <div key={p.big} data-plaque data-from={p.from}>
              <PlaqueCard p={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
