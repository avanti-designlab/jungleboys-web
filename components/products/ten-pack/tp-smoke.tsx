'use client'

import { useEffect, useRef } from 'react'

// REAL SMOKE — not a photo of smoke being moved around.
//
// The previous version drifted a single smoke bitmap. However you animate a
// bitmap it can only translate, scale and rotate: the texture itself never
// deforms, and the eye reads that instantly as "a picture that is moving".
// Smoke reads as smoke because it STRETCHES — wisps get drawn out into
// filaments, fold back on themselves, and thin away to nothing.
//
// So this is an actual fluid. A density field is advected through a curl-noise
// velocity field. Curl noise is divergence-free by construction, which is the
// whole trick: it swirls like a real incompressible fluid without a pressure
// solve, and the pressure solve is the expensive half of a normal fluid sim.
//
// The velocity field is precomputed as a few slices through 3D noise and
// cross-faded in a cycle, so the flow keeps evolving for the price of a lerp
// per frame instead of ~200k noise samples per frame.
//
// Cost discipline (the lesson from gt-snow, which first shipped at 13fps):
// nothing per-cell touches ctx, the sim runs at a fixed grid size regardless of
// how big the panel is, and the whole thing is parked when off-screen.

// Sim grid — fixed, so cost never scales with panel size. This is deliberately
// high: at 300x170 the field upscaled into soft fog with no readable wisps, and
// the whole point is DEFINED smoke. The frame budget measured at ~1ms, so the
// resolution is where that headroom goes.
const GW = 560
const GH = 320
// Velocity grid. This governs eddy SIZE: at 76x44 the smallest eddy the field
// could represent was ~100px on screen, which is why the smoke came out as soft
// blobs rather than wisps.
const VW = 140
const VH = 80
const SLICES = 6 // noise slices cross-faded in a cycle
const VIEW_SCALE = 2 // backing store = grid x this; CSS stretches the rest

