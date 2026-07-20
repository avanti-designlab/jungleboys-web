'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// "+50PTS" pill whose number counts up when it scrolls into view.

gsap.registerPlugin(ScrollTrigger)

export default function PointsPill({ value = 50 }: { value?: number }) {
  const numRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = numRef.current
    if (!el) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const state = { n: 0 }
      gsap.to(state, {
        n: value,
        duration: 0.8,
        ease: 'power1.out',
        snap: { n: 1 },
        scrollTrigger: { trigger: el, start: 'top 78%', once: true },
        onUpdate: () => {
          el.textContent = String(state.n)
        },
      })
    })
    return () => mm.revert()
  }, [value])

  return (
    <span className="inline-flex items-baseline gap-0.5 rounded-full border border-[var(--color-accent)]/70 bg-[var(--color-accent)]/10 px-4 py-1.5 text-xl font-extrabold tracking-tight text-[var(--color-foreground)] md:text-2xl">
      +<span ref={numRef}>{value}</span>
      <span className="ml-1 text-[11px] font-bold tracking-widest text-[var(--color-accent-ink)]">PTS</span>
    </span>
  )
}
