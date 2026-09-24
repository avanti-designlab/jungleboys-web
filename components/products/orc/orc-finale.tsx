// The finale — the jar, floor to ceiling (the flower-page journey-end
// moment, ORC's way). A 220vh pin: the Higgsfield jar hero starts pulled
// back and dim, then slowly zooms and brightens as the scroll walks toward
// it; the closing line burns in over the glass. --p from the pin, CSS calc.
export default function OrcFinale() {
  return (
    <section data-orc-pin className="relative h-[220vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- finale scene */}
        <img
          src="/products/orc/step-8.webp"
          alt="Oil Refinery Co. jar of golden extract on a black pedestal"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            transform: 'scale(calc(1.28 - var(--p, 0) * 0.24))',
            filter: 'brightness(calc(0.55 + var(--p, 0) * 0.55))',
          }}
        />
        {/* vignette keeps the type readable at every progress */}
        <span aria-hidden className="absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_45%,transparent_40%,rgba(0,0,0,0.72)_100%)]" />

        <div className="relative flex h-full flex-col items-center justify-end pb-[10vh] text-center">
          <h2
            className="font-display uppercase leading-[0.86] text-white"
            style={{
              fontSize: 'min(13vw, 7rem)',
              opacity: 'calc((var(--p, 0) - 0.3) * 2)',
              transform: 'translateY(calc((1 - var(--p, 0)) * 6vh))',
            }}
          >
            Flavor first.
            <br />
            <span className="orc-molten">Every jar. Every batch.</span>
          </h2>
        </div>
      </div>
    </section>
  )
}