function makeValueNoise(seed: number) {
  let s = seed >>> 0
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
  const perm = new Uint8Array(256)
  for (let i = 0; i < 256; i++) perm[i] = i
  for (let i = 255; i > 0; i--) {
    const j = (rnd() * (i + 1)) | 0
    const t = perm[i]
    perm[i] = perm[j]
    perm[j] = t
  }
  const P = new Uint8Array(512)
  for (let i = 0; i < 512; i++) P[i] = perm[i & 255]
  const G = new Float32Array(256)
  for (let i = 0; i < 256; i++) G[i] = rnd() * 2 - 1

  const at = (i: number, j: number, k: number) => G[P[(P[(P[i & 255] + j) & 255] + k) & 255]]
  const fade = (t: number) => t * t * (3 - 2 * t)

  return (x: number, y: number, z: number) => {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z)
    const u = fade(x - xi), v = fade(y - yi), w = fade(z - zi)
    const a000 = at(xi, yi, zi), a100 = at(xi + 1, yi, zi)
    const a010 = at(xi, yi + 1, zi), a110 = at(xi + 1, yi + 1, zi)
    const a001 = at(xi, yi, zi + 1), a101 = at(xi + 1, yi, zi + 1)
    const a011 = at(xi, yi + 1, zi + 1), a111 = at(xi + 1, yi + 1, zi + 1)
    const c00 = a000 + u * (a100 - a000), c10 = a010 + u * (a110 - a010)
    const c01 = a001 + u * (a101 - a001), c11 = a011 + u * (a111 - a011)
    const c0 = c00 + v * (c10 - c00), c1 = c01 + v * (c11 - c01)
    return c0 + w * (c1 - c0)
  }
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export default function TpSmoke({
  from = 'bottom',
  tint = [232, 243, 255],
  strength = 1,
  seed = 1,
  className = '',
}: {
  from?: 'bottom' | 'left'
  tint?: [number, number, number]
  strength?: number
  seed?: number
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const view = canvasRef.current
    if (!view) return
    const vctx = view.getContext('2d')
    if (!vctx) return

    view.width = GW * VIEW_SCALE
    view.height = GH * VIEW_SCALE

    // the sim renders at grid size, then gets scaled up once — per-pixel work
    // stays at 51k cells no matter how large the panel is
    const buf = document.createElement('canvas')
    buf.width = GW
    buf.height = GH
    const bctx = buf.getContext('2d')
    if (!bctx) return
    const img = bctx.createImageData(GW, GH)
    const px = img.data

    const noise = makeValueNoise(seed * 7919 + 13)

    // --- precompute the velocity slices (once) -----------------------------
    // psi is a scalar potential; its curl is the velocity, and the curl of any
    // scalar field is divergence-free — which is why this swirls instead of
    // sucking mass in and out of nowhere.
    const F = 12.0 / VW
    const psi = (x: number, y: number, z: number) =>
      noise(x * F, y * F * 1.6, z) +
      0.5 * noise(x * F * 2.4, y * F * 3.8, z * 1.7) +
      0.22 * noise(x * F * 5.1, y * F * 8.0, z * 2.3)

    const U = new Float32Array(SLICES * VW * VH)
    const V = new Float32Array(SLICES * VW * VH)
    const e = 1.0
    for (let s = 0; s < SLICES; s++) {
      const z = s * 1.37
      const off = s * VW * VH
      for (let y = 0; y < VH; y++) {
        for (let x = 0; x < VW; x++) {
          const i = off + y * VW + x
          U[i] = (psi(x, y + e, z) - psi(x, y - e, z)) / (2 * e)
          V[i] = -(psi(x + e, y, z) - psi(x - e, y, z)) / (2 * e)
        }
      }
    }
    // normalise so the flow speed is predictable regardless of the noise seed
    let peak = 0
    for (let i = 0; i < U.length; i++) peak = Math.max(peak, Math.abs(U[i]), Math.abs(V[i]))
    const norm = peak > 0 ? 1 / peak : 1
    for (let i = 0; i < U.length; i++) { U[i] *= norm; V[i] *= norm }

    const vu = new Float32Array(VW * VH)
    const vv = new Float32Array(VW * VH)

    let dens = new Float32Array(GW * GH)
    let next = new Float32Array(GW * GH)

    // Edge falloff, folded together with strength and the 0-255 scale into one
    // precomputed multiplier — a hard boundary on a full-bleed panel reads as a
    // cut line, which is exactly what the old plate approach kept doing.
    const amp = new Float32Array(GW * GH)
    for (let y = 0; y < GH; y++) {
      for (let x = 0; x < GW; x++) {
        const fx = Math.min(smooth(0, GW * 0.14, x), smooth(0, GW * 0.14, GW - 1 - x))
        const fy = Math.min(smooth(0, GH * 0.14, y), smooth(0, GH * 0.14, GH - 1 - y))
        amp[y * GW + x] = fx * fy * strength * 255
      }
    }

    // RGB never changes, so write it once and let the loop touch alpha only
    const [tr, tg, tb] = tint
    for (let i = 0; i < GW * GH; i++) {
      const o = i << 2
      px[o] = tr
      px[o + 1] = tg
      px[o + 2] = tb
    }
    vctx.imageSmoothingEnabled = true
    vctx.imageSmoothingQuality = 'medium'
    vctx.globalCompositeOperation = 'copy'

    const fromLeft = from === 'left'
    const SWIRL = 16.0 // how hard the curl field pushes, in cells/frame
    const RISE = fromLeft ? 1.4 : 6.0
    const DRIFT = fromLeft ? 6.0 : 1.0

    const sampleDens = (x: number, y: number) => {
      if (x < 0) x = 0; else if (x > GW - 1.001) x = GW - 1.001
      if (y < 0) y = 0; else if (y > GH - 1.001) y = GH - 1.001
      const x0 = x | 0, y0 = y | 0
      const fx = x - x0, fy = y - y0
      const i = y0 * GW + x0
      const a = dens[i] + fx * (dens[i + 1] - dens[i])
      const b = dens[i + GW] + fx * (dens[i + GW + 1] - dens[i + GW])
      return a + fy * (b - a)
    }

    let raf = 0
    let t = 0
    let running = false

    const step = () => {
      t += 1

      // cross-fade two velocity slices — the flow itself keeps changing, which
      // is what stops the smoke settling into a repeating loop
      const fz = (t * 0.0022) % SLICES
      const s0 = fz | 0
      const s1 = (s0 + 1) % SLICES
      const w = fz - s0
      const ws = w * w * (3 - 2 * w)
      const o0 = s0 * VW * VH
      const o1 = s1 * VW * VH
      for (let i = 0; i < VW * VH; i++) {
        vu[i] = U[o0 + i] + ws * (U[o1 + i] - U[o0 + i])
        vv[i] = V[o0 + i] + ws * (V[o1 + i] - V[o0 + i])
      }

      // --- advect ---------------------------------------------------------
      const sx = (VW - 1) / (GW - 1)
      const sy = (VH - 1) / (GH - 1)
      for (let y = 0; y < GH; y++) {
        const vy = y * sy
        const vy0 = vy | 0
        const vfy = vy - vy0
        const vrow = vy0 * VW
        const vrow2 = vy0 < VH - 1 ? vrow + VW : vrow
        for (let x = 0; x < GW; x++) {
          const vx = x * sx
          const vx0 = vx | 0
          const vfx = vx - vx0
          const vx1 = vx0 < VW - 1 ? vx0 + 1 : vx0

          const ua = vu[vrow + vx0] + vfx * (vu[vrow + vx1] - vu[vrow + vx0])
          const ub = vu[vrow2 + vx0] + vfx * (vu[vrow2 + vx1] - vu[vrow2 + vx0])
          const va = vv[vrow + vx0] + vfx * (vv[vrow + vx1] - vv[vrow + vx0])
          const vb = vv[vrow2 + vx0] + vfx * (vv[vrow2 + vx1] - vv[vrow2 + vx0])

          const u = (ua + vfy * (ub - ua)) * SWIRL + DRIFT
          const v = (va + vfy * (vb - va)) * SWIRL - RISE

          // trace backwards and read where this parcel came from
          // Dissipation is the important number here: a parcel crosses the
          // panel in ~90 frames and 0.986^90 is about a quarter, so smoke
          // arrives dense and leaves thin. That gradient is the wisp.
          next[y * GW + x] = sampleDens(x - u, y - v) * 0.986
        }
      }
      const swap = dens
      dens = next
      next = swap

      // --- inject ---------------------------------------------------------
      // a noise-modulated source, so plumes swell and die instead of pouring
      // out at a constant rate
      const NP = 6
      const plume = (q: number) => {
        let g = 0
        for (let k = 0; k < NP; k++) {
          const c = (k + 0.5) / NP + 0.1 * noise(k * 13.7, t * 0.003, 5)
          const w = 0.055 + 0.035 * (0.5 + 0.5 * noise(k * 3.1, t * 0.0025, 9))
          const dq = (q - c) / w
          g += Math.exp(-0.5 * dq * dq)
        }
        if (g > 1) g = 1
        return g * (0.35 + 0.65 * (0.5 + 0.5 * noise(q * 26, t * 0.012, 21))) * 0.9
      }
      if (fromLeft) {
        for (let y = 0; y < GH; y++) {
          const a = plume(y / GH)
          for (let x = 0; x < 8; x++) { const i = y * GW + x; if (a > dens[i]) dens[i] = a }
        }
      } else {
        for (let x = 0; x < GW; x++) {
          const a = plume(x / GW)
          for (let y = GH - 9; y < GH; y++) { const i = y * GW + x; if (a > dens[i]) dens[i] = a }
        }
      }

      // --- draw -----------------------------------------------------------
      // RGB is constant and was written once at setup; only alpha moves. The
      // smoothstep is inlined because a function call 51k times a frame is not
      // free at this rate.
      for (let i = 0; i < GW * GH; i++) {
        const d = dens[i]
        let a = 0
        if (d > 0.04) {
          let t = (d - 0.04) * 1.5152 // 1 / (0.70 - 0.04)
          if (t > 1) t = 1
          a = t * t * (3 - 2 * t) * amp[i]
        }
        px[(i << 2) + 3] = a
      }
      bctx.putImageData(img, 0, 0)
      // 'copy' replaces the destination outright, which saves a separate
      // full-canvas clear pass every frame
      vctx.drawImage(buf, 0, 0, view.width, view.height)
    }

    const loop = () => {
      let extra = 0
      while (warm > 0 && extra < 4) { step(); warm--; extra++ }
      step()
      raf = requestAnimationFrame(loop)
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Open already full of smoke rather than filling up while you watch. Doing
    // that by simulating from empty cost ~220 blocking steps per canvas on
    // mount; seeding the field straight from noise and letting the sim only
    // round it off gets the same look for a fraction of the main-thread hit.
    for (let y = 0; y < GH; y++) {
      for (let x = 0; x < GW; x++) {
        const n =
          0.5 + 0.5 * noise(x * 0.024, y * 0.032, 3.1) +
          0.25 * noise(x * 0.059, y * 0.075, 8.7)
        // bias the fill toward whichever edge the smoke feeds from
        const lean = fromLeft ? 1 - (x / GW) * 0.55 : 0.45 + (y / GH) * 0.55
        dens[y * GW + x] = Math.max(0, Math.min(1, (n - 0.5) * 1.4)) * lean
      }
    }
    // The field needs a few hundred steps before the flow has drawn it out into
    // proper filaments. Running those synchronously blocked the main thread for
    // ~200ms per canvas, so they are burned down a few per frame instead, under
    // a fade-in — by the time the panel is fully opaque the smoke has settled.
    let warm = 320
    for (let i = 0; i < 12; i++) { step(); warm-- }
    view.style.opacity = '0'
    view.style.transition = 'opacity 1.1s ease-out'
    requestAnimationFrame(() => { view.style.opacity = '1' })

    if (reduced) return () => { cancelAnimationFrame(raf) }

    // only burn frames while the panel is actually on screen
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true
          raf = requestAnimationFrame(loop)
        } else if (!entry.isIntersecting && running) {
          running = false
          cancelAnimationFrame(raf)
        }
      },
      { rootMargin: '120px' }
    )
    io.observe(view)

    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
    // primitives, not the array itself — a literal prop is a new array every
    // render and would tear the sim down and rebuild it each time
  }, [from, tint[0], tint[1], tint[2], strength, seed])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  )
}
