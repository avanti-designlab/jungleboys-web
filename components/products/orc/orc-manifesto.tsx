import Reveal from '@/components/reveal'

// The brand's whole argument in two lines, with the molten barrel riding the
// edge. Copy from the brief, tightened.
export default function OrcManifesto() {
  return (
    <section className="relative overflow-hidden px-6 py-24 md:px-12 md:py-32 lg:px-20">
      <div className="mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <Reveal>
            <h2 className="font-display uppercase leading-[0.86]" style={{ fontSize: 'min(11vw, 5.5rem)' }}>
              We don&rsquo;t chase trends&nbsp;&mdash;
              <br />
              <span className="text-[var(--orc-yellow)]">we chase terpenes.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            {/* v2 copy cut (Avanti: "a lot of text… simplified") — one line */}
            <p
              className="mt-7 max-w-xl text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--orc-gold)] md:text-base"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              Better flower doesn&rsquo;t just smoke better. It makes better extracts.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.12} className="relative mx-auto">
          {/* eslint-disable-next-line @next/next/no-img-element -- brand mascot */}
          <img
            src="/products/orc/mascot-barrel.webp"
            alt="Jungle Boys oil barrel overflowing with molten extract"
            loading="lazy"
            className="orc-float w-[min(64vw,360px)] drop-shadow-[0_30px_60px_rgba(245,163,0,0.25)]"
          />
        </Reveal>
      </div>
    </section>
  )
}
