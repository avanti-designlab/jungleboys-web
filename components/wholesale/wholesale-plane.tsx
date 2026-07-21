// On load, the JB fighter plane (Nabis landing art) flies across the hero banner
// right→left and "drops" parachutes that fall and scatter, then gently sway.
// Pure CSS (see .ws-plane / .ws-chute in globals); reduced-motion stills it.

// left = where each parachute lands; delay is staggered right→left so they drop
// as the plane passes overhead. w = size in px.
const CHUTES = [
  { left: '85%', top: '28%', w: 52, delay: 0.6 },
  { left: '71%', top: '58%', w: 78, delay: 1.0 },
  { left: '55%', top: '36%', w: 56, delay: 1.5 },
  { left: '41%', top: '66%', w: 48, delay: 1.9 },
  { left: '24%', top: '44%', w: 68, delay: 2.3 },
  { left: '13%', top: '68%', w: 44, delay: 2.6 },
]

export default function WholesalePlane() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {CHUTES.map((c, i) => (
        <div
          key={i}
          className="ws-chute absolute"
          style={{ left: c.left, top: c.top, width: c.w, ['--delay' as string]: `${c.delay}s` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- transparent art */}
          <img src="/wholesale/parachute.png" alt="" className="h-auto w-full drop-shadow-[0_10px_16px_rgba(0,0,0,0.5)]" />
        </div>
      ))}
      <div className="ws-plane absolute left-0 top-[22%] z-30 w-[min(36vw,460px)]">
        {/* eslint-disable-next-line @next/next/no-img-element -- transparent art */}
        <img src="/wholesale/plane.png" alt="" className="h-auto w-full drop-shadow-[0_18px_34px_rgba(0,0,0,0.6)]" />
      </div>
    </div>
  )
}
