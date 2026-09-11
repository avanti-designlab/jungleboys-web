import Reveal from '@/components/reveal'

// The closer — refinery worker mascot + the statement. Copy rewritten
// without Live Rosin (not an ORC product — Avanti, 2026-09-10).
export default function OrcBuilt() {
  return (
    <section className="relative overflow-hidden bg-[var(--orc-panel)] px-6 py-24 md:px-12 md:py-32 lg:px-20">
      <div className="mx-auto grid max-w-[1240px] items-center gap-12 lg:grid-cols-[1fr_1.6fr]">
        <Reveal className="relative order-2 mx-auto lg:order-1">
          {/* eslint-disable-next-line @next/next/no-img-element -- brand mascot */}
          <img
            src="/products/orc/mascot-worker.webp"
            alt="Jungle Boys refinery worker with an oil can and wrench"
            loading="lazy"
            data-orc-plx="-0.04"
            className="w-[min(70vw,400px)] drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
          />
        </Reveal>

        <div className="order-1 lg:order-2">
          <Reveal>
            <h2 className="font-display uppercase leading-[0.86]" style={{ fontSize: 'min(11vw, 5rem)' }}>
              Built for people who
              <br />
              <span className="text-[var(--orc-yellow)]">love great flower.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p
              className="mt-7 max-w-xl text-sm leading-relaxed text-white/70 md:text-base"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              Whether you&rsquo;re loading up Live Resin or reaching for your favorite Batter,
              every ORC concentrate starts exactly the same way: with premium flower worth
              extracting.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <p
              className="mt-6 inline-block rounded-full bg-[var(--orc-yellow)] px-6 py-3 text-[12px] font-extrabold uppercase tracking-[0.2em] text-[var(--orc-ink)]"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              That&rsquo;s the Jungle Boys difference.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
