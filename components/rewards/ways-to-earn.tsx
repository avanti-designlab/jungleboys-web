import Reveal from '@/components/reveal'
import {
  BONUS_DISCLAIMER,
  BONUS_REWARDS,
  WAYS_TO_EARN,
} from '@/lib/rewards-content'

// "More ways to earn" — outlined earn cards left, bonus-rewards list right.

export default function WaysToEarn() {
  return (
    <section className="px-6 py-16 md:px-12 md:py-24 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2
            className="text-center text-3xl font-extrabold uppercase leading-[1.15] tracking-tight text-white md:text-4xl"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            More Ways to Earn. More Reasons to Keep{' '}
            <span className="text-[var(--color-accent)]">Playing With Fire.</span>
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="grid gap-5" style={{ fontFamily: 'var(--font-brand)' }}>
            {WAYS_TO_EARN.map((w, i) => (
              <Reveal key={w.title} delay={i * 0.08}>
                <div className="rounded-2xl border border-[var(--color-accent)]/70 bg-[#131313] p-6 md:p-7">
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
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <div
              className="h-full rounded-[2rem] bg-[#161616] p-7 md:p-10"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              <h3 className="text-center text-2xl font-extrabold uppercase tracking-tight text-[var(--color-accent)] md:text-3xl">
                Bonus Rewards
              </h3>
              <ul className="mt-6 divide-y divide-white/15">
                {BONUS_REWARDS.map((b) => (
                  <li key={b} className="flex items-center justify-between gap-6 py-4">
                    <span className="text-xl font-extrabold uppercase tracking-tight text-white md:text-2xl">
                      +50pts
                    </span>
                    <span className="text-right text-sm font-bold uppercase tracking-wide text-[var(--color-accent)]">
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-center text-[11px] font-semibold uppercase leading-relaxed tracking-wide text-white/80">
                {BONUS_DISCLAIMER}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
