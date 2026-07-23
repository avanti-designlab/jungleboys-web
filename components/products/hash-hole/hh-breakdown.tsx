// Inside the Joint — the exploded breakdown (rosin rope, wood tip, flower on
// rolling paper) with four labels that reveal on scroll. Server component; the
// breakdown art is the Figma render, labels + pointer lines are real DOM so
// they animate and stay crisp. Reveals via the page-wide controller.

const PARTS = [
  { label: 'Hash Rosin', sub: 'A .5g live rosin rope down the core', side: 'left', top: '8%' },
  { label: 'Premium Indoor Flower', sub: '2g of top-shelf indoor', side: 'right', top: '30%' },
  { label: 'Organic Wood Tip', sub: 'A clean, natural draw', side: 'left', top: '62%' },
  { label: 'All Natural Unrefined Paper', sub: 'Slow, even burn', side: 'right', top: '82%' },
]

export default function HhBreakdown() {
  return (
    <section className="relative overflow-hidden px-6 py-20 md:py-28">
      <h2 className="media-reveal font-display text-center uppercase leading-[0.86] text-[var(--hh-green-deep)]" style={{ fontSize: 'min(13vw, 7rem)' }}>
        Inside the <span className="hh-gold-head">Hole</span>
      </h2>

      <div className="relative mx-auto mt-14 max-w-[1200px]">
        {/* the exploded product */}
        {/* eslint-disable-next-line @next/next/no-img-element -- breakdown art */}
        <img
          src="/products/hash-hole/breakdown.webp"
          alt="Hash Hole broken down — rosin rope, wood tip, flower and rolling paper"
          className="media-reveal mx-auto w-full max-w-[900px]"
        />

        {/* labels — placed around the art on desktop, stacked list on mobile */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:mt-10 md:grid-cols-4">
          {PARTS.map((p, i) => (
            <div key={p.label} className="media-reveal">
              <div className="hh-pointer" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--hh-gold)] text-xs font-extrabold text-[var(--hh-ink)]" style={{ fontFamily: 'var(--font-brand)' }}>
                    {i + 1}
                  </span>
                  <span className="font-display text-lg uppercase leading-none text-[var(--hh-green-deep)] md:text-xl">{p.label}</span>
                </div>
                <p className="mt-1 pl-8 text-[11px] font-bold uppercase tracking-wide text-[var(--hh-ink)]/70 md:text-xs" style={{ fontFamily: 'var(--font-brand)' }}>
                  {p.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
