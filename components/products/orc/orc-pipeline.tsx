import Reveal from '@/components/reveal'

// From plant to product — the refinery pipeline. Eight numbered stations; the
// pipe above each fills gold as its station reveals (CSS, .orc-pipe).
const STEPS = [
  'Pheno Hunting',
  'Elite Genetics',
  'Cultivation',
  'Harvest at Peak Maturity',
  'Fresh Frozen Flower',
  'Precision Extraction',
  'Post Processing',
  'ORC Concentrates',
]

export default function OrcPipeline() {
  return (
    <section className="relative px-6 py-24 md:px-12 md:py-32 lg:px-20">
      <div className="mx-auto max-w-[1240px]">
        <Reveal className="text-center">
          <h2 className="font-display uppercase leading-[0.86]" style={{ fontSize: 'min(12vw, 5.5rem)' }}>
            From plant <span className="text-[var(--orc-yellow)]">to product</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s} delay={0.08 * i}>
              <div className="orc-pipe pt-5" style={{ '--orc-step-delay': `${0.08 * i}s` } as React.CSSProperties}>
                <p className="font-display text-3xl leading-none text-[var(--orc-yellow)]/60">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <p
                  className="mt-2 text-[12px] font-extrabold uppercase tracking-[0.16em] text-white md:text-sm"
                  style={{ fontFamily: 'var(--font-brand)' }}
                >
                  {s}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-12 text-center">
          <p
            className="mx-auto max-w-2xl text-sm leading-relaxed text-white/60"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Every step is designed to protect the plant&rsquo;s natural terpene profile while
            preserving the unique characteristics of each strain.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
