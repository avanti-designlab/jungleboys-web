// Hazard-tape marquee band v2 (Avanti: "bigger font — hard to read"). Solid
// yellow band with BIG black Bebas scrolling text, hazard tape striping the
// edges. Content renders twice — the frozen .marquee-track slides 0 → -50%.
function Half({ text }: { text: string }) {
  return (
    <div className="flex shrink-0 items-center">
      {Array.from({ length: 4 }, (_, i) => (
        <span key={i} className="flex shrink-0 items-center">
          <span
            className="font-display whitespace-nowrap px-8 uppercase leading-none text-[var(--orc-ink)]"
            style={{ fontSize: 'min(9vw, 3.4rem)' }}
          >
            {text}
          </span>
          <span aria-hidden className="font-display leading-none text-[var(--orc-ink)]/60" style={{ fontSize: 'min(7vw, 2.4rem)' }}>
            ◆
          </span>
          <span
            className="font-display whitespace-nowrap px-8 uppercase leading-none text-[var(--orc-ink)]/70"
            style={{ fontSize: 'min(9vw, 3.4rem)' }}
          >
            Est 2014
          </span>
          <span aria-hidden className="font-display leading-none text-[var(--orc-ink)]/60" style={{ fontSize: 'min(7vw, 2.4rem)' }}>
            ◆
          </span>
        </span>
      ))}
    </div>
  )
}

export default function OrcHazard({ text = 'Oil Refinery Co.' }: { text?: string }) {
  return (
    <div aria-hidden className="relative overflow-hidden">
      <div className="orc-hazard h-2.5" />
      <div className="bg-[var(--orc-yellow)] py-3">
        <div className="marquee-track flex w-max">
          <Half text={text} />
          <Half text={text} />
        </div>
      </div>
      <div className="orc-hazard h-2.5" />
    </div>
  )
}
