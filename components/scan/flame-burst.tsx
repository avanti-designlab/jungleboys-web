'use client'

import { useEffect, useMemo, useState } from 'react'

// Flames rising up the screen — fills the authentic-verify screen with fire
// that climbs and fades. Pure CSS (per-piece custom props); client-only to
// avoid a hydration mismatch; the global reduced-motion rule hides it.

export default function FlameBurst({ count = 30 }: { count?: number }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    // play once, then remove the layer entirely (longest flame ≈ 5.2s + 3s delay)
    const t = setTimeout(() => setMounted(false), 8600)
    return () => clearTimeout(t)
  }, [])

  const pieces = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        dx: `${Math.random() * 60 - 30}px`,
        dy: `${-(68 + Math.random() * 34)}vh`,
        s0: (0.45 + Math.random() * 0.4).toFixed(2),
        s1: (0.9 + Math.random() * 0.7).toFixed(2),
        rot: `${Math.random() * 40 - 20}deg`,
        cd: `${2.6 + Math.random() * 2.6}s`,
        cdelay: `${Math.random() * 3}s`,
        size: 18 + Math.random() * 24,
      })),
    [count]
  )

  if (!mounted) return null

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="flame-rise absolute bottom-[-4%] leading-none will-change-transform"
          style={
            {
              left: `${p.left}%`,
              fontSize: p.size,
              '--dx': p.dx,
              '--dy': p.dy,
              '--s0': p.s0,
              '--s1': p.s1,
              '--rot': p.rot,
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
