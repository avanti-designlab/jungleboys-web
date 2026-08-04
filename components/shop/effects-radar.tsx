// Effects radar v2 (Avanti, 2026-08-04: "rainbow gradient style… moody
// vibe" — no yellow, no pointer dots). Dependency-free SVG from
// StrainProfile.effectScores (amendment #5): the polygon IS the data. The
// shape fills with a moody multi-hue gradient, a blurred copy underneath
// gives it a glow, and the vertices are unmarked. Renders nothing without
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

      <defs>
        {/* moody rainbow — dusk purples through magenta into amber and teal */}
        <linearGradient id="radar-mood" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6d28d9" />
          <stop offset="30%" stopColor="#c026d3" />
          <stop offset="55%" stopColor="#f43f5e" />
          <stop offset="78%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
        <filter id="radar-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      {/* the measured shape — glow underlay, gradient body, gradient edge */}
      <polygon points={polygon} fill="url(#radar-mood)" fillOpacity={0.5} filter="url(#radar-glow)" />
      <polygon
        points={polygon}
        fill="url(#radar-mood)"
        fillOpacity={0.72}
        stroke="url(#radar-mood)"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

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
