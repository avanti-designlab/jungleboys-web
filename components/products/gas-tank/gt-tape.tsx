// Scrolling CAUTION tape — a diagonal hazard band with the flame triangle
// repeating through it. Reuses the frozen .marquee-track keyframes; speed is
// scoped to .gt-band so the shared footer marquee is untouched.

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
          {/* the caution triangle, inline in the tape */}
          <span
            aria-hidden
            className="shrink-0 bg-[var(--gt-black)]"
            style={{
              width: 'min(9vw, 3.4rem)',
              height: 'min(8.1vw, 3.06rem)',
              WebkitMaskImage: 'url(/products/gas-tank/caution-triangle.svg)',
              maskImage: 'url(/products/gas-tank/caution-triangle.svg)',
              WebkitMaskSize: 'contain', maskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center', maskPosition: 'center',
            }}
          />
        </span>
      ))}
    </div>
  )
}

export default function GtTape({ reverse = false }: { reverse?: boolean }) {
  return (
    <section aria-hidden className="gt-band relative z-10 overflow-hidden bg-[var(--gt-yellow)] py-3 md:py-4">
      <div className="marquee-pause flex">
        <div className={`${reverse ? 'marquee-track-reverse' : 'marquee-track'} flex`}>
          <Row />
          <Row />
        </div>
      </div>
    </section>
  )
}
