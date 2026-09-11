import Reveal from '@/components/reveal'

// The extraction lineup v2 (Avanti: "a lot more advanced… take up the entire
// design completely"). Each extract owns a FULL SCREEN: sticky 100svh panels
// that stack over one another as the page scrolls — the CSS-sticky pin (the
// mobile-safe mechanism; GSAP pins replay on phones). Giant ghost wordmark
// behind, texture macro floating center, chips + one Best-for line. Four
// forms and nothing else — NO Live Rosin (not an ORC product).
const EXTRACTS: {
  name: string
  image: string
  copy: string
  chips: string[]
  bestFor: string
  /** per-panel ground — each panel must be OPAQUE to cover the one below */
  bg: string
  glow: string
}[] = [
  {
    name: 'Live Resin',
    image: 'live-resin',
    copy: 'Fresh frozen flower, extracted immediately after harvest.',
    chips: ['Fresh Frozen', 'High Terpenes', 'Full Spectrum'],
    bestFor: 'Maximum flavor. True to the flower.',
    bg: '#0b0a07',
    glow: 'rgba(245,163,0,0.3)',
  },
  {
    name: 'Batter',
    image: 'batter',
    copy: 'Cured and whipped into a rich, buttery consistency.',
    chips: ['Buttery Texture', 'Flavor Retention', 'Terpene Rich'],
    bestFor: 'Balanced texture that dabs easy.',
    bg: '#120e07',
    glow: 'rgba(255,212,0,0.26)',
  },
  {
    name: 'Budder',
    image: 'budder',
    copy: 'Creamy, smooth, and easy to work with.',
    chips: ['Creamy Texture', 'Stable Consistency', 'High Potency'],
    bestFor: 'A smooth, forgiving consistency for every rig.',
    bg: '#0d0b05',
    glow: 'rgba(233,177,60,0.3)',
  },
  {
    name: 'Sugar Trim',
    image: 'sugar-trim',
    copy: 'Natural cannabinoid crystals in terpene-rich sauce.',
    chips: ['Crystal Rich', 'Saucey', 'Loud Terps'],
    bestFor: 'Crystal heads who want the sauce.',
    bg: '#0a0906',
    glow: 'rgba(255,232,120,0.22)',
  },
]

export default function OrcLineup() {
  return (
    <section id="orc-lineup" className="relative scroll-mt-0">
      <Reveal className="px-6 pb-6 pt-24 text-center md:pt-32">
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

      {EXTRACTS.map((x, i) => (
        <div key={x.name} className="relative h-[135svh]">
          <div className="orc-panel-stage" style={{ background: x.bg }}>
            {/* ghost wordmark */}
            <p aria-hidden className="orc-panel-name font-display uppercase">
              {x.name}
            </p>
            {/* molten pool glow */}
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-[45svh]"
              style={{ background: `radial-gradient(60% 100% at 50% 100%, ${x.glow}, transparent 72%)` }}
            />

            <div className="relative flex h-full flex-col items-center justify-end px-6 pb-[9svh] text-center">
              {/* the texture, huge and floating */}
              {/* eslint-disable-next-line @next/next/no-img-element -- extract macro */}
              <img
                src={`/products/orc/${x.image}.webp`}
                alt={`${x.name} — Oil Refinery Co. extract`}
                loading="lazy"
                className="orc-float pointer-events-none absolute left-1/2 top-[16svh] w-[min(72vw,460px)] -translate-x-1/2 drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
                style={{ animationDelay: `${i * 1.3}s` }}
              />

              <p aria-hidden className="font-display text-2xl text-[var(--orc-yellow)]/50">
                {String(i + 1).padStart(2, '0')} / 04
              </p>
              <h3 className="font-display mt-1 uppercase leading-none text-[var(--orc-yellow)]" style={{ fontSize: 'min(13vw, 5.5rem)' }}>
                {x.name}
              </h3>
              <p
                className="mt-3 max-w-md text-sm font-bold text-white/75 md:text-base"
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                {x.copy}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                {x.chips.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border-2 border-[var(--orc-yellow)]/50 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--orc-yellow)] md:text-[11px]"
                    style={{ fontFamily: 'var(--font-brand)' }}
                  >
                    {c}
                  </span>
                ))}
              </div>
              <p
                className="mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--orc-gold)]"
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                Best for <span className="normal-case tracking-normal text-white/70">{x.bestFor}</span>
              </p>
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}
