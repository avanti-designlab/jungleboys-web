// Ghost-outline lineup marquee — huge Bebas outline type sliding between
// sections, every 4th word solid gold. The frozen .marquee-track slides
// 0 → -50%, so the run renders twice.
const WORDS = ['Live Resin', 'Batter', 'Budder', 'Sugar Trim']

function Half() {
  return (
    <div className="flex shrink-0 items-center">
      {Array.from({ length: 3 }, (_, r) =>
        WORDS.map((w, i) => (
          <span key={`${r}-${w}`} className="flex items-center">
            <span
              className={`font-display whitespace-nowrap px-8 uppercase leading-none ${
                (r * WORDS.length + i) % 4 === 3 ? 'orc-outline-solid' : 'orc-outline'
              }`}
              style={{ fontSize: 'min(16vw, 9rem)' }}
            >
              {w}
            </span>
            <span aria-hidden className="font-display leading-none text-[var(--orc-gold)]/60" style={{ fontSize: 'min(8vw, 3rem)' }}>
              ✦
            </span>
          </span>
        ))
      )}
    </div>
  )
}

export default function OrcOutlineMarquee() {
  return (
    <div aria-hidden className="overflow-hidden py-6 md:py-10">
      <div className="marquee-track flex w-max">
        <Half />
        <Half />
      </div>
    </div>
  )
}
