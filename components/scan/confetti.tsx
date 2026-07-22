'use client'

import { useEffect, useMemo, useState } from 'react'

// One-shot gold confetti burst — fires when the authentic result mounts.
// Pure CSS (per-piece custom props); the global reduced-motion rule hides it.
// Client-only (randomised) to avoid an SSR/hydration mismatch.

const GOLD = ['#FECF0E', '#FFE47A', '#C9A200', '#FFFFFF', '#F5B400']

export default function Confetti({ count = 70 }: { count?: number }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2
        const dist = 60 + Math.random() * 300
        return {
          left: 42 + Math.random() * 16, // vw-ish start band, near the badge
          cx: `${Math.cos(angle) * dist}px`,
          cy: `${Math.sin(angle) * dist * 0.6 + 120 + Math.random() * 320}px`, // gravity bias
          cr: `${Math.random() * 720 - 360}deg`,
          cd: `${1 + Math.random() * 1.1}s`,
          cdelay: `${Math.random() * 0.25}s`,
          w: 5 + Math.random() * 6,
          h: 8 + Math.random() * 8,
          color: GOLD[Math.floor(Math.random() * GOLD.length)],
          round: Math.random() > 0.6,
        }
      }),
    [count]
  )

  if (!mounted) return null

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece absolute top-[26%]"
          style={
            {
              left: `${p.left}%`,
              width: p.w,
              height: p.h,
              background: p.color,
              borderRadius: p.round ? '50%' : '1px',
              '--cx': p.cx,
              '--cy': p.cy,
              '--cr': p.cr,
              '--cd': p.cd,
              '--cdelay': p.cdelay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
