import { VALUE_PROPS } from '@/lib/rewards-content'
import { Scrub, SplitHeading } from './motion'
import { BonusIcon, ClimbIcon, EarnIcon, UnlockIcon } from './animated-icons'

// "Every dollar you spend" — icons carry real internal motion (coin drops,
// lock pops, bars climb, lid lifts). Theme-aware surface cards.

const ICONS = {
  'Earn Points': EarnIcon,
  'Unlock Rewards': UnlockIcon,
  'Climb Tiers': ClimbIcon,
  'Bonus Points': BonusIcon,
} as const

export default function ValueProps() {
  return (
    <section className="px-6 py-16 md:px-12 md:py-24 lg:px-20">
      <div className="mx-auto max-w-5xl">
        <SplitHeading
          mode="words"
          className="text-center text-3xl font-extrabold uppercase leading-[1.1] tracking-tight text-[var(--color-foreground)] md:text-4xl xl:text-5xl"
          lines={[
            { text: 'Every Dollar You Spend' },
            { text: 'Comes Back to You in Rewards.', accent: true, block: true },
          ]}
        />
        <Scrub className="mt-12 grid gap-5 sm:grid-cols-2">
          {VALUE_PROPS.map((p) => {
            const Icon = ICONS[p.title as keyof typeof ICONS] ?? EarnIcon
            return (
              <div
                key={p.title}
                data-reveal="up"
                className="group flex h-full items-start gap-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm transition-shadow duration-300 hover:shadow-[0_0_36px_rgba(254,207,14,0.18)] md:p-7"
              >
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)]/12">
                  <Icon className="h-11 w-11" />
                </span>
                <div style={{ fontFamily: 'var(--font-brand)' }}>
                  <h3 className="text-base font-extrabold uppercase tracking-wide text-[var(--color-foreground)]">
                    {p.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] font-semibold uppercase leading-snug tracking-wide text-[var(--color-accent-ink)]">
                    {p.body}
                  </p>
                </div>
              </div>
            )
          })}
        </Scrub>
      </div>
    </section>
  )
}
