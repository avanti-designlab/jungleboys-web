'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

// REAL FIRE (and real vapor), no asset. A heat-propagation simulation (the
// classic Doom fire): a source row is held at temperature and every cell above
// it inherits its neighbour's heat minus a random cooling step, so the shape is
// genuinely simulated rather than an animated gradient.
//
// It runs at buffer resolution (180x150) and is stretched to the section by
// CSS — the browser's own bilinear filtering is what gives the soft edges, so
// the whole thing costs ~27k cells a frame and no texture memory.
//
// TWO MODES off the same solver:
//   fire  — source spans the full width, cells rise nearly straight up.
//   vapor — source is a narrow plume at `plumeX`, cells cool slowly (so it
//           climbs much further) and fan away from the plume axis as they rise,
//           which is what turns a column into a billowing cloud. Cool palette.
//
// `setIntensity` is driven by the host section's ScrollTrigger — scrolling is
// what feeds the fire, and what pulls on the tank.

export type GtFireHandle = { setIntensity: (v: number) => void }

// Buffer dimensions are per-mode and must roughly MATCH the canvas's rendered
// aspect. The buffer is stretched to the element by CSS, so a 180x150 grid
// drawn into a wide short box squashes every plume into a horizontal smear —
// which is exactly what the vapor looked like before this was split out.
const DIMS = { fire: { w: 180, h: 150 }, vapor: { w: 300, h: 118 } }
const PMAX = 63
const FRAME_MS = 1000 / 32

type Stops = [number, [number, number, number, number]][]

// black → ember → JB red → orange → yellow → white-hot
const FIRE_STOPS: Stops = [
  [0, [0, 0, 0, 0]],
  [5, [56, 6, 2, 55]],
  [15, [150, 13, 5, 165]],
  [27, [225, 27, 11, 235]],
  [41, [255, 122, 24, 255]],
  [54, [251, 205, 3, 255]],
  [63, [255, 247, 218, 255]],
]

// clear → haze → dense white
const VAPOR_STOPS: Stops = [
  [0, [255, 255, 255, 0]],
  [8, [236, 238, 245, 26]],
  [20, [244, 245, 250, 96]],
  [36, [250, 251, 255, 178]],
  [50, [253, 253, 255, 226]],
  [63, [255, 255, 255, 252]],
]

function buildPalette(stops: Stops) {
  const pal = new Uint32Array(PMAX + 1)
  for (let i = 0; i <= PMAX; i++) {
    let a = stops[0]
    let b = stops[stops.length - 1]
    for (let s = 0; s < stops.length - 1; s++) {
      if (i >= stops[s][0] && i <= stops[s + 1][0]) {
        a = stops[s]
        b = stops[s + 1]
        break
      }
    }
    const t = b[0] === a[0] ? 0 : (i - a[0]) / (b[0] - a[0])
    const r = Math.round(a[1][0] + (b[1][0] - a[1][0]) * t)
    const g = Math.round(a[1][1] + (b[1][1] - a[1][1]) * t)
    const bl = Math.round(a[1][2] + (b[1][2] - a[1][2]) * t)
    const al = Math.round(a[1][3] + (b[1][3] - a[1][3]) * t)
    // little-endian ABGR
    pal[i] = (al << 24) | (bl << 16) | (g << 8) | r
  }
  return pal
}

type Props = {
  className?: string
  /** second canvas drawn from the same sim, cropped to its hottest band */
  frontClassName?: string
  mode?: 'fire' | 'vapor'
  /** vapor only: horizontal centre of the plume, 0–1 across the canvas */
  plumeX?: number
  /** starting intensity before any scroll drives it */
  initial?: number
}

