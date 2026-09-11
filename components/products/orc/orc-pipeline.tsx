import Reveal from '@/components/reveal'

// From plant to product v2 (Avanti: "way more 3D… showing all the steps with
// imagery"). Eight refinery stations on a horizontal snap rail — each a
// full image card that swings in with perspective as it lands — over a pipe
// of flowing gold. Art slots are wired per station: current fills are our
// existing brand assets; Avanti's Higgsfield set swaps in file-for-file
// (public/products/orc/step-<n>.webp overrides via the ART map).
const STEPS: { n: string; title: string; blurb: string; art: string; artClass?: string }[] = [
  { n: '01', title: 'Pheno Hunting', blurb: 'Thousands of seedlings. A handful of keepers.', art: 'nug-2' },
  { n: '02', title: 'Elite Genetics', blurb: 'Only award-winning cultivars make the cut.', art: 'nug-1' },
  { n: '03', title: 'Cultivation', blurb: 'Grown indoors to Jungle Boys spec.', art: 'nug-3' },
  { n: '04', title: 'Peak Harvest', blurb: 'Cut at full maturity — never early, never late.', art: 'nug-4' },
  { n: '05', title: 'Fresh Frozen', blurb: 'Frozen within hours. Terpenes locked in.', art: 'nug-5', artClass: 'hue-rotate-[160deg] saturate-[0.7] brightness-110' },
  { n: '06', title: 'Precision Extraction', blurb: 'The lab lets the genetics do the talking.', art: 'jar' },
  { n: '07', title: 'Post Processing', blurb: 'Whipped, cured and finished by hand.', art: 'budder' },
  { n: '08', title: 'ORC Concentrates', blurb: 'Flavor first. Every jar, every batch.', art: 'live-resin' },
]

export default function OrcPipeline() {
  return (
    <section className="relative overflow-hidden px-0 py-24 md:py-32">
      <Reveal className="px-6 text-center">
        <h2 className="font-display uppercase leading-[0.86]" style={{ fontSize: 'min(12vw, 6.5rem)' }}>
          From plant <span className="orc-molten">to product</span>
        </h2>
        <p
          className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/60"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          Eight stations. One obsession: protecting the plant&rsquo;s natural terpene profile
          from garden to jar.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="orc-rail mt-14">
          <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:px-[max(2rem,calc((100vw-1240px)/2))]">
            {STEPS.map((s, i) => (
              <article
                key={s.n}
                className="orc-station min-w-[76%] snap-center sm:min-w-[46%] lg:min-w-[30%]"
                style={{ '--orc-step-delay': `${0.1 * i}s` } as React.CSSProperties}
              >
                <div className="flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-[var(--orc-card)] ring-1 ring-[var(--orc-yellow)]/20">
                  <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[radial-gradient(75%_90%_at_50%_100%,rgba(245,163,0,0.2),transparent_75%)]">
                    <span
                      aria-hidden
                      className="font-display absolute left-4 top-2 text-[5.5rem] leading-none text-[var(--orc-yellow)]/15"
                    >
                      {s.n}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element -- station art */}
                    <img
                      src={`/products/orc/${s.art}.webp`}
                      alt=""
                      loading="lazy"
                      className={`max-h-[78%] w-auto max-w-[72%] object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.55)] ${s.artClass ?? ''}`}
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5 px-6 pb-6 pt-4">
                    <h3 className="font-display text-3xl uppercase leading-none text-[var(--orc-yellow)]">
                      {s.title}
                    </h3>
                    <p className="text-[13px] font-bold text-white/65" style={{ fontFamily: 'var(--font-brand)' }}>
                      {s.blurb}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {/* the pipe: flowing gold under the whole rail */}
          <div className="mx-6 mt-2 h-3 rounded-full border border-black/40 md:mx-[max(2rem,calc((100vw-1240px)/2))]">
            <div className="orc-pipe-flow h-full w-full rounded-full opacity-90" />
          </div>
        </div>
      </Reveal>
    </section>
  )
}
