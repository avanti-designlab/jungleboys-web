'use client'

import { useEffect, useMemo, useState } from 'react'

// One-shot flame-emoji burst — fires when the authentic result mounts.
// Pure CSS (per-piece custom props); the global reduced-motion rule hides it.
// Client-only (randomised) to avoid an SSR/hydration mismatch.

export default function FlameBurst({ count = 44 }: { count?: number }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const pieces = useMemo(
    () =>
      Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2
        const dist = 60 + Math.random() * 300
        return {
          left: 40 + Math.random() * 20,
          cx: `${Math.cos(angle) * dist}px`,
          cy: `${Math.sin(angle) * dist * 0.6 + 120 + Math.random() * 320}px`,
          cr: `${Math.random() * 480 - 240}deg`,
          cd: `${1.1 + Math.random() * 1.1}s`,
          cdelay: `${Math.random() * 0.28}s`,
          size: 18 + Math.random() * 20,
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
          className="confetti-piece absolute top-[24%] leading-none"
          style={
            {
              left: `${p.left}%`,
              fontSize: p.size,
              '--cx': p.cx,
              '--cy': p.cy,
              '--cr': p.cr,
              '--cd': p.cd,
              '--cdelay': p.cdelay,
            } as React.CSSProperties
          }
        >
          🔥
        </span>
      ))}
    </div>
  )
}
