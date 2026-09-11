// Hazard-tape marquee band — the page's section divider. CSS stripes (never
// blur) + the frozen .marquee-track keyframes: the track slides 0 → -50%, so
// the content renders twice for a seamless loop.
function Half({ text }: { text: string }) {
  return (
    <div className="flex shrink-0 items-center">
      {Array.from({ length: 6 }, (_, i) => (
        <span
          key={i}
          className="mx-3 inline-flex shrink-0 items-center gap-5 rounded-full bg-[var(--orc-ink)] px-6 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.3em] text-[var(--orc-yellow)]"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          <span className="whitespace-nowrap">{text}</span>
          <span aria-hidden className="text-[0.8em]">◆</span>
          <span className="whitespace-nowrap">EST 2014</span>
        </span>
      ))}
    </div>
  )
}

export default function OrcHazard({ text = 'OIL REFINERY CO.' }: { text?: string }) {
  return (
    <div aria-hidden className="orc-hazard relative overflow-hidden py-2.5">
      <div className="marquee-track flex w-max">
        <Half text={text} />
        <Half text={text} />
      </div>
    </div>
  )
}
