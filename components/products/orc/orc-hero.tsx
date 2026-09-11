import PillCta from '@/components/pill-cta'
import Reveal from '@/components/reveal'

// Hero — the refinery at night. Skyline-with-drips brand art rises over a
// molten glow; the line the whole brand hangs on carries the page. One CTA
// (frozen hero rule), straight to the lineup.
export default function OrcHero() {
  return (
    <header className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-6 pb-24 pt-28 text-center">
      {/* molten glow rising from the bottom edge + faint script watermark */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55vh] bg-[radial-gradient(60%_100%_at_50%_100%,rgba(245,163,0,0.22),transparent_70%)]"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- brand watermark */}
      <img
        src="/products/orc/script-drip.webp"
        alt=""
        aria-hidden
        data-orc-plx="0.05"
        className="pointer-events-none absolute -right-16 top-10 w-[min(48vw,540px)] opacity-[0.08]"
      />

      <Reveal className="relative">
        <p
          className="text-[10px] font-extrabold uppercase tracking-[0.42em] text-[var(--orc-gold)] md:text-xs"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          Jungle Boys Extracts · Est 2014
        </p>
      </Reveal>

      <Reveal delay={0.08} className="relative mt-6 w-full">
        {/* eslint-disable-next-line @next/next/no-img-element -- hero brand art */}
        <img
          src="/products/orc/skyline.webp"
          alt="Oil Refinery Co. — refinery skyline dripping oil"
          fetchPriority="high"
          className="mx-auto w-[min(86vw,640px)]"
        />
      </Reveal>

      <Reveal delay={0.16} className="relative mt-8">
        <h1 className="font-display uppercase leading-[0.86]" style={{ fontSize: 'min(11vw, 6.5rem)' }}>
          From the best flower
          <br />
          comes <span className="orc-molten">the best oil.</span>
        </h1>
      </Reveal>

      <Reveal delay={0.24} className="relative mt-9">
        <PillCta label="Explore the extracts" href="#orc-lineup" hover="black" />
      </Reveal>
    </header>
  )
}
