// Effects radar (Avanti, 2026-08-04, reference: the Leafly-style spider
// chart) — a dependency-free SVG drawn from StrainProfile.effectScores
// (amendment #5). Static server markup: the polygon IS the data, crawlable,
// theme-aware via currentColor and the accent token. Renders nothing without
// scores — no fabricated shape.

const W = 560
const H = 420
const CX = W / 2
const CY = H / 2
const R = 132
const RINGS = 5
const MAX = 10

export default function EffectsRadar({ scores }: { scores: { name: string; score: number }[] }) {
  if (scores.length < 3) return null

  const angle = (i: number) => (Math.PI * 2 * i) / scores.length - Math.PI / 2
  const point = (i: number, r: number) => [CX + Math.cos(angle(i)) * r, CY + Math.sin(angle(i)) * r] as const

  const polygon = scores
    .map((s, i) => point(i, (Math.min(s.score, MAX) / MAX) * R).join(','))
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Effects: ${scores.map((s) => `${s.name} ${s.score} of ${MAX}`).join(', ')}`}
      className="mx-auto w-full max-w-md"
    >
      {/* rings + spokes */}
      {Array.from({ length: RINGS }, (_, r) => (
        <circle
          key={r}
          cx={CX}
          cy={CY}
          r={((r + 1) / RINGS) * R}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.16}
        />
      ))}
      {scores.map((_, i) => {
        const [x, y] = point(i, R)
        return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="currentColor" strokeOpacity={0.16} />
      })}

      {/* the measured shape */}
      <polygon points={polygon} fill="var(--color-accent)" fillOpacity={0.55} stroke="var(--color-accent)" strokeWidth={2.5} strokeLinejoin="round" />
      {scores.map((s, i) => {
        const [x, y] = point(i, (Math.min(s.score, MAX) / MAX) * R)
        return <circle key={s.name} cx={x} cy={y} r={4} fill="currentColor" />
      })}

      {/* labels */}
      {scores.map((s, i) => {
        const [x, y] = point(i, R + 26)
        const anchor = Math.abs(x - CX) < 12 ? 'middle' : x > CX ? 'start' : 'end'
        return (
          <text
            key={s.name}
            x={x}
            y={y + 4}
            textAnchor={anchor}
            fill="currentColor"
            style={{ fontFamily: 'var(--font-brand)', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            {s.name}
          </text>
        )
      })}
    </svg>
  )
}
