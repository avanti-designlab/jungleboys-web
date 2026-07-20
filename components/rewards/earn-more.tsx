import {
  EARN_RULES_DISCLAIMER,
  REDEMPTION_VALUES,
  REWARD_TIERS,
} from '@/lib/rewards-content'
import { Scrub, SplitHeading } from './motion'

// "Earn more. Redeem bigger." — two distinct, modern program cards:
// Reward Tiers as a colored ladder, Redemption Values as big value tiles.
// (Photo collage removed per Avanti; heading no longer pins.)

const TIER_COLORS: Record<string, string> = {
  Trimmer: '#37d16b',
  Grower: '#c9c9d1',
  'Pheno Hunter': '#fecf0e',
  'Connoisseur Club': '#c8102e',
}

export default function EarnMore() {
  return (
    <section className="px-6 py-16 md:px-12 md:py-24 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <SplitHeading
          mode="letters"
          className="text-center text-3xl font-extrabold uppercase leading-[1.1] tracking-tight text-[var(--color-foreground)] md:text-4xl xl:text-5xl"
          lines={[
            { text: 'Earn More.' },
            { text: 'Redeem Bigger.', accent: true, block: true },
          ]}
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {/* Reward Tiers — ladder with colored nodes */}
          <Scrub className="h-full">
            <div
              className="h-full rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-7 md:p-10"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              <h3
                data-reveal="rise"
                className="text-center text-2xl font-extrabold uppercase tracking-tight text-[var(--color-foreground)] md:text-3xl"
              >
                Reward Tiers
              </h3>
              <div
                data-reveal="fade"
                className="mt-6 flex items-end justify-between px-4 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-muted)]"
              >
                <span>Tier level</span>
                <span>Annual points</span>
              </div>
              <ul className="mt-3 space-y-3">
                {REWARD_TIERS.map((t, i) => (
                  <li
                    key={t.name}
                    data-reveal="up"
                    className="flex items-center justify-between gap-4 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] py-3 pl-4 pr-6"
                  >
                    <span className="flex items-center gap-4 text-sm font-extrabold uppercase tracking-wide text-[var(--color-foreground)]">
                      <span
                        aria-hidden
                        className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold text-black"
                        style={{ backgroundColor: TIER_COLORS[t.name] ?? '#fecf0e' }}
                      >
                        {i + 1}
                      </span>
                      {t.name}
                    </span>
                    <span className="text-right text-sm font-extrabold uppercase tracking-wide text-[var(--color-accent-ink)]">
                      {t.points}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Scrub>

          {/* Redemption Values — big value tiles */}
          <Scrub className="h-full">
            <div
              className="h-full rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-7 md:p-10"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              <h3
                data-reveal="rise"
                className="text-center text-2xl font-extrabold uppercase tracking-tight text-[var(--color-foreground)] md:text-3xl"
              >
                Redemption Values
              </h3>
              <p
                data-reveal="fade"
                className="mt-6 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-muted)]"
              >
                What you get with your points
              </p>
              <div className="mt-3 grid grid-cols-2 gap-4">
                {REDEMPTION_VALUES.map((r) => (
                  <div
                    key={r.points}
                    data-reveal="up"
                    className="flex flex-col items-center justify-center rounded-2xl border border-[var(--color-accent)]/50 bg-[var(--color-accent)]/8 px-4 py-7 text-center transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(254,207,14,0.2)]"
                  >
                    <span className="text-3xl font-extrabold tracking-tight text-[var(--color-foreground)] md:text-4xl">
                      {r.value}
                    </span>
                    <span className="mt-2 rounded-full bg-[var(--color-foreground)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-background)]">
                      {r.points}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Scrub>
        </div>

        <Scrub start="top 95%">
          <p
            data-reveal="rise"
            className="mt-10 text-center text-[11px] font-semibold uppercase leading-relaxed tracking-wide text-[var(--color-muted)] lg:whitespace-nowrap"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            {EARN_RULES_DISCLAIMER}
          </p>
        </Scrub>
      </div>
    </section>
  )
}