const GtFire = forwardRef<GtFireHandle, Props>(function GtFire(
  { className = '', frontClassName = '', mode = 'fire', plumeX = 0.5, initial = 0.22 },
  ref
) {
  const backRef = useRef<HTMLCanvasElement>(null)
  const frontRef = useRef<HTMLCanvasElement>(null)
  const intensity = useRef(initial)

  useImperativeHandle(ref, () => ({
    setIntensity: (v: number) => {
      intensity.current = Math.max(0, Math.min(1, v))
    },
  }), [])

  useEffect(() => {
    const back = backRef.current
    const front = frontRef.current
    if (!back) return

    const bctx = back.getContext('2d')
    const fctx = front?.getContext('2d') ?? null
    if (!bctx) return

    const vapor = mode === 'vapor'
    const { w: BW, h: BH } = vapor ? DIMS.vapor : DIMS.fire
    const pal = buildPalette(vapor ? VAPOR_STOPS : FIRE_STOPS)
    const buf = new Uint8Array(BW * BH)
    const img = bctx.createImageData(BW, BH)
    const px = new Uint32Array(img.data.buffer)

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const cx = plumeX * BW
    const sigma = BW * 0.078

    let t = 0
    const step = () => {
      const inten = reduce ? 0.5 : intensity.current
      t += 0.11

      // ── the source row ──
      const base = (vapor ? 34 + 29 * inten : 26 + 37 * inten)
      for (let x = 0; x < BW; x++) {
        let v: number
        if (vapor) {
          // a narrow plume, breathing slightly so the draw isn't mechanical
          const d = (x - cx) / sigma
          const g = Math.exp(-0.5 * d * d)
          v = base * g * (0.82 + 0.18 * Math.sin(t * 2.1))
        } else {
          const n =
            0.5 * Math.sin(x * 0.045 + t * 0.7) +
            0.3 * Math.sin(x * 0.113 - t * 1.1) +
            0.2 * Math.sin(x * 0.211 + t * 1.7)
          v = base * (0.52 + 0.48 * n)
        }
        buf[(BH - 1) * BW + x] = Math.max(0, Math.min(PMAX, Math.round(v)))
      }

      // ── propagate upward ──
      // Vapor cools far more slowly than flame (so the cloud climbs the whole
      // frame) and fans away from the plume axis as it rises, which is what
      // makes it billow instead of running up as a column.
      const p = vapor ? 0.24 - 0.12 * inten : 0.86 - 0.52 * inten
      for (let y = BH - 1; y > 0; y--) {
        const row = y * BW
        const up = row - BW
        const rise = 1 - y / BH
        for (let x = 0; x < BW; x++) {
          const h = buf[row + x]
          if (h === 0) {
            buf[up + x] = 0
            continue
          }
          const lean = Math.sin(x * 0.06 + t * 0.5) * rise * (vapor ? 1.1 : 1.6)
          const fan = vapor ? ((x - cx) / BW) * rise * rise * 9 : 0
          const drift = Math.round(((Math.random() * 3) | 0) - 1 + lean + fan)
          const nx = x + drift < 0 ? 0 : x + drift > BW - 1 ? BW - 1 : x + drift
          const cool = p * (0.78 + 0.44 * Math.sin(x * 0.031 - t * 0.4))
          let d = 0
          if (Math.random() < cool) d = Math.random() < 0.14 ? 2 : 1
          buf[up + nx] = h - d < 0 ? 0 : h - d
        }
      }

      for (let i = 0; i < buf.length; i++) px[i] = pal[buf[i]]
      bctx.putImageData(img, 0, 0)
      if (fctx && front) {
        fctx.clearRect(0, 0, front.width, front.height)
        fctx.drawImage(back, 0, BH - front.height, BW, front.height, 0, 0, BW, front.height)
      }
    }

    // Settle the sim so the first painted frame is already alive.
    //
    // Two things matter about WHERE this runs. It used to sit above the reduce
    // check, so a reduced-motion visitor paid all 90/140 full-grid iterations
    // for a single static frame. And running it synchronously here put the work
    // inside the navigation commit: two GtFire instances mount on this route, so
    // a keyboard-activated client-side transition into it measured a 422ms long
    // task against a 456ms INP — roughly 4.9M cell updates before the browser
    // could respond. A reduced pass is enough to look alive when nothing moves;
    // the full warm-up now happens off the commit path.
    const warm = (n: number) => { for (let i = 0; i < n; i++) step() }

    if (reduce) {
      warm(vapor ? 24 : 16)
      return
    }

    let raf = 0
    let warmed = false
    let last = 0
    let visible = true
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (!visible || now - last < FRAME_MS) return
      last = now
      // first animated frame absorbs the settle, after the commit has landed
      if (!warmed) { warmed = true; warm(vapor ? 140 : 90) }
      step()
    }
    raf = requestAnimationFrame(loop)

    // never burn CPU on a section nobody is looking at
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0 })
    io.observe(back)
    const onVis = () => { visible = !document.hidden }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [mode, plumeX])

  const dims = mode === 'vapor' ? DIMS.vapor : DIMS.fire

  return (
    <>
      <canvas
        ref={backRef}
        width={dims.w}
        height={dims.h}
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 bottom-0 w-full ${className}`}
      />
      {frontClassName ? (
        <canvas
          ref={frontRef}
          width={dims.w}
          height={54}
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 bottom-0 w-full ${frontClassName}`}
        />
      ) : null}
    </>
  )
})

export default GtFire
