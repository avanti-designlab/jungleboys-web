// Scrolling text band — big bold movement between sections. Reuses the frozen
// .marquee-track keyframes (GPU transform, pauses on hover).

const WORDS: { t: string; mark?: boolean }[] = [
  { t: 'Hash Hole' },
  { t: '2G Indoor Flower' },
  { t: '.5G Live Rosin' },
  { t: 'Organic Wood Tip' },
  { t: 'Playing With Fire', mark: true }, // registered — same superscript as the footer
]

function Row() {
  return (
    <div className="flex shrink-0 items-center">
      {WORDS.map((w) => (
        <span key={w.t} className="flex items-center">
          <span className="font-display whitespace-nowrap px-6 uppercase leading-none text-white" style={{ fontSize: 'min(9vw, 5.5rem)' }}>
            {w.t}
            {w.mark && (
              <span className="relative inline-block top-[0.16em] align-top text-[0.28em] leading-none">®</span>
            )}
          </span>
          <span aria-hidden className="font-display leading-none text-[var(--hh-gold)]" style={{ fontSize: 'min(9vw, 5.5rem)' }}>
            ⛳
          </span>
        </span>
      ))}
    </div>
  )
}

// Desktop margins are deliberately asymmetric: the pinned section above ends
// with ~105px of dead space below its vertically-centred content, so a small
// top margin + a large bottom one is what reads as EVEN on screen.
export default function HhMarquee({ reverse = false }: { reverse?: boolean }) {
  return (
    <section aria-hidden className="my-14 overflow-hidden bg-[var(--hh-green)] py-4 md:mb-28 md:mt-1 md:py-6">
      <div className="marquee-pause flex">
        <div className={`${reverse ? 'marquee-track-reverse' : 'marquee-track'} flex`}>
          <Row />
          <Row />
        </div>
      </div>
    </section>
  )
}
