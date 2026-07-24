'use client'

import { buildSpray } from './pops-nugs'

// Ambient mini-nugs that pop in and out at random spots while you're on the
// page — a fixed, pointer-transparent layer sitting above the stripes but below
// the content pills, so the pops read as playful background life without
// cluttering the type. CSS-only loop (`pops-blip`), staggered per kernel.
// Positions come from a seeded RNG so SSR and client agree.

const SPRAY = buildSpray(22)

export default function PopsSpray() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[35] overflow-hidden">
      {SPRAY.map((n, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- ambient kernel
        <img
          key={i}
          src={n.src}
          alt=""
          className="pops-blip absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${n.x}%`,
            top: `${n.y}%`,
            width: `${n.size}px`,
            animationDelay: `${n.delay}s`,
            animationDuration: `${n.dur}s`,
          }}
        />
      ))}
    </div>
  )
}
