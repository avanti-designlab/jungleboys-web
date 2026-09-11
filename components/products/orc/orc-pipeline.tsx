'use client'

import { useEffect, useRef } from 'react'

// From plant to product v3 (Avanti: "it should scroll through the steps
// before going down to the rest of the page"). The section PINS (CSS sticky
// — the mobile-safe pin) while vertical scroll drives the station rail
// horizontally through all eight steps, then releases. The pipe under the
// rail fills gold with progress. rAF + transform only; reduced-motion still
// works because the translation is tied to scroll position, not a clock.
//
// Station art: public/products/orc/step-<n>.webp — the Higgsfield set
// (generated 2026-09-11, series-styled black/yellow refinery scenes).
const STEPS: { n: string; title: string; blurb: string }[] = [
  { n: '01', title: 'Pheno Hunting', blurb: 'Thousands of seedlings. A handful of keepers.' },
  { n: '02', title: 'Elite Genetics', blurb: 'Only award-winning cultivars make the cut.' },
  { n: '03', title: 'Cultivation', blurb: 'Grown indoors to Jungle Boys spec.' },
  { n: '04', title: 'Peak Harvest', blurb: 'Cut at full maturity — never early, never late.' },
  { n: '05', title: 'Fresh Frozen', blurb: 'Frozen within hours. Terpenes locked in.' },
  { n: '06', title: 'Precision Extraction', blurb: 'The lab lets the genetics do the talking.' },
  { n: '07', title: 'Post Processing', blurb: 'Whipped, cured and finished by hand.' },
  { n: '08', title: 'ORC Concentrates', blurb: 'Flavor first. Every jar, every batch.' },
]

export default function OrcPipeline() {
  const outerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const pipeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const outer = outerRef.current
    const track = trackRef.current
    const pipe = pipeRef.current
    if (!outer || !track || !pipe) return
    let raf = 0
    const tick = () => {
      raf = 0
      const rect = outer.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, total)))
      // the track is w-max: it never overflows ITSELF — the clipped viewport
      // is its parent, so the travel distance measures against that
      const shift = Math.max(0, track.scrollWidth - (track.parentElement?.clientWidth ?? window.innerWidth))
      track.style.transform = `translate3d(${(-p * shift).toFixed(1)}px,0,0)`
      pipe.style.width = `${(p * 100).toFixed(2)}%`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    tick()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <section ref={outerRef} className="relative h-[340vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="px-6 text-center">
          <h2 className="font-display uppercase leading-[0.86]" style={{ fontSize: 'min(11vw, 5.5rem)' }}>
            From plant <span className="orc-molten">to product</span>
          </h2>
          <p
            className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/60"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Eight stations. One obsession: protecting the terpenes from garden to jar.
          </p>
        </div>

        <div className="mt-10 overflow-hidden">
          <div ref={trackRef} className="flex w-max gap-6 pl-[max(1.5rem,calc((100vw-1240px)/2))] pr-[45vw] will-change-transform">
            {STEPS.map((s, i) => (
              <article key={s.n} className="w-[min(78vw,400px)] shrink-0">
                <div className="flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-[var(--orc-card)] ring-1 ring-[var(--orc-yellow)]/20">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element -- station art */}
                    <img
                      src={`/products/orc/step-${i + 1}.webp`}
                      alt={s.title}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <span
                      className="font-display absolute left-4 top-2 text-[4.5rem] leading-none text-[var(--orc-yellow)] [text-shadow:0_4px_18px_rgba(0,0,0,0.8)]"
                      aria-hidden
                    >
                      {s.n}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5 px-6 pb-6 pt-4">
                    <h3 className="font-display text-3xl uppercase leading-none text-[var(--orc-yellow)]">
                      {s.title}
                    </h3>
                    <p className="text-[13px] font-bold text-white/65" style={{ fontFamily: 'var(--font-brand)' }}>
                      {s.blurb}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* the pipe fills gold as the rail travels */}
        <div className="mx-6 mt-8 h-3 rounded-full bg-white/10 md:mx-[max(2rem,calc((100vw-1240px)/2))]">
          <div ref={pipeRef} className="orc-pipe-flow h-full rounded-full" style={{ width: '0%' }} />
        </div>
      </div>
    </section>
  )
}
