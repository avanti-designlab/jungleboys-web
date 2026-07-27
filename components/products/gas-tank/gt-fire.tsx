'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

// REAL FIRE, no asset. A heat-propagation simulation (the classic Doom fire):
// the bottom row is held at the ignition temperature and every cell above it
// inherits its neighbour's heat minus a random cooling step, so the flame
// shape is genuinely simulated rather than an animated gradient.
//
// It runs at buffer resolution (180x150) and is stretched to the section by
// CSS — the browser's own bilinear filtering is what gives the soft edges, so
// the whole thing costs ~27k cells a frame and no texture memory.
//
// One simulation feeds TWO canvases: the bed behind everything, and a shorter
// tongue drawn in FRONT of the products so flames lick over the devices.
// `setIntensity` is driven by the hero's ScrollTrigger — scrolling is what
// feeds the fire.

export type GtFireHandle = { setIntensity: (v: number) => void }

const BW = 180
const BH = 150
const PMAX = 63
const FRAME_MS = 1000 / 32

// black → ember → JB red → orange → yellow → white-hot
const STOPS: [number, [number, number, number, number]][] = [
  [0, [0, 0, 0, 0]],
  [5, [56, 6, 2, 55]],
  [15, [150, 13, 5, 165]],
  [27, [225, 27, 11, 235]],
  [41, [255, 122, 24, 255]],
  [54, [251, 205, 3, 255]],
  [63, [255, 247, 218, 255]],
]

function buildPalette() {
  const pal = new Uint32Array(PMAX + 1)
  for (let i = 0; i <= PMAX; i++) {
    let a = STOPS[0]
    let b = STOPS[STOPS.length - 1]
    for (let s = 0; s < STOPS.length - 1; s++) {
      if (i >= STOPS[s][0] && i <= STOPS[s + 1][0]) {
        a = STOPS[s]
        b = STOPS[s + 1]
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

type Props = { className?: string; frontClassName?: string }

const GtFire = forwardRef<GtFireHandle, Props>(function GtFire({ className = '', frontClassName = '' }, ref) {
  const backRef = useRef<HTMLCanvasElement>(null)
  const frontRef = useRef<HTMLCanvasElement>(null)
  const intensity = useRef(0.22)

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

    const pal = buildPalette()
    const buf = new Uint8Array(BW * BH)
    const img = bctx.createImageData(BW, BH)
    const px = new Uint32Array(img.data.buffer)

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let t = 0
    const step = () => {
      const inten = reduce ? 0.5 : intensity.current
      t += 0.11

      // Hold the base row at ignition temperature. Three octaves of drifting
      // sine give hot columns and cool troughs, which is what turns a flat wall
      // of orange into separate tongues that rise and collapse.
      const base = 26 + 37 * inten
      for (let x = 0; x < BW; x++) {
        const n =
          0.5 * Math.sin(x * 0.045 + t * 0.7) +
          0.3 * Math.sin(x * 0.113 - t * 1.1) +
          0.2 * Math.sin(x * 0.211 + t * 1.7)
        const wave = 0.52 + 0.48 * n // 0.04 … 1.0
        buf[(BH - 1) * BW + x] = Math.max(0, Math.min(PMAX, Math.round(base * wave)))
      }

      // Cooling probability sets flame height: hotter cools slower, so it climbs
      // further. Perturbing it per column lets some tongues outrun their
      // neighbours instead of every flame topping out at the same line.
      const p = 0.86 - 0.52 * inten
      for (let y = BH - 1; y > 0; y--) {
        const row = y * BW
        const up = row - BW
        for (let x = 0; x < BW; x++) {
          const h = buf[row + x]
          if (h === 0) {
            buf[up + x] = 0
            continue
          }
          // shear: the higher the cell, the more it leans with the updraft
          const lean = Math.sin(x * 0.06 + t * 0.5) * (1 - y / BH) * 1.6
          const drift = Math.round(((Math.random() * 3) | 0) - 1 + lean)
          const nx = x + drift < 0 ? 0 : x + drift > BW - 1 ? BW - 1 : x + drift
          const cool = p * (0.78 + 0.44 * Math.sin(x * 0.031 - t * 0.4))
          let d = 0
          if (Math.random() < cool) d = Math.random() < 0.14 ? 2 : 1
          buf[up + nx] = h - d < 0 ? 0 : h - d
        }
      }

      for (let i = 0; i < buf.length; i++) px[i] = pal[buf[i]]
      bctx.putImageData(img, 0, 0)
      // the front tongue is the same fire, cropped to its hottest band
      if (fctx && front) {
        fctx.clearRect(0, 0, front.width, front.height)
        fctx.drawImage(back, 0, BH - front.height, BW, front.height, 0, 0, BW, front.height)
      }
    }

    // settle the sim so the first painted frame is already a live ember bed
    for (let i = 0; i < 90; i++) step()

    if (reduce) return

    let raf = 0
    let last = 0
    let visible = true
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (!visible || now - last < FRAME_MS) return
      last = now
      step()
    }
    raf = requestAnimationFrame(loop)

    // never burn CPU on a hero nobody is looking at
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0 })
    io.observe(back)
    const onVis = () => { visible = !document.hidden }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return (
    <>
      <canvas
        ref={backRef}
        width={BW}
        height={BH}
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 bottom-0 w-full ${className}`}
      />
      <canvas
        ref={frontRef}
        width={BW}
        height={54}
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 bottom-0 w-full ${frontClassName}`}
      />
    </>
  )
})

export default GtFire
