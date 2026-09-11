import Reveal from '@/components/reveal'

// The extraction lineup — the four ORC forms and nothing else (Avanti,
// 2026-09-10: NO Live Rosin, it is not part of ORC). The Figma's separate
// "which extract is right for you" table folds into each card as a
// "Best for" line — same information, a third of the scroll.
const EXTRACTS: {
  name: string
  image: string
  copy: string
  chips: string[]
  bestFor: string
}[] = [
  {
    name: 'Live Resin',
    image: 'live-resin',
    copy: 'Fresh frozen flower, extracted immediately after harvest — the delicate terpenes and cannabinoids that curing burns away, locked in.',
    chips: ['Fresh Frozen', 'High Terpenes', 'Full Spectrum'],
    bestFor: 'Maximum flavor and a true-to-flower experience.',
  },
  {
    name: 'Batter',
    image: 'batter',
    copy: 'Carefully cured and whipped into a rich, buttery consistency with excellent flavor retention.',
    chips: ['Buttery Texture', 'Flavor Retention', 'Terpene Rich'],
    bestFor: 'Balanced texture that spreads clean and dabs easy.',
  },
  {
    name: 'Budder',
    image: 'budder',
    copy: 'Whipped into a creamy consistency that stays smooth, flavorful, and easy to work with.',
    chips: ['Creamy Texture', 'Stable Consistency', 'High Potency'],
    bestFor: 'A smooth, forgiving consistency for every rig.',
  },
  {
    name: 'Sugar Trim',
    image: 'sugar-trim',
    copy: 'Natural cannabinoid crystals suspended in terpene-rich sauce.',
    chips: ['Crystal Rich', 'Saucey', 'Loud Terps'],
    bestFor: 'Crystal-rich concentrates packed with terpene sauce.',
  },
]

export default function OrcLineup() {
  return (
    <section id="orc-lineup" className="relative scroll-mt-24 px-6 py-24 md:px-12 md:py-32 lg:px-20">
      <div className="mx-auto max-w-[1240px]">
        <Reveal className="text-center">
          <p
            className="text-[10px] font-extrabold uppercase tracking-[0.42em] text-[var(--orc-gold)] md:text-xs"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Our extraction lineup
          </p>
          <h2 className="font-display mt-3 uppercase leading-[0.86]" style={{ fontSize: 'min(12vw, 6rem)' }}>
            Four ways to <span className="orc-molten">chase flavor</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {EXTRACTS.map((x, i) => (
            <Reveal key={x.name} delay={Math.min(i, 2) * 0.08}>
              <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-[var(--orc-card)] ring-1 ring-[var(--orc-yellow)]/15">
                <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-[radial-gradient(70%_90%_at_50%_100%,rgba(245,163,0,0.16),transparent_75%)]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- extract macro */}
                  <img
                    src={`/products/orc/${x.image}.webp`}
                    alt={`${x.name} — Oil Refinery Co. extract`}
                    loading="lazy"
                    className="max-h-[82%] w-auto max-w-[70%] object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.55)] transition-transform duration-500 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-4 p-6 md:p-8">
                  <h3 className="font-display text-5xl uppercase leading-none text-[var(--orc-yellow)]">
                    {x.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/70" style={{ fontFamily: 'var(--font-brand)' }}>
                    {x.copy}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {x.chips.map((c) => (
                      <span
                        key={c}
                        className="rounded-full border border-white/25 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/80"
                        style={{ fontFamily: 'var(--font-brand)' }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  <p
                    className="mt-auto border-t border-white/10 pt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--orc-gold)]"
                    style={{ fontFamily: 'var(--font-brand)' }}
                  >
                    Best for <span className="normal-case tracking-normal text-white/75">{x.bestFor}</span>
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
