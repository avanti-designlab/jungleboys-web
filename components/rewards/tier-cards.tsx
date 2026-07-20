import Image from 'next/image'
import { EARN_RULES_DISCLAIMER, TIER_CARDS } from '@/lib/rewards-content'
import { Scrub, SplitHeading } from './motion'

// "Earn your place in the jungle" — tier cards with even, equal-height mascot
// stages, pill perks, and a rotating illumination ring on Pheno Hunter.
// Cards keep their brand gradients in both themes.

const themes = {
  green: {
    card: 'bg-gradient-to-b from-[#1e8a43] via-[#0d4423] to-[#041b0d]',
    name: 'text-[#37d16b]',
    pill: 'bg-black/30 text-white',
  },
  silver: {
    card: 'bg-gradient-to-b from-[#a9a9ad] via-[#4c4c50] to-[#131315]',
    name: 'text-[#e4e4e8]',
    pill: 'bg-black/30 text-white',
  },
  gold: {
    card: 'bg-gradient-to-b from-[#f0c419] via-[#96700a] to-[#241b02]',
    name: 'text-[#ffe98a]',
    pill: 'bg-black/35 text-white',
  },
} as const

export default function TierCards() {
  return (
    <section className="px-6 py-16 md:px-12 md:py-24 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <SplitHeading
          mode="letters"
          className="text-center text-3xl font-extrabold uppercase leading-[1.1] tracking-tight text-[var(--color-foreground)] md:text-4xl xl:text-5xl"
          lines={[
            { text: 'Earn Your Place' },
            { text: 'in the Jungle', accent: true, block: true },
          ]}
        />

        <Scrub className="mt-14 grid items-stretch gap-8 md:grid-cols-3 md:gap-6 xl:gap-8" end="bottom 80%">
          {TIER_CARDS.map((t) => {
            const isGold = t.theme === 'gold'
            const card = (
              <article
                className={`relative flex h-full flex-col overflow-hidden rounded-3xl px-6 pb-8 ${themes[t.theme].card} ${
                  isGold ? 'rw-glow' : ''
                }`}
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                {/* mascot stage — identical height on every card so all three line up */}
                <div className="flex h-64 items-end justify-center pt-6">
                  <Image
                    src={t.mascot}
                    alt={`${t.tier} — ${t.color} ${t.name} mascot`}
                    width={373}
                    height={464}
                    sizes="(max-width: 768px) 70vw, 320px"
                    className="h-full w-auto object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.45)]"
                  />
                </div>
                <h3 className="mt-6 text-center">
                  <span className={`block text-lg font-extrabold uppercase tracking-widest ${themes[t.theme].name}`}>
                    {t.color}
                  </span>
                  <span className="block text-3xl font-extrabold uppercase tracking-tight text-white md:text-4xl">
                    {t.name}
                  </span>
                </h3>
                <p className="mt-5 text-center text-white">
                  <span className="block text-2xl font-extrabold tracking-tight md:text-3xl">{t.points}</span>
                  <span className="mt-1 block text-xs font-bold uppercase tracking-[0.2em]">Annual Points</span>
                </p>
                <ul className="mt-6 flex flex-wrap justify-center gap-2">
                  {t.perks.map((p) => (
                    <li
                      key={p}
                      className={`rounded-full px-3.5 py-1.5 text-center text-[10.5px] font-bold uppercase leading-snug tracking-wide ${themes[t.theme].pill}`}
                    >
                      {p}
                    </li>
                  ))}
                </ul>
              </article>
            )
            return (
              <div key={t.name} data-reveal="up" className="h-full">
                {isGold ? (
                  <div className="relative h-full overflow-hidden rounded-3xl p-[3px]">
                    <span aria-hidden className="rw-ring absolute inset-0 rounded-3xl" />
                    <div className="relative h-full">{card}</div>
                  </div>
                ) : (
                  card
                )}
              </div>
            )
          })}
        </Scrub>

        <Scrub start="top 95%">
          <p
            data-reveal="rise"
            className="mx-auto mt-12 max-w-2xl text-center text-[11px] font-semibold uppercase leading-relaxed tracking-wide text-[var(--color-muted)]"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            {EARN_RULES_DISCLAIMER}
          </p>
        </Scrub>
      </div>
    </section>
  )
}
