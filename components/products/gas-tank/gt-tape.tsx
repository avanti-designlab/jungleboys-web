// Scrolling CAUTION tape — a hazard band with the flame triangle repeating
// through it, fenced top and bottom by thin diagonal hazard stripes.
//
// The triangle is the FLAT mark (caution-triangle-flat.svg: the exact Figma
// artwork rotated upright, apex up, level base) drawn as an <img>, not as a CSS
// mask. Masking collapses the whole glyph into one silhouette, which is what
// turned it into an empty tilted triangle with the flame missing.
//
// The stripes tile with a repeating gradient and animate background-position by
// exactly one horizontal period, so they run full width and never cut off — the
// previous version translated an oversized element and clipped at the edges.

const WORDS = ['All Gas. No Brakes.', 'Handle With Fire', 'All-In-One Gas Tank', 'Caution: Loud']

function Row() {
  return (
    <div className="flex shrink-0 items-center">
      {WORDS.map((w) => (
        <span key={w} className="flex items-center">
          <span
            className="font-display whitespace-nowrap px-6 uppercase leading-none text-[var(--gt-black)]"
            style={{ fontSize: 'min(11vw, 4.2rem)' }}
          >
            {w}
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element -- hazard mark */}
          <img
            aria-hidden
            alt=""
            src="/products/gas-tank/caution-triangle-flat.svg"
            className="gt-tri-pulse shrink-0"
            style={{ height: 'min(11.5vw, 4.3rem)', width: 'auto' }}
          />
        </span>
      ))}
    </div>
  )
}

export default function GtTape({ reverse = false }: { reverse?: boolean }) {
  return (
    <section aria-hidden className="gt-band relative z-10 mt-4 overflow-hidden bg-[var(--gt-yellow)] md:mt-8">
      <div className="gt-stripe h-[9px] md:h-[12px]" />
      <div className="marquee-pause flex py-2 md:py-3">
        <div className={`${reverse ? 'marquee-track-reverse' : 'marquee-track'} flex`}>
          <Row />
          <Row />
        </div>
      </div>
      <div className="gt-stripe h-[9px] md:h-[12px]" />
    </section>
  )
}
