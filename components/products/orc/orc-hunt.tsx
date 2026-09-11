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

const NUGS: { src: string; cls: string; plx: string; rot: string }[] = [
  { src: 'nug-1', cls: 'left-[-3%] top-[8%] w-[min(26vw,220px)]', plx: '0.06', rot: '-8deg' },
  { src: 'nug-3', cls: 'right-[-2%] top-[30%] w-[min(20vw,170px)]', plx: '-0.05', rot: '10deg' },
  { src: 'nug-4', cls: 'left-[4%] bottom-[6%] w-[min(18vw,150px)]', plx: '-0.04', rot: '14deg' },
  { src: 'nug-2', cls: 'right-[6%] bottom-[14%] w-[min(22vw,180px)]', plx: '0.05', rot: '-12deg' },
]

export default function OrcHunt() {
  return (
    <section className="relative overflow-hidden bg-[var(--orc-panel)] px-6 py-24 md:px-12 md:py-32 lg:px-20">
      {NUGS.map((n) => (
        // eslint-disable-next-line @next/next/no-img-element -- macro nug cutouts
        <img
          key={n.src}
          src={`/products/orc/${n.src}.webp`}
          alt=""
          aria-hidden
          loading="lazy"
          data-orc-plx={n.plx}
          className={`pointer-events-none absolute opacity-90 ${n.cls}`}
          style={{ rotate: n.rot }}
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
            className="mx-auto mt-7 max-w-2xl text-sm leading-relaxed text-white/70 md:text-base"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Before an extract ever reaches the lab, it begins in the garden. Every year, Jungle
            Boys hunts through thousands of unique phenotypes searching for the rare plants that
            stand above the rest. We&rsquo;re looking for cultivars with:
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
