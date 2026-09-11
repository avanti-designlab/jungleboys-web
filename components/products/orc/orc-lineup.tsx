import Reveal from '@/components/reveal'

// The extraction lineup v3 (Avanti: "made into pill style content box
// sections" — supersedes the full-screen sticky panels). Each extract is a
// big rounded content box in the site's pill language: texture art in a
// rounded inner stage on one side (alternating), number pill + Bebas title +
// chips + a Best-for pill on the other. Four forms only — NO Live Rosin.
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
    copy: 'Fresh frozen flower, extracted immediately after harvest — the terpenes curing burns away, locked in.',
    chips: ['Fresh Frozen', 'High Terpenes', 'Full Spectrum'],
    bestFor: 'Maximum flavor. True to the flower.',
  },
  {
    name: 'Batter',
    image: 'batter',
    copy: 'Cured and whipped into a rich, buttery consistency with excellent flavor retention.',
    chips: ['Buttery Texture', 'Flavor Retention', 'Terpene Rich'],
    bestFor: 'Balanced texture that dabs easy.',
  },
  {
    name: 'Budder',
    image: 'budder',
    copy: 'Whipped creamy — smooth, flavorful, and easy to work with.',
    chips: ['Creamy Texture', 'Stable Consistency', 'High Potency'],
    bestFor: 'A smooth, forgiving consistency for every rig.',
  },
  {
    name: 'Sugar Trim',
    image: 'sugar-trim',
    copy: 'Natural cannabinoid crystals suspended in terpene-rich sauce.',
    chips: ['Crystal Rich', 'Saucey', 'Loud Terps'],
    bestFor: 'Crystal-rich concentrates packed with sauce.',
  },
]

export default function OrcLineup() {
  return (
    <section id="orc-lineup" className="relative scroll-mt-24 px-3 py-24 md:px-4 md:py-32">
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

        <div className="mt-14 space-y-6">
          {EXTRACTS.map((x, i) => (
            <Reveal key={x.name} delay={0.06}>
              <article
                className={`grid items-center gap-8 overflow-hidden rounded-[2.5rem] bg-[var(--orc-card)] p-6 ring-1 ring-[var(--orc-yellow)]/20 md:grid-cols-2 md:gap-12 md:p-10 ${
                  i % 2 ? 'md:[&>*:first-child]:order-2' : ''
                }`}
              >
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[1.75rem] bg-[radial-gradient(70%_90%_at_50%_100%,rgba(245,163,0,0.2),transparent_75%)]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- extract macro */}
                  <img
                    src={`/products/orc/${x.image}.webp`}
                    alt={`${x.name} — Oil Refinery Co. extract`}
                    loading="lazy"
                    data-orc-plx="-0.03"
                    className="max-h-[80%] w-auto max-w-[72%] object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.6)]"
                  />
                </div>

                <div className="flex flex-col items-start gap-4 pb-2 md:py-4">
                  <span
                    className="rounded-full bg-[var(--orc-yellow)] px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--orc-ink)]"
                    style={{ fontFamily: 'var(--font-brand)' }}
                  >
                    {String(i + 1).padStart(2, '0')} / 04
                  </span>
                  <h3 className="font-display uppercase leading-[0.85] text-[var(--orc-yellow)]" style={{ fontSize: 'min(12vw, 4.5rem)' }}>
                    {x.name}
                  </h3>
                  <p className="max-w-md text-sm leading-relaxed text-white/70 md:text-base" style={{ fontFamily: 'var(--font-brand)' }}>
                    {x.copy}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {x.chips.map((c) => (
                      <span
                        key={c}
                        className="rounded-full border-2 border-[var(--orc-yellow)]/50 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--orc-yellow)]"
                        style={{ fontFamily: 'var(--font-brand)' }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  <p
                    className="mt-1 rounded-full bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/85"
                    style={{ fontFamily: 'var(--font-brand)' }}
                  >
                    Best for <span className="normal-case tracking-normal text-white/70">{x.bestFor}</span>
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
