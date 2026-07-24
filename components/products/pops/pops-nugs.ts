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
  x: number // resting spot, % of stage width
  y: number // % of stage height
  size: number // % of stage width
  rot: number
  popAt: number // 0..1 — when it pops into frame
  fallAt: number // 0..1 — when it drops out
  drift: number // sideways sway on the way down, vw
  spin: number // tumble on the way down
  depth: number
}

function lcg(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

// An even scatter over the whole frame (jittered grid, so it fills edge to edge
// with no clumps or bald patches) — they POP into place where they land, then
// fall away under gravity.
export function buildNugField(count: number, seed = 20260724): Nug[] {
  const r = lcg(seed)
  const out: Nug[] = []
  const cols = 20
  const rows = Math.ceil(count / cols)
  for (let i = 0; i < count; i++) {
    const gx = i % cols
    const gy = Math.floor(i / cols)
    const depth = r()
    out.push({
      src: NUG_SRC[i % NUG_SRC.length],
      x: ((gx + 0.5) / cols) * 112 - 6 + (r() - 0.5) * 9,
      y: ((gy + 0.5) / rows) * 112 - 6 + (r() - 0.5) * 9,
      size: 2.2 + depth * 4.2,
      rot: (r() - 0.5) * 300,
      popAt: r(), // scattered pop-in, not a sweep
      fallAt: r() * 0.45,
      drift: (r() - 0.5) * 26,
      spin: (r() - 0.5) * 540,
      depth,
    })
  }
  return out
}
