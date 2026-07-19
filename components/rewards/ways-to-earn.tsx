import {
  BONUS_DISCLAIMER,
  BONUS_REWARDS,
  WAYS_TO_EARN,
} from '@/lib/rewards-content'
import { Scrub, SplitHeading } from './motion'

// "More ways to earn" — letter-reveal headline; earn cards slide in from the
// left, bonus rows from the right (live-page parity, all scroll-scrubbed).

export default function WaysToEarn() {
  return (
    <section className="px-6 py-16 md:px-12 md:py-24 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <SplitHeading
          mode="letters"
          className="text-center text-3xl font-extrabold uppercase leading-[1.15] tracking-tight text-white md:text-4xl"
          lines={[
            { text: 'More Ways to Earn. More Reasons to Keep' },
            { text: 'Playing With Fire.', accent: true, block: true },
          ]}
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Scrub className="grid gap-5" end="bottom 90%">
            {WAYS_TO_EARN.map((w) => (
              <div
                key={w.title}
                data-reveal="left"
                className="rounded-2xl border border-[var(--color-accent)]/70 bg-[#131313] p-6 md:p-7"
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white">
                    <img src={w.icon} alt="" aria-hidden className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold uppercase tracking-wide text-white">
                      {w.title}
                    </h3>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-accent)]">
                      {w.points}
                    </p>
                  </div>
                </div>
                {'badge' in w && w.badge && (
                  <span className="mt-4 inline-block rounded-md bg-gradient-to-r from-[#8a6b00] via-[var(--color-accent)] to-[#8a6b00] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-black">
                    {w.badge}
                  </span>
                )}
                <ul className="mt-4 space-y-1.5 text-xs font-semibold uppercase leading-relaxed tracking-wide text-white/90">
                  {w.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span aria-hidden className="text-[var(--color-accent)]">•</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Scrub>

          <Scrub end="bottom 90%">
            <div
              className="h-full rounded-[2rem] bg-[#161616] p-7 md:p-10"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              <h3
                data-reveal="fade"
                className="text-center text-2xl font-extrabold uppercase tracking-tight text-[var(--color-accent)] md:text-3xl"
              >
                Bonus Rewards
              </h3>
              <ul className="mt-6 divide-y divide-white/15">
                {BONUS_REWARDS.map((b) => (
                  <li
                    key={b}
                    data-reveal="right"
                    className="flex items-center justify-between gap-6 py-4"
                  >
                    <span className="text-xl font-extrabold uppercase tracking-tight text-white md:text-2xl">
                      +50pts
                    </span>
                    <span className="text-right text-sm font-bold uppercase tracking-wide text-[var(--color-accent)]">
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
              <p
                data-reveal="right"
                className="mt-6 text-center text-[11px] font-semibold uppercase leading-relaxed tracking-wide text-white/80"
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
