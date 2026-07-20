import {
  BONUS_DISCLAIMER,
  BONUS_REWARDS,
  WAYS_TO_EARN,
} from '@/lib/rewards-content'
import PointsPill from './points-pill'
import { Scrub, SplitHeading } from './motion'
import { BirthdayIcon, FirstTimeIcon, ReferIcon } from './animated-icons'

const WAY_ICONS = {
  'Refer a Friend': ReferIcon,
  'Birthday Perks': BirthdayIcon,
  'First-Time Customer': FirstTimeIcon,
} as const

// "More ways to earn" (2 lines) — earn cards slide from the left; bonus rows
// slide from the right with counting +50PTS pills. Theme-aware surfaces.

export default function WaysToEarn() {
  return (
    <section className="px-6 py-16 md:px-12 md:py-24 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <SplitHeading
          mode="letters"
          className="text-center text-3xl font-extrabold uppercase leading-[1.15] tracking-tight text-[var(--color-foreground)] md:text-4xl"
          lines={[
            { text: 'More Ways to Earn.', block: true },
            { text: 'More Reasons to Keep ' },
            { text: 'Playing With Fire.', accent: true },
          ]}
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Scrub className="grid gap-5" end="bottom 90%">
            {WAYS_TO_EARN.map((w) => {
              const Icon = WAY_ICONS[w.title as keyof typeof WAY_ICONS] ?? ReferIcon
              return (
              <div
                key={w.title}
                data-reveal="left"
                className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-shadow duration-300 hover:shadow-[0_0_36px_rgba(254,207,14,0.16)] md:p-8"
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]">
                    <Icon className="h-7 w-7" />
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold uppercase tracking-wide text-[var(--color-foreground)] md:text-lg">
                      {w.title}
                    </h3>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-accent-ink)]">
                      {w.points}
                    </p>
                  </div>
                </div>
                {'badge' in w && w.badge && (
                  <span className="ml-[4.25rem] mt-4 inline-block rounded-full bg-gradient-to-r from-[#8a6b00] via-[var(--color-accent)] to-[#8a6b00] px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-black">
                    {w.badge}
                  </span>
                )}
                <ul className="mt-5 flex flex-wrap gap-2">
                  {w.bullets.map((b) => (
                    <li
                      key={b}
                      className="rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-foreground)]"
                    >
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              )
            })}
          </Scrub>

          <Scrub end="bottom 90%">
            <div
              className="h-full rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-7 md:p-10"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              <h3
                data-reveal="fade"
                className="text-center text-2xl font-extrabold uppercase tracking-tight text-[var(--color-accent-ink)] md:text-3xl"
              >
                Bonus Rewards
              </h3>
              <ul className="mt-8 space-y-3">
                {BONUS_REWARDS.map((b) => (
                  <li
                    key={b}
                    data-reveal="right"
                    className="flex items-center justify-between gap-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-5 py-3.5"
                  >
                    <PointsPill value={50} />
                    <span className="text-right text-sm font-bold uppercase tracking-wide text-[var(--color-foreground)]">
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
              <p
                data-reveal="right"
                className="mt-6 text-center text-[11px] font-semibold uppercase leading-relaxed tracking-wide text-[var(--color-muted)]"
              >
                {BONUS_DISCLAIMER}
              </p>
            </div>
          </Scrub>
        </div>
      </div>
    </section>
  )
}
