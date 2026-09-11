// Honey/rosin curtain v3 (Avanti: v2's div bars "looked really unrealistic")
// — ONE hand-built SVG silhouette: an irregular melted edge with teardrop
// tongues, a deep amber→gold gradient, glossy highlight streaks down the
// thick tongues and a wet bead of light on each bulb. The whole sheet
// breathes (slow viscous scaleY) and two tongues shed a droplet on a long
// cycle. preserveAspectRatio slices so the shapes never stretch. The
// sampler-transparent [data-nav-ignore] keeps the header's color probe
// looking through it at the page.

type Tongue = { x: number; w: number; l: number }
const TONGUES: Tongue[] = [
  { x: 70, w: 26, l: 150 },
  { x: 185, w: 14, l: 66 },
  { x: 305, w: 40, l: 215 },
  { x: 425, w: 18, l: 92 },
  { x: 545, w: 30, l: 168 },
  { x: 655, w: 15, l: 58 },
  { x: 770, w: 46, l: 235 },
  { x: 905, w: 20, l: 118 },
  { x: 1025, w: 34, l: 185 },
  { x: 1150, w: 16, l: 72 },
  { x: 1255, w: 28, l: 142 },
  { x: 1380, w: 22, l: 98 },
]
const EDGE = 34

function curtainPath(): string {
  let d = `M 0 0 L 0 ${EDGE}`
  let prev = 0
  for (const t of TONGUES) {
    const xl = t.x - t.w / 2
    const xr = t.x + t.w / 2
    const tip = EDGE + t.l
    const bulb = t.w * 0.55
    // sagging edge between the previous tongue and this one
    d += ` Q ${(prev + xl) / 2} ${EDGE + 12} ${xl} ${EDGE}`
    // left flank narrows toward the bulb
    d += ` C ${t.x - t.w * 0.62} ${EDGE + t.l * 0.42} ${t.x - t.w * 0.3} ${tip - bulb * 1.4} ${t.x - t.w * 0.28} ${tip - bulb}`
    // round bulb bottom
    d += ` C ${t.x - t.w * 0.32} ${tip + bulb * 0.5} ${t.x + t.w * 0.32} ${tip + bulb * 0.5} ${t.x + t.w * 0.28} ${tip - bulb}`
    // right flank back to the edge
    d += ` C ${t.x + t.w * 0.3} ${tip - bulb * 1.4} ${t.x + t.w * 0.62} ${EDGE + t.l * 0.42} ${xr} ${EDGE}`
    prev = xr
  }
  d += ` Q ${(prev + 1440) / 2} ${EDGE + 12} 1440 ${EDGE} L 1440 0 Z`
  return d
}

const PATH = curtainPath()
const THICK = TONGUES.filter((t) => t.w >= 26)

export default function OrcDrips() {
  return (
    <div
      aria-hidden
      data-nav-ignore
      className="pointer-events-none absolute inset-x-0 top-0 z-20 h-72 [filter:drop-shadow(0_14px_30px_rgba(0,0,0,0.55))_drop-shadow(0_6px_18px_rgba(245,163,0,0.18))]"
    >
      <svg
        viewBox="0 0 1440 300"
        preserveAspectRatio="xMidYMin slice"
        className="orc-curtain h-full w-full"
      >
        <defs>
          <linearGradient id="orc-honey" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5d3f06" />
            <stop offset="0.22" stopColor="#9c6403" />
            <stop offset="0.5" stopColor="#d98c00" />
            <stop offset="0.74" stopColor="#f5a300" />
            <stop offset="0.9" stopColor="#ffc400" />
            <stop offset="1" stopColor="#ffe484" />
          </linearGradient>
          <linearGradient id="orc-honey-sheen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d={PATH} fill="url(#orc-honey)" />
        {/* wet sheen along the pooled top edge */}
        <rect x="0" y="0" width="1440" height="16" fill="url(#orc-honey-sheen)" />

        {/* glossy streak down each thick tongue + a bead of light on the bulb */}
        {THICK.map((t) => {
          const tip = EDGE + t.l
          const hx = t.x - t.w * 0.16
          return (
            <g key={t.x}>
              <path
                d={`M ${hx} ${EDGE + 14} C ${hx - t.w * 0.06} ${EDGE + t.l * 0.4} ${hx} ${EDGE + t.l * 0.62} ${hx + t.w * 0.04} ${tip - t.w * 0.9}`}
                stroke="#ffffff"
                strokeOpacity="0.28"
                strokeWidth={Math.max(3, t.w * 0.16)}
                strokeLinecap="round"
                fill="none"
              />
              <ellipse
                cx={t.x - t.w * 0.13}
                cy={tip - t.w * 0.42}
                rx={t.w * 0.13}
                ry={t.w * 0.2}
                fill="#ffffff"
                opacity="0.35"
              />
            </g>
          )
        })}

        {/* two droplets on long offset cycles — form at the tip, fall, fade.
            Position lives on the parent <g> ATTRIBUTE: the CSS animation's
            transform would override an attribute transform on the same node. */}
        {[TONGUES[6], TONGUES[2]].map((t, i) => (
          <g key={i} transform={`translate(${t.x} ${EDGE + t.l + t.w * 0.4})`}>
            <path
              className="orc-droplet"
              style={{ animationDelay: `${i === 0 ? 2 : 9}s` }}
              d="M 0 -10 C 5 -3 7 1 7 5 A 7 7 0 1 1 -7 5 C -7 1 -5 -3 0 -10 Z"
              fill="#ffc400"
            />
          </g>
        ))}
      </svg>
    </div>
  )
}
