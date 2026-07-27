'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// WHAT'S THE DIFFERENCE. Three tiers, each with its own device and spec list,
// separated by VS. Each tier lights up as it reaches the middle of the screen —
// its device warms out of the dark and the checks tick on one by one — so the
// section reads as a ladder you climb rather than three static blocks.

const TIERS = [
  {
    key: 'flavors', name: 'Flavors', device: 'device-flavors', glow: 'rgba(255,255,255,0.35)',
    specs: ['Ultra refined cannabis oil', 'Terpenes', 'High potency THC', 'Exotic flavor profiles'],
  },
  {
    key: 'live-resin', name: 'Live Resin', device: 'device-resin', glow: 'rgba(120,160,255,0.4)',
    specs: ['Fresh frozen extract', 'Native terpenes only', 'Full spectrum', 'Strain authentic'],
  },
  {
    key: 'live-rosin', name: 'Live Rosin', device: 'device-rosin', glow: 'rgba(251,205,3,0.45)',
    specs: ['Full spectrum', 'No additives', 'True-to-strain flavor', 'Fresh frozen extract', 'Ice water hash', '100% solventless', 'Native terpenes'],
  },
]

export default function GtDifference() {
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
          TIERS.forEach((t) => {
            const row = root.querySelector<HTMLElement>(`[data-tier="${t.key}"]`)
            if (!row) return
            gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 78%', once: true } })
              .from(row.querySelector('[data-tier-dev]'), { opacity: 0, x: -50, scale: 0.86, filter: 'blur(8px)', duration: 0.7, ease: 'power3.out' }, 0)
              .from(row.querySelector('[data-tier-name]'), { opacity: 0, y: 22, duration: 0.45, ease: 'power2.out' }, 0.15)
              .from(row.querySelectorAll('[data-tier-spec]'), { opacity: 0, x: 26, duration: 0.35, stagger: 0.07, ease: 'power2.out' }, 0.3)
              .from(row.querySelector('[data-tier-glow]'), { opacity: 0, scale: 0.5, duration: 0.8, ease: 'power2.out' }, 0)
          })
        }
      )
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative z-10 bg-[var(--gt-black)] px-6 py-16 md:py-24">
      <h2 className="font-display text-center uppercase leading-[0.85] text-white" style={{ fontSize: 'min(13vw, 6.5rem)' }}>
        What&apos;s the <br /> <span className="text-[var(--gt-yellow)]">Difference?</span>
      </h2>

      <div className="mx-auto mt-12 w-full max-w-[900px] md:mt-16">
        {TIERS.map((t, i) => (
          <div key={t.key}>
            <div data-tier={t.key} className="relative grid grid-cols-[0.8fr_1.2fr] items-center gap-5 py-8 md:gap-10 md:py-12">
              <div data-tier-glow aria-hidden className="pointer-events-none absolute left-[8%] top-1/2 h-[300px] w-[300px] -translate-y-1/2 rounded-full"
                style={{ background: `radial-gradient(circle, ${t.glow} 0%, rgba(10,9,8,0) 68%)` }} />
              {/* eslint-disable-next-line @next/next/no-img-element -- tier device */}
              <img data-tier-dev src={`/products/gas-tank/${t.device}.webp`} alt={`Gas Tank ${t.name}`}
                className="relative mx-auto h-[30vh] max-h-[300px] w-auto will-change-transform drop-shadow-[0_30px_50px_rgba(0,0,0,0.55)]" />
              <div className="relative">
                <h3 data-tier-name className="font-display uppercase leading-none text-white" style={{ fontSize: 'min(8vw, 3rem)' }}>
                  {t.name}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {t.specs.map((s) => (
                    <li key={s} data-tier-spec className="flex items-start gap-2.5 text-[11px] font-bold uppercase tracking-wide text-white/85 md:text-sm"
                      style={{ fontFamily: 'var(--font-brand)' }}>
                      <span aria-hidden className="mt-[2px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--gt-yellow)] text-[10px] font-black text-[var(--gt-black)]">✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {i < TIERS.length - 1 && (
              <div aria-hidden className="flex items-center gap-4 py-2">
                <span className="h-px flex-1 bg-white/15" />
                <span className="font-display text-2xl uppercase text-white/70 md:text-3xl">VS</span>
                <span className="h-px flex-1 bg-white/15" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
