// Deterministic nug field. Positions MUST be identical on the server and the
// client or React hydration mismatches, so this uses a seeded LCG rather than
// Math.random — same seed, same field, every render.
//
// These are the small POPS kernels (the bite-size nugs), not the full-size
// flower cutouts — the whole point of the product.

export const NUG_SRC = [
  '/products/pops/pop-1.webp',
  '/products/pops/pop-2.webp',
  '/products/pops/pop-3.webp',
  '/products/pops/pop-4.webp',
  '/products/pops/pop-5.webp',
  '/products/pops/pop-6.webp',
] as const

export type Nug = {
  src: string
  dx: number // travel from the bucket mouth, in vw
  dy: number // …and in vh
  size: number // % of stage width
  rot: number
  wave: number // which pop-off burst it belongs to
  depth: number // 0 = far/small/dim, 1 = near
  lead: number // 0..1 stagger position within the eruption
}

function lcg(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

// A dense fountain out of the bucket mouth: a tight cone at the base that
// widens as it rises, with plenty of kernels staying close to the rim so the
// stream visibly pours OUT of the bucket rather than teleporting to the edges.
export function buildNugField(count: number, seed = 20260724): Nug[] {
  const r = lcg(seed)
  const out: Nug[] = []
  for (let i = 0; i < count; i++) {
    const depth = r()
    const t = r() // 0 = hugs the mouth, 1 = flung to the far edge
    const reach = Math.pow(t, 0.72) // biased toward the bucket
    // the cone opens up the further a kernel travels
    const spread = 0.22 + reach * 1.42
    const angle = -Math.PI / 2 + (r() - 0.5) * 2 * spread
    out.push({
      src: NUG_SRC[i % NUG_SRC.length],
      dx: Math.cos(angle) * reach * 78,
      dy: Math.sin(angle) * reach * 74 - reach * 6, // a touch of lift
      size: 1.5 + depth * 3.6,
      rot: (r() - 0.5) * 300,
      wave: i % 6,
      depth,
      lead: t,
    })
  }
  return out
}
