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
// The three tiers are compared on the SAME FOUR AXES in the same order, each
// with its own icon — source, terpenes, spectrum, flavour. Three unrelated
// bullet lists don't answer "what's the difference"; a matrix does, and it also
// gives the icons a consistent job instead of decorating whatever text is next
// to them.
//
// The heading and the tier rail stay locked in front the whole way, so you
// always know where you are in the ladder.

const AXES = [
  { icon: 'extracts', label: 'Source' },
  { icon: 'vapor', label: 'Terpenes' },
  { icon: 'lasts', label: 'Spectrum' },
  { icon: 'taste', label: 'Flavor' },
] as const

const TIERS = [
  {
    key: 'flavors', name: 'Flavors', device: 'device-flavors-n', accent: '#ff7a18',
    blurb: 'Cannabis oil, refined and dialled in.',
    values: ['Ultra refined cannabis oil', 'Terpene forward', 'High potency THC', 'Exotic flavor profiles'],
  },
  {
    key: 'live-resin', name: 'Live Resin', device: 'device-resin-n', accent: '#fbcd03',
    blurb: 'Fresh frozen. Nothing added back.',
    values: ['Fresh frozen extract', 'Native terpenes only', 'Full spectrum', 'Strain authentic'],
  },
  {
    key: 'live-rosin', name: 'Live Rosin', device: 'device-rosin-n', accent: '#5ec8f5',
    blurb: '100% solventless. Ice water hash only.',
    values: ['Ice water hash', 'Native terpenes', 'Full spectrum', 'True-to-strain'],
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
              trigger: root, start: 'top top', end: c.mobile ? '+=175%' : '+=200%',
              pin: true, scrub: 0.85, anticipatePin: 1, invalidateOnRefresh: true,
            },
          })

          // The track eases between tiers and settles on each one. Hard stops
          // with linear travel between them read as stop-start, so the moves are
          // longer than the holds and carry a soft in/out.
          // Holds: 0-.16, .38-.58, .80-1.
          const stops = TIERS.map((_, i) => -(100 / TIERS.length) * i)
          const legs = (v: (i: number) => number) => ({
            keyframes: [
              { xPercent: v(0), duration: 0.16, ease: 'none' },
              { xPercent: v(1), duration: 0.22, ease: 'power1.inOut' },
              { xPercent: v(1), duration: 0.2, ease: 'none' },
              { xPercent: v(2), duration: 0.22, ease: 'power1.inOut' },
              { xPercent: v(2), duration: 0.2, ease: 'none' },
            ],
          })

          tl.to('[data-gtd-track]', legs((i) => stops[i]), 0)
            // devices lag the track — parallax inside the slide
            .to('[data-gtd-dev]', legs((i) => i * 6), 0)
            // giant ghost names run ahead of it
            .to('[data-gtd-ghost]', legs((i) => i * -8), 0)
            // rail fill steps with the track
            .to('[data-gtd-fill]', {
              keyframes: [
                { scaleX: 0.02, duration: 0.16, ease: 'none' },
                { scaleX: 0.5, duration: 0.22, ease: 'power1.inOut' },
                { scaleX: 0.5, duration: 0.2, ease: 'none' },
                { scaleX: 1, duration: 0.22, ease: 'power1.inOut' },
                { scaleX: 1, duration: 0.2, ease: 'none' },
              ],
            }, 0)

          // each dot lights while its tier owns the frame
          const holds: [number, number][] = [[0, 0.27], [0.27, 0.69], [0.69, 1]]
          TIERS.forEach((t, i) => {
            const [from, to] = holds[i]
            if (i > 0) tl.to(`[data-gtd-dot="${i}"]`, { opacity: 1, duration: 0.001 }, from)
            if (i < steps) tl.to(`[data-gtd-dot="${i}"]`, { opacity: 0.3, duration: 0.001 }, to)
          })

          // Rows tick in for every tier, timed to FINISH inside that tier's own
          // dwell — so you always see them arrive, and never watch them animate
          // while the panel is already sliding off.
          const rowsIn = [0, 0.34, 0.7]
          TIERS.forEach((t, i) => {
            tl.fromTo(`[data-row="${t.key}"]`,
              { x: 34, opacity: 0 },
              { x: 0, opacity: 1, ease: 'power2.out', duration: 0.05, stagger: 0.025 },
              rowsIn[i])
          })
        }
      )
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative z-10 px-2 py-2 md:px-3 md:py-3">
      <div
        data-nav-theme="dark"
        className="relative h-[92vh] min-h-[640px] overflow-hidden rounded-[1.75rem] bg-[var(--gt-black)] md:rounded-[2.5rem]"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(120% 90% at 50% 120%, rgba(255,122,24,0.16) 0%, rgba(10,9,8,0) 62%)' }} />

        {/* locked heading */}
        <div className="pointer-events-none absolute inset-x-0 top-[12%] z-20 px-4 text-center md:top-[7%]">
          <h2 className="font-display whitespace-nowrap uppercase leading-[0.82] text-white"
            style={{ fontSize: 'min(9.5vw, 5.4rem)', letterSpacing: '-0.03em' }}>
            What&apos;s the <span className="text-[var(--gt-yellow)]">Difference?</span>
          </h2>
        </div>

        {/* the horizontal track */}
        <div data-gtd-track className="absolute inset-y-0 left-0 flex h-full will-change-transform" style={{ width: `${TIERS.length * 100}%` }}>
          {TIERS.map((t, i) => (
            <div key={t.key} className="relative flex h-full shrink-0 items-center justify-center px-5 md:px-16" style={{ width: `${100 / TIERS.length}%` }}>
              {/* ghost name, oversized, behind everything */}
              {/* Tinted with the tier's own accent rather than white. White at a
                  few percent reads fine over the warm orange/yellow blooms but
                  vanishes over Live Rosin's cool blue one — same alpha, far
                  less perceived luminance. Accent-tinting evens all three out
                  and ties each ghost to its panel. */}
              <span data-gtd-ghost aria-hidden
                className="font-display pointer-events-none absolute left-1/2 top-[64%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap uppercase leading-none will-change-transform"
                style={{ fontSize: 'min(26vw, 17rem)', color: t.accent, opacity: 0.13 }}>
                {t.name}
              </span>

              <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[58vh] w-[58vh] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ background: `radial-gradient(circle, ${t.accent}3d 0%, rgba(10,9,8,0) 66%)` }} />

              <div className="absolute inset-x-4 top-[24%] bottom-[23%] md:inset-x-16 md:top-[21%] md:bottom-[26%]">
                <div className="mx-auto grid h-full w-full max-w-[1040px] grid-cols-[0.62fr_1.38fr] items-center gap-3 md:grid-cols-[0.82fr_1.18fr] md:gap-12">
                {/* eslint-disable-next-line @next/next/no-img-element -- tier device */}
                <img data-gtd-dev src={`/products/gas-tank/${t.device}.webp`} alt={`Gas Tank ${t.name}`}
                  className="mx-auto max-h-full w-auto will-change-transform drop-shadow-[0_36px_60px_rgba(0,0,0,0.7)]" />

                <div>
                  <span className="font-display block leading-none" style={{ fontSize: 'min(5vw, 1.7rem)', color: t.accent }}>
                    0{i + 1}
                  </span>
                  <h3 className="font-display uppercase leading-[0.84] text-white" style={{ fontSize: 'min(10.5vw, 4.2rem)', letterSpacing: '-0.03em' }}>
                    {t.name}
                  </h3>
                  <p className="mt-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] md:text-sm" style={{ fontFamily: 'var(--font-brand)', color: t.accent }}>
                    {t.blurb}
                  </p>

                  {/* the four axes, same order every tier */}
                  <ul className="mt-3 space-y-1.5 md:mt-4 md:space-y-2">
                    {AXES.map((a, ai) => (
                      <li key={a.label} data-row={t.key}
                        className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.045] px-2.5 py-1.5 will-change-transform md:gap-3.5 md:px-4 md:py-2">
                        <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-full md:h-9 md:w-9"
                          style={{ background: `${t.accent}26`, border: `1.5px solid ${t.accent}` }}>
                          {/* eslint-disable-next-line @next/next/no-img-element -- axis icon */}
                          <img src={`/products/gas-tank/icons/${a.icon}.svg`} alt="" className="h-4 w-4 object-contain md:h-[17px] md:w-[17px]" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[8px] font-extrabold uppercase tracking-[0.26em] md:text-[10px]"
                            style={{ fontFamily: 'var(--font-brand)', color: t.accent }}>
                            {a.label}
                          </span>
                          <span className="block text-[11px] font-bold uppercase leading-tight tracking-wide text-white md:text-[15px]"
                            style={{ fontFamily: 'var(--font-brand)' }}>
                            {t.values[ai]}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* tier rail — where you are in the ladder */}
        <div className="pointer-events-none absolute inset-x-5 bottom-[4%] z-20 md:inset-x-12">
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
      </div>
    </section>
  )
}
