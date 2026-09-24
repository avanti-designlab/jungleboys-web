import Reveal from '@/components/reveal'

// The hunt — where every extract actually starts. Six qualities as gold
// pills; macro nug cutouts drift at the edges on the page parallax.
const QUALITIES = [
  'Exceptional resin output',
  'Loud terpene profiles',
  'Heavy trichome production',
  'High cannabinoid content',
  'Exotic flavors',
  'Memorable effects',
]

const NUGS: { src: string; cls: string; plx: string; rot: string; spin: string }[] = [
  { src: 'nug-1', cls: 'left-[-4%] top-[6%] w-[min(30vw,280px)]', plx: '0.07', rot: '-8', spin: '22' },
  { src: 'nug-3', cls: 'right-[-3%] top-[26%] w-[min(24vw,210px)]', plx: '-0.06', rot: '10', spin: '-18' },
  { src: 'nug-4', cls: 'left-[3%] bottom-[4%] w-[min(22vw,190px)]', plx: '-0.05', rot: '14', spin: '26' },
  { src: 'nug-2', cls: 'right-[5%] bottom-[12%] w-[min(26vw,230px)]', plx: '0.06', rot: '-12', spin: '-24' },
]

export default function OrcHunt() {
  return (
    <section className="relative overflow-hidden bg-[rgba(18,16,10,0.82)] px-6 py-24 md:px-12 md:py-32 lg:px-20">
      {NUGS.map((n) => (
        // eslint-disable-next-line @next/next/no-img-element -- macro nug cutouts
        <img
          key={n.src}
          src={`/products/orc/${n.src}.webp`}
          alt=""
          aria-hidden
          loading="lazy"
          data-orc-plx={n.plx}
          data-orc-rot={n.spin}
          data-orc-rot-base={n.rot}
          className={`pointer-events-none absolute opacity-90 drop-shadow-[0_24px_44px_rgba(0,0,0,0.6)] ${n.cls}`}
        />
      ))}

      <div className="relative mx-auto max-w-[1100px] text-center">
        <Reveal>
          <p
            className="text-[10px] font-extrabold uppercase tracking-[0.42em] text-[var(--orc-gold)] md:text-xs"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            It all starts with the hunt
          </p>
          <h2 className="font-display mt-3 uppercase leading-[0.86]" style={{ fontSize: 'min(12vw, 6rem)' }}>
            Elite genetics <span className="text-[var(--orc-yellow)]">come first</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p
            className="mx-auto mt-7 max-w-xl text-sm leading-relaxed text-white/70 md:text-base"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Every year, thousands of phenotypes get hunted for the rare plants that stand above
            the rest. What makes the cut:
          </p>
        </Reveal>

        <div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-3">
          {QUALITIES.map((q, i) => (
            <Reveal key={q} delay={0.06 * i}>
              <span
                className="inline-block rounded-full border-2 border-[var(--orc-yellow)]/60 px-5 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--orc-yellow)] md:text-xs"
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                {q}
              </span>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p
            className="mt-12 text-sm font-extrabold uppercase tracking-[0.22em] text-white/85"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Only the very best make it into Oil Refinery Co.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
