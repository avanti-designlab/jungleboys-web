import { VALUE_PROPS } from '@/lib/rewards-content'
import { Scrub, SplitHeading } from './motion'

// "Every dollar you spend" — word-by-word headline, then the 4 perk cards
// rise in sequence, all scrubbed with scroll (live-page parity).

export default function ValueProps() {
  return (
    <section className="px-6 py-16 md:px-12 md:py-24 lg:px-20">
      <div className="mx-auto max-w-5xl">
        <SplitHeading
          mode="words"
          className="text-center text-3xl font-extrabold uppercase leading-[1.1] tracking-tight text-white md:text-4xl xl:text-5xl"
          lines={[
            { text: 'Every Dollar You Spend' },
            { text: 'Comes Back to You in Rewards.', accent: true, block: true },
          ]}
        />
        <Scrub className="mt-12 grid gap-5 sm:grid-cols-2">
          {VALUE_PROPS.map((p) => (
            <div
              key={p.title}
              data-reveal="up"
              className="flex h-full items-start gap-5 rounded-2xl bg-[#1c1c1c] p-6 md:p-7"
            >
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
          ))}
        </Scrub>
      </div>
    </section>
  )
}
