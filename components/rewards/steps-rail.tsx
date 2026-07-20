'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { STEPS } from '@/lib/rewards-content'

// In-store rewards steps: a scroll-driven sequence — each step rises and
// ILLUMINATES (accent border + glow) before the arrow lights the way to the
// next, until all four are revealed. Scrubbed to scroll.

gsap.registerPlugin(ScrollTrigger)

export default function StepsRail() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const steps = root.querySelectorAll('[data-step]')
      const arrows = root.querySelectorAll('[data-step-arrow]')
      const label = root.querySelector('[data-steps-label]')
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top 75%', end: 'bottom 55%', scrub: true },
      })
      if (label) {
        gsap.set(label, { opacity: 0, y: 40 })
        tl.to(label, { opacity: 1, y: 0, duration: 0.4, ease: 'none' })
      }
      steps.forEach((step, i) => {
        gsap.set(step, { opacity: 0, y: 70 })
        tl.to(step, { opacity: 1, y: 0, duration: 0.45, ease: 'none' })
        tl.to(
          step,
          {
            borderColor: 'rgba(254,207,14,0.9)',
            boxShadow: '0 0 42px rgba(254,207,14,0.28)',
            duration: 0.3,
            ease: 'none',
          },
          '<+0.15'
        )
        const arrow = arrows[i]
        if (arrow) {
          gsap.set(arrow, { opacity: 0.15, scale: 0.7 })
          tl.to(arrow, { opacity: 1, scale: 1.25, color: '#fecf0e', duration: 0.25, ease: 'none' }, '<+0.1')
        }
      })
    })
    return () => mm.revert()
  }, [])

  return (
    <div ref={ref}>
      <p
        data-steps-label
        className="mx-auto w-fit rounded-full bg-[var(--color-foreground)] px-10 py-4 text-xl font-extrabold uppercase tracking-widest text-[var(--color-background)] md:text-2xl"
        style={{ fontFamily: 'var(--font-brand)' }}
      >
        In-Store Rewards Points
      </p>
      <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li
            key={s.title}
            data-step
            className="relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-9 text-center will-change-transform"
          >
            <img
              src={s.icon}
              alt=""
              aria-hidden
              className="mx-auto h-16 w-16 rounded-full ring-1 ring-[var(--color-border)]"
            />
            <h3
              className="mt-5 text-sm font-extrabold uppercase tracking-wide text-[var(--color-foreground)]"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              {s.title}
            </h3>
            <p
              className="mt-2 text-[11px] font-semibold uppercase leading-relaxed tracking-wide text-[var(--color-accent-ink)]"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              {s.body}
            </p>
            {i < STEPS.length - 1 && (
              <span
                data-step-arrow
                aria-hidden
                className="absolute -right-5 top-1/2 hidden -translate-y-1/2 text-4xl text-[var(--color-muted)] lg:block"
              >
                ›
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
