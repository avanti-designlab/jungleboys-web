// Honey/rosin drip curtain hanging from the top of the hero (Avanti v2:
// "have some honey/rosin dripping from the top of the screen"). Pure
// CSS/divs — each drip slowly stretches and periodically sheds a falling
// droplet; widths, lengths and delays vary so the curtain never reads as a
// pattern. aria-hidden decoration, reduced-motion turns it static.
const DRIPS: { left: string; w: number; h: number; delay: number }[] = [
  { left: '3%', w: 26, h: 120, delay: 0 },
  { left: '11%', w: 16, h: 72, delay: 2.4 },
  { left: '19%', w: 34, h: 180, delay: 0.9 },
  { left: '28%', w: 14, h: 58, delay: 4.1 },
  { left: '36%', w: 22, h: 140, delay: 1.7 },
  { left: '47%', w: 30, h: 96, delay: 3.2 },
  { left: '58%', w: 16, h: 200, delay: 0.4 },
  { left: '66%', w: 24, h: 84, delay: 5.0 },
  { left: '75%', w: 36, h: 150, delay: 2.0 },
  { left: '85%', w: 18, h: 110, delay: 3.8 },
  { left: '93%', w: 26, h: 66, delay: 1.2 },
]

export default function OrcDrips() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-20 h-64">
      {/* the pooled edge the drips hang from */}
      <span className="absolute inset-x-0 top-0 h-3 bg-[linear-gradient(180deg,#ffd400,#f5a300)]" />
      {DRIPS.map((d, i) => (
        <span
          key={i}
          className="orc-drip"
          style={{ left: d.left, width: d.w, height: d.h, animationDelay: `${d.delay}s` }}
        />
      ))}
    </div>
  )
}
