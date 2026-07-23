// Scrolling text band — big bold movement between sections. Reuses the frozen
// .marquee-track keyframes (GPU transform, pauses on hover).

const WORDS = ['Hash Hole', '2G Indoor Flower', '.5G Live Rosin', 'Organic Wood Tip', 'Playing With Fire']

function Row() {
  return (
    <div className="flex shrink-0 items-center">
      {WORDS.map((w) => (
        <span key={w} className="flex items-center">
          <span className="font-display whitespace-nowrap px-6 uppercase leading-none text-white" style={{ fontSize: 'min(9vw, 5.5rem)' }}>
            {w}
          </span>
          <span aria-hidden className="font-display leading-none text-[var(--hh-gold)]" style={{ fontSize: 'min(9vw, 5.5rem)' }}>
            ⛳
          </span>
        </span>
      ))}
    </div>
  )
}

export default function HhMarquee({ reverse = false }: { reverse?: boolean }) {
  return (
    <section aria-hidden className="mt-8 overflow-hidden bg-[var(--hh-green)] py-4 md:mt-12 md:py-6">
      <div className="marquee-pause flex">
        <div className={`${reverse ? 'marquee-track-reverse' : 'marquee-track'} flex`}>
          <Row />
          <Row />
        </div>
      </div>
    </section>
  )
}
