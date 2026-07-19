import Reveal from '@/components/reveal'
import { VALUE_PROPS } from '@/lib/rewards-content'
import { TwoTone } from './two-tone'

// "Every dollar you spend comes back to you" — 2×2 grid of perk cards.

export default function ValueProps() {
  return (
    <section className="px-6 py-16 md:px-12 md:py-24 lg:px-20">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <TwoTone
            as="h2"
            white="Every Dollar You Spend"
            yellow="Comes Back to You in Rewards."
          />
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {VALUE_PROPS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <div className="flex h-full items-start gap-5 rounded-2xl bg-[#1c1c1c] p-6 md:p-7">
                <img src={p.icon} alt="" aria-hidden className="h-12 w-12 shrink-0" />
                <div style={{ fontFamily: 'var(--font-brand)' }}>
                  <h3 className="text-base font-extrabold uppercase tracking-wide text-white">
                    {p.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] font-semibold uppercase leading-snug tracking-wide text-[var(--color-accent)]">
                    {p.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
