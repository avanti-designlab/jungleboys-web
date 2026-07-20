import Image from 'next/image'
import { EARN_RULES_DISCLAIMER, TIER_CARDS } from '@/lib/rewards-content'
import { Scrub, SplitHeading } from './motion'

// "Earn your place in the jungle" — three equal cards with fixed content
// zones so every row lines up. Mascots are oversized, POP OUT of the card
// top, and float gently (alive). Pheno Hunter carries the rotating ring.

const themes = {
  green: {
    card: 'bg-gradient-to-b from-[#1e8a43] via-[#0d4423] to-[#041b0d]',
    name: 'text-[#37d16b]',
  },
  silver: {
    card: 'bg-gradient-to-b from-[#a9a9ad] via-[#4c4c50] to-[#131315]',
    name: 'text-[#e4e4e8]',
  },
  gold: {
    card: 'bg-gradient-to-b from-[#f0c419] via-[#96700a] to-[#241b02]',
    name: 'text-[#ffe98a]',
  },
} as const

export default function TierCards() {
  return (
    <section className="overflow-hidden px-6 py-16 md:px-12 md:py-24 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <SplitHeading
          mode="letters"
          className="text-center text-3xl font-extrabold uppercase leading-[1.1] tracking-tight text-[var(--color-foreground)] md:text-4xl xl:text-5xl"
          lines={[
            { text: 'Earn Your Place' },
            { text: 'in the Jungle', accent: true, block: true },
          ]}
        />

        <Scrub
          enter
          start="top 70%"
          className="mt-36 grid items-stretch gap-y-36 md:mt-40 md:grid-cols-3 md:gap-x-6 md:gap-y-0 xl:gap-x-8"
        >
          {TIER_CARDS.map((t, i) => {
            const isGold = t.theme === 'gold'
            return (
              <div key={t.name} data-reveal="up" className="h-full">
                <article
                  className={`group relative flex h-full flex-col rounded-3xl px-6 pb-8 transition-transform duration-500 hover:-translate-y-2 ${themes[t.theme].card} ${
                    isGold ? 'rw-glow' : ''
                  }`}
                  style={{ fontFamily: 'var(--font-brand)' }}
                >
                  {isGold && (
                    <span aria-hidden className="absolute -inset-[3px] overflow-hidden rounded-[calc(1.5rem+3px)]">
                      <span className="rw-ring absolute inset-0" />
                    </span>
                  )}
                  {/* base card surface above the ring */}
                  <span aria-hidden className={`absolute inset-0 rounded-3xl ${themes[t.theme].card}`} />

                  {/* mascot pops out of the card top — same stage on all three, still */}
                  <div className="pointer-events-none relative h-44 md:h-40">
                    <Image
                      src={t.mascot}
                      alt={`${t.tier} — ${t.color} ${t.name} mascot`}
                      width={373}
                      height={464}
                      sizes="(max-width: 768px) 80vw, 380px"
                      className="absolute -top-40 h-80 w-auto max-w-none -translate-x-1/2 object-contain drop-shadow-[0_16px_30px_rgba(0,0,0,0.5)] md:-top-44"
                      style={{ left: ['58%', '55%', '54%'][i] }}
                    />
                    {/* living smoke rising off the character */}
                    {t.theme !== 'gold' ? (
                      <>
                        <span aria-hidden className="rw-smoke left-[38%] -top-36" style={{ animationDelay: `${i * 1.1}s` }} />
                        <span aria-hidden className="rw-smoke left-[52%] -top-40" style={{ animationDelay: `${i * 1.1 + 2.2}s` }} />
                      </>
                    ) : (
                      <span aria-hidden className="rw-smoke left-[58%] -top-36" style={{ animationDelay: '1.6s', background: 'radial-gradient(circle, rgba(254,207,14,0.45), transparent 70%)' }} />
                    )}
                  </div>

                  <div className="relative">
                    {/* fixed-height zones keep all three cards aligned row by row */}
                    <h3 className="flex h-24 flex-col justify-start text-center">
                      <span className={`block text-lg font-extrabold uppercase tracking-widest ${themes[t.theme].name}`}>
                        {t.color}
                      </span>
                      <span className="block text-3xl font-extrabold uppercase tracking-tight text-white md:text-[2rem] xl:text-4xl">
                        {t.name}
                      </span>
                    </h3>
                    <p className="flex h-20 flex-col justify-start text-center text-white">
                      <span className="block text-2xl font-extrabold tracking-tight md:text-3xl">{t.points}</span>
                      <span className="mt-1 block text-xs font-bold uppercase tracking-[0.2em]">Annual Points</span>
                    </p>
                    <ul className="mt-2 flex flex-wrap justify-center gap-2">
                      {t.perks.map((p) => (
                        <li
                          key={p}
                          className="rounded-full bg-black/35 px-3.5 py-1.5 text-center text-[10.5px] font-bold uppercase leading-snug tracking-wide text-white"
                        >
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </div>
            )
          })}
        </Scrub>

        <Scrub start="top 95%">
          <p
            data-reveal="rise"
            className="mt-12 text-center text-[11px] font-semibold uppercase leading-relaxed tracking-wide text-[var(--color-muted)] lg:whitespace-nowrap"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            {EARN_RULES_DISCLAIMER}
          </p>
        </Scrub>
      </div>
    </section>
  )
}
