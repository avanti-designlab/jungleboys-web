import Image from 'next/image'
import Reveal from '@/components/reveal'
import {
  EARN_RULES_DISCLAIMER,
  REDEMPTION_VALUES,
  REWARD_TIERS,
} from '@/lib/rewards-content'
import { TwoTone } from './two-tone'

// Photo collage + the two program tables (real HTML, not images — this is the
// content search engines and AI answers should read).

function CoinDot() {
  return (
    <span
      aria-hidden
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#000" strokeWidth="2">
        <circle cx="12" cy="12" r="7.5" />
        <path d="M12 8.5v7M9.8 10.3c.5-.9 3.9-1.3 3.9.6 0 1.9-3.4 1.2-3.4 3.2 0 1.7 3.1 1.6 3.8.6" strokeWidth="1.6" />
      </svg>
    </span>
  )
}

export default function EarnMore() {
  return (
    <section className="px-6 py-16 md:px-12 md:py-24 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="rounded-[2rem] bg-[#131313] px-4 pt-4 md:px-10 md:pt-10">
            <Image
              src="/rewards/collage.png"
              alt="Jungle Boys apparel and flower with reward coins"
              width={1114}
              height={811}
              sizes="(max-width: 1024px) 92vw, 1000px"
              className="mx-auto w-full max-w-4xl"
            />
            <div className="pb-10 pt-6 md:pb-14">
              <TwoTone white="Earn More." yellow="Redeem Bigger." />
            </div>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-[2rem] bg-[#161616] p-7 md:p-10" style={{ fontFamily: 'var(--font-brand)' }}>
              <h3 className="text-center text-2xl font-extrabold uppercase tracking-tight text-white md:text-3xl">
                Reward Tiers
              </h3>
              <div className="mt-6 flex justify-between text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent)]">
                <span>Tier Level</span>
                <span>Annual Points</span>
              </div>
              <ul className="mt-2 divide-y divide-white/10">
                {REWARD_TIERS.map((t) => (
                  <li key={t.name} className="flex items-center justify-between gap-4 py-4">
                    <span className="flex items-center gap-4 text-sm font-extrabold uppercase tracking-wide text-white">
                      <CoinDot />
                      {t.name}
                    </span>
                    <span className="text-right text-sm font-extrabold uppercase tracking-wide text-white">
                      {t.points}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="h-full rounded-[2rem] bg-[#161616] p-7 md:p-10" style={{ fontFamily: 'var(--font-brand)' }}>
              <h3 className="text-center text-2xl font-extrabold uppercase tracking-tight text-white md:text-3xl">
                Redemption Values
              </h3>
              <ul className="mt-8 divide-y divide-white/10">
                {REDEMPTION_VALUES.map((r) => (
                  <li key={r.points} className="flex items-center justify-between gap-4 py-4">
                    <span className="flex items-center gap-4 text-sm font-extrabold uppercase tracking-wide text-white">
                      <CoinDot />
                      {r.points}
                    </span>
                    <span className="text-2xl font-extrabold uppercase tracking-tight text-white md:text-3xl">
                      {r.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <p
            className="mx-auto mt-10 max-w-2xl text-center text-[11px] font-semibold uppercase leading-relaxed tracking-wide text-white/80"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            {EARN_RULES_DISCLAIMER}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
