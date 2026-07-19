import Image from 'next/image'
import Reveal from '@/components/reveal'
import { EARN_RULES_DISCLAIMER, TIER_CARDS } from '@/lib/rewards-content'
import { TwoTone } from './two-tone'

// "Earn your place in the jungle" — the three tier cards. Mascot art comes
// from Figma; card text is real HTML so the perks are crawlable.

const themes = {
  green: {
    card: 'bg-gradient-to-b from-[#1e8a43] via-[#0d4423] to-[#041b0d]',
    name: 'text-[#37d16b]',
    text: 'text-white',
    muted: 'text-white/90',
  },
  silver: {
    card: 'bg-gradient-to-b from-[#a9a9ad] via-[#4c4c50] to-[#131315]',
    name: 'text-[#e4e4e8]',
    text: 'text-white',
    muted: 'text-white/90',
  },
  gold: {
    card: 'bg-gradient-to-b from-[#ffe14d] via-[#d3ab00] to-[#3a2f00] shadow-[0_0_80px_rgba(254,207,14,0.35)]',
    name: 'text-[#161102]',
    text: 'text-[#161102]',
    muted: 'text-[#241c04]',
  },
} as const

export default function TierCards() {
  return (
    <section className="px-6 py-16 md:px-12 md:py-24 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <TwoTone white="Earn Your Place" yellow="in the Jungle" />
        </Reveal>

        <div className="mt-20 grid gap-16 md:grid-cols-3 md:gap-6 xl:gap-8">
          {TIER_CARDS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1} className="h-full">
              <article
                className={`relative flex h-full flex-col rounded-3xl px-6 pb-8 pt-56 ${themes[t.theme].card}`}
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                <Image
                  src={t.mascot}
                  alt={`${t.tier} — ${t.color} ${t.name} mascot`}
                  width={373}
                  height={464}
                  sizes="(max-width: 768px) 60vw, 300px"
                  className="absolute -top-14 left-1/2 w-[58%] max-w-[230px] -translate-x-1/2"
                />
                <h3 className="text-center">
                  <span
                    className={`block text-lg font-extrabold uppercase tracking-widest ${themes[t.theme].name}`}
                  >
                    {t.color}
                  </span>
                  <span
                    className={`block text-3xl font-extrabold uppercase tracking-tight md:text-4xl ${themes[t.theme].text}`}
                  >
                    {t.name}
                  </span>
                </h3>
                <p className={`mt-5 text-center ${themes[t.theme].text}`}>
                  <span className="block text-2xl font-extrabold tracking-tight md:text-3xl">
                    {t.points}
                  </span>
                  <span className="mt-1 block text-xs font-bold uppercase tracking-[0.2em]">
                    Annual Points
                  </span>
                </p>
                <ul
                  className={`mt-6 space-y-1.5 text-[11px] font-bold uppercase leading-relaxed tracking-wide ${themes[t.theme].muted}`}
                >
                  {t.perks.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span aria-hidden>•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p
            className="mx-auto mt-12 max-w-2xl text-center text-[11px] font-semibold uppercase leading-relaxed tracking-wide text-white/80"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            {EARN_RULES_DISCLAIMER}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
