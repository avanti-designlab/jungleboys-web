'use client'

import { buildSectionSpray } from './pops-nugs'

// Ambient mini-nugs that pop in and out WITHIN a section (not a fixed screen
// overlay) — so they scroll with the section and only show while you're in it.
// Rendered as the FIRST child of a section's content pill, so it sits BEHIND
// the text/cards (content always covers it), and positions are confined to the
// empty top/bottom margin bands so they never land on the centred content.
// Seeded RNG → SSR and client agree. None of these on the hero.

export default function PopsSectionSpray({ seed = 4242 }: { seed?: number }) {
  const nugs = buildSectionSpray(9, seed)
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {nugs.map((n, i) => (
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
