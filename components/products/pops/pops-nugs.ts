// Deterministic nug field. Positions MUST be identical on the server and the
// client or React hydration mismatches, so this uses a seeded LCG rather than
// Math.random — same seed, same field, every render.

export const NUG_SRC = [
  '/products/pops/nug-a.webp',
  '/products/pops/nug-b.webp',
  '/products/pops/nug-c.webp',
  '/products/pops/nug-d.webp',
] as const

export type Nug = {
  src: string
  x: number // target, % of stage
  y: number
  size: number // % of stage width
  rot: number
  spin: number
  wave: number // which pop-off burst it belongs to
  depth: number // 0 = far/small/dim, 1 = near
}

function lcg(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

// Erupting field: spread across the stage, biased outward and upward so the
// centre stays legible once the wordmark arrives.
export function buildNugField(count: number, seed = 20260724): Nug[] {
  const r = lcg(seed)
  const out: Nug[] = []
  for (let i = 0; i < count; i++) {
    const depth = r()
    // fan the targets out from the bucket mouth
    const angle = -Math.PI / 2 + (r() - 0.5) * 2.35
    const reach = 26 + r() * 52
    const x = 50 + Math.cos(angle) * reach * 1.32
    const y = 56 + Math.sin(angle) * reach * 1.02
    out.push({
      src: NUG_SRC[i % NUG_SRC.length],
      x: Math.max(-6, Math.min(106, x)),
      y: Math.max(-8, Math.min(92, y)),
      size: 4.5 + depth * 8.5,
      rot: (r() - 0.5) * 90,
      spin: (r() - 0.5) * 420,
      wave: i % 5,
      depth,
    })
  }
  return out
}
