'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// WHAT'S THE DIFFERENCE — sideways. The section pins once and the three tiers
// travel HORIZONTALLY through the frame, so all three cost a single screen of
// scroll instead of three stacked blocks of dead space. Inside each panel the
// device counter-drifts against the track (it moves slower than the panel it
// sits in) which gives real depth to a flat slide.
//
// The heading and the tier rail stay locked in front the whole way, so you
// always know where you are in the ladder.

const TIERS = [
  {
    key: 'flavors', name: 'Flavors', device: 'device-flavors', accent: '#ff7a18',
    blurb: 'Cannabis oil, refined and dialled in.',
    specs: ['Ultra refined cannabis oil', 'Terpene forward', 'High potency THC', 'Exotic flavor profiles'],
  },
  {
    key: 'live-resin', name: 'Live Resin', device: 'device-resin', accent: '#fbcd03',
    blurb: 'Fresh frozen, nothing added back.',
    specs: ['Fresh frozen extract', 'Native terpenes only', 'Full spectrum', 'Strain authentic'],
  },
  {
    key: 'live-rosin', name: 'Live Rosin', device: 'device-rosin', accent: '#e11b0b',
    blurb: 'Solventless. Ice water hash only.',
    specs: ['100% solventless', 'Ice water hash', 'No additives', 'True-to-strain flavor', 'Native terpenes'],
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
        {
          reduce: '(prefers-reduced-motion: reduce)',
          mobile: '(prefers-reduced-motion: no-preference) and (max-width: 767px)',
          desk: '(prefers-reduced-motion: no-preference) and (min-width: 768px)',
        },
        (mmCtx) => {
          const c = mmCtx.conditions as Record<string, boolean>
          if (c.reduce) return

          const steps = TIERS.length - 1
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root, start: 'top top', end: c.mobile ? '+=140%' : '+=160%',
              pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
            },
          })

          // the track slides one panel at a time
          tl.to('[data-gtd-track]', { xPercent: -(100 / TIERS.length) * steps, ease: 'none', duration: 1 }, 0)
            // devices lag the track — parallax inside the slide
            .to('[data-gtd-dev]', { xPercent: 12, ease: 'none', duration: 1 }, 0)
            // giant ghost names run ahead of it
            .to('[data-gtd-ghost]', { xPercent: -16, ease: 'none', duration: 1 }, 0)
            // rail fill tracks progress
            .to('[data-gtd-fill]', { scaleX: 1, ease: 'none', duration: 1 }, 0)

          // each dot lights when its panel owns the frame
          TIERS.forEach((t, i) => {
            const mid = i / steps
            tl.to(`[data-gtd-dot="${i}"]`,
              { opacity: 1, ease: 'none', duration: 0.001 },
              Math.max(0, mid - 0.24))
            if (i < steps) {
              tl.to(`[data-gtd-dot="${i}"]`, { opacity: 0.3, ease: 'none', duration: 0.001 }, mid + 0.26)
            }
          })
        }
      )
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={rootRef}
      data-nav-theme="dark"
      className="relative z-10 h-screen min-h-[620px] overflow-hidden bg-[var(--gt-black)]"
    >
      {/* clean ground — the tiled hazard field lived here and fought the type.
          Depth now comes from the per-tier bloom inside each panel. */}
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(120% 90% at 50% 120%, rgba(255,122,24,0.16) 0%, rgba(10,9,8,0) 62%)' }} />

      {/* locked heading */}
      <div className="pointer-events-none absolute left-5 top-[13vh] z-20 md:left-12 md:top-[16vh]">
        <h2 className="font-display uppercase leading-[0.8] text-white" style={{ fontSize: 'min(9vw, 3.6rem)' }}>
          What&apos;s the <br /> <span className="text-[var(--gt-yellow)]">Difference?</span>
        </h2>
      </div>

      {/* the horizontal track */}
      <div data-gtd-track className="absolute inset-y-0 left-0 flex h-full will-change-transform" style={{ width: `${TIERS.length * 100}%` }}>
        {TIERS.map((t, i) => (
          <div key={t.key} className="relative flex h-full shrink-0 items-center justify-center px-6 md:px-16" style={{ width: `${100 / TIERS.length}%` }}>
            {/* ghost name, oversized, behind everything */}
            <span data-gtd-ghost aria-hidden
              className="font-display pointer-events-none absolute left-1/2 top-[64%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap uppercase leading-none text-white/[0.035] will-change-transform"
              style={{ fontSize: 'min(19vw, 12rem)' }}>
              {t.name}
            </span>

            <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[54vh] w-[54vh] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ background: `radial-gradient(circle, ${t.accent}44 0%, rgba(10,9,8,0) 66%)` }} />

            <div className="relative grid w-full max-w-[980px] grid-cols-[0.85fr_1.15fr] items-center gap-6 pt-[16vh] md:gap-14 md:pt-[12vh]">
              {/* eslint-disable-next-line @next/next/no-img-element -- tier device */}
              <img data-gtd-dev src={`/products/gas-tank/${t.device}.webp`} alt={`Gas Tank ${t.name}`}
                className="mx-auto h-[34vh] max-h-[380px] w-auto will-change-transform drop-shadow-[0_36px_60px_rgba(0,0,0,0.7)]" />

              <div>
                <span className="font-display block leading-none" style={{ fontSize: 'min(5vw, 1.6rem)', color: t.accent }}>
                  0{i + 1}
                </span>
                <h3 className="font-display uppercase leading-[0.85] text-white" style={{ fontSize: 'min(11vw, 4.4rem)' }}>
                  {t.name}
                </h3>
                <p className="mt-2 text-[11px] font-extrabold uppercase tracking-[0.16em] md:text-sm" style={{ fontFamily: 'var(--font-brand)', color: t.accent }}>
                  {t.blurb}
                </p>
                <ul className="mt-5 space-y-2">
                  {t.specs.map((s) => (
                    <li key={s} className="flex items-start gap-2.5 text-[10px] font-bold uppercase tracking-wide text-white/85 md:text-[13px]"
                      style={{ fontFamily: 'var(--font-brand)' }}>
                      <span aria-hidden className="mt-[2px] grid h-4 w-4 shrink-0 place-items-center rounded-full text-[10px] font-black text-[var(--gt-black)]" style={{ background: t.accent }}>✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* tier rail — where you are in the ladder */}
      <div className="pointer-events-none absolute inset-x-5 bottom-[6vh] z-20 md:inset-x-12">
        <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-white/12">
          <span data-gtd-fill className="absolute inset-0 origin-left scale-x-0 rounded-full bg-[var(--gt-yellow)] will-change-transform" />
        </div>
        <div className="mt-3 flex justify-between">
          {TIERS.map((t, i) => (
            <span key={t.key} data-gtd-dot={i}
              className="text-[9px] font-extrabold uppercase tracking-[0.24em] text-white md:text-[11px]"
              style={{ fontFamily: 'var(--font-brand)', opacity: i === 0 ? 1 : 0.3 }}>
              {t.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
