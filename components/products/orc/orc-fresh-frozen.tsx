import Reveal from '@/components/reveal'

// Why fresh frozen — the technical heart of the page, anchored by the gold
// EST-2014 derrick badge floating over a molten glow.
export default function OrcFreshFrozen() {
  return (
    <section className="relative overflow-hidden bg-[var(--orc-panel)] px-6 py-24 md:px-12 md:py-32 lg:px-20">
      <div className="mx-auto grid max-w-[1240px] items-center gap-14 lg:grid-cols-2">
        <div>
          <Reveal>
            <h2 className="font-display uppercase leading-[0.86]" style={{ fontSize: 'min(12vw, 5rem)' }}>
              Why <span className="text-[var(--orc-yellow)]">fresh frozen?</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p
              className="mt-7 max-w-xl text-sm leading-relaxed text-white/70 md:text-base"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              Fresh frozen flower is harvested at peak maturity and frozen immediately after
              harvest. This locks in the volatile terpenes and cannabinoids that traditional
              drying and curing burn away.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <p
              className="mt-5 max-w-xl text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--orc-gold)]"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              The result: louder aromas, richer flavor, and concentrates that stay true to the
              original flower.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.12} className="relative mx-auto">
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(245,163,0,0.28),transparent_72%)]"
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- EST 2014 badge */}
          <img
            src="/products/orc/badge.webp"
            alt="Oil Refinery Co. — established 2014"
            loading="lazy"
            className="orc-float relative w-[min(60vw,380px)]"
          />
        </Reveal>
      </div>
    </section>
  )
}
