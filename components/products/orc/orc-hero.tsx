import PillCta from '@/components/pill-cta'
import Reveal from '@/components/reveal'

// Hero v4 — pinned cinema (the flower-page recede, ORC-flavored). 190vh
// outer pins a full screen: as you scroll, the skyline recedes and dims
// while the molten glow blooms up from below and the headline holds the
// stage; a SINCE 2014 stamp fades in late. All driven by the pin's --p via
// pure CSS calc — no clock, scrub-true.
export default function OrcHero() {
  return (
    <header data-orc-pin className="relative h-[190vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
        {/* molten glow blooms with progress */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[70vh] bg-[radial-gradient(60%_100%_at_50%_100%,rgba(245,163,0,0.5),transparent_72%)]"
          style={{ opacity: 'calc(0.45 + var(--p, 0) * 0.55)' }}
        />

        <Reveal className="relative w-full" slide>
          {/* eslint-disable-next-line @next/next/no-img-element -- hero brand art */}
          <img
            src="/products/orc/skyline.webp"
            alt="Oil Refinery Co., refinery skyline dripping oil"
            fetchPriority="high"
            className="orc-float relative mx-auto w-[min(88vw,720px)]"
            style={{
              transform: 'translateY(calc(var(--p, 0) * -5vh)) scale(calc(1 - var(--p, 0) * 0.16))',
              opacity: 'calc(1 - var(--p, 0) * 0.35)',
            }}
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

      </div>
    </header>
  )
}
