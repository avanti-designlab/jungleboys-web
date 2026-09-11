import PillCta from '@/components/pill-cta'
import Reveal from '@/components/reveal'

// Hero v3 (Avanti): drip curtain REMOVED (two attempts, both read fake —
// if honey ever returns here it comes as a photoreal generated asset, not
// vectors). Skyline floats over the breathing molten glow; one line; one CTA.
export default function OrcHero() {
  return (
    <header className="relative flex min-h-[96vh] flex-col items-center justify-center overflow-hidden px-6 pb-24 pt-40 text-center">
      {/* molten glow rising from the bottom edge + faint script watermark */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[60vh] bg-[radial-gradient(60%_100%_at_50%_100%,rgba(245,163,0,0.26),transparent_70%)]"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- brand watermark */}
      <img
        src="/products/orc/script-drip.webp"
        alt=""
        aria-hidden
        data-orc-plx="0.05"
        className="pointer-events-none absolute -right-16 top-16 w-[min(48vw,540px)] opacity-[0.08]"
      />

      <Reveal className="relative w-full">
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 h-[110%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,212,0,0.14),transparent_70%)]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- hero brand art */}
        <img
          src="/products/orc/skyline.webp"
          alt="Oil Refinery Co. — refinery skyline dripping oil"
          fetchPriority="high"
          className="orc-float relative mx-auto w-[min(88vw,720px)]"
        />
      </Reveal>

      <Reveal delay={0.14} className="relative mt-8">
        <h1 className="font-display uppercase leading-[0.86]" style={{ fontSize: 'min(11vw, 6.5rem)' }}>
          From the best flower
          <br />
          comes <span className="orc-molten">the best oil.</span>
        </h1>
      </Reveal>

      <Reveal delay={0.22} className="relative mt-9">
        <PillCta label="Explore Oil Refinery Co." href="#orc-lineup" hover="black" />
      </Reveal>
    </header>
  )
}
