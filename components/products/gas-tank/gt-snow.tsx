'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

// SNOW + FROST, both real, both procedural.
//
// SNOW: three depth bands of drifting flakes. The far band is small, slow and
// faint; the near band is large, fast and soft-edged. A shared sinusoidal wind
// pushes every band by a different amount, which is what stops it reading as a
// flat sheet of dots falling straight down.
//
// FROST: a recursive branching crystal pattern seeded off all four edges,
// pointing inward, with an edge-to-centre alpha ramp baked in. Drawn ONCE.
//
// ── PERFORMANCE, learned the hard way ─────────────────────────────────────
// The first version of this ran at 13fps (the rest of the page runs at 120).
// Two causes, both avoidable:
//
//   1. `ctx.filter = 'blur(...)'` was set PER FLAKE inside the draw loop. Each
//      assignment forces the 2D context into a fresh compositing pass, so ~200
//      flakes meant ~200 of them every frame. Flakes are now pre-rendered once
//      into small sprite canvases (a soft radial gradient) and blitted with
//      drawImage — no filter, no per-particle state changes.
//
//   2. Frost was composited every frame: a full-canvas drawImage, a full-canvas
//      destination-in gradient mask, and a full-canvas haze fill, with two
//      gradients allocated each time. At 1416x748 that is ~3M pixels x3 per
//      frame for something that never changes. Frost now lives on its OWN
//      static canvas, painted once, and the "creeping inward" is done by the
//      host timeline animating transform + opacity on it — compositor-only, and
//      in line with the project's transform/opacity motion rule.
//
// The frost pattern is also grown at a capped resolution and scaled up by CSS;
// it is soft organic linework, so nobody can tell, and it keeps the one-time
// mount cost small enough not to stall the page.

export type GtSnowHandle = { setWind: (v: number) => void }

const FROST_MAX_W = 1000
const BANDS = [
  { r: [0.9, 1.7], vy: [10, 18], alpha: 0.42, wind: 0.5, soft: 0.35 },
  { r: [1.8, 3.0], vy: [20, 34], alpha: 0.66, wind: 1.0, soft: 0.55 },
  { r: [3.2, 5.6], vy: [38, 58], alpha: 0.8, wind: 1.7, soft: 0.75 },
]

type Flake = { x: number; y: number; r: number; vy: number; drift: number; phase: number; band: number }

function flakeSprite(radius: number, soft: number) {
  const s = Math.ceil(radius * 2) + 2
  const c = document.createElement('canvas')
  c.width = s
  c.height = s
  const g = c.getContext('2d')
  if (!g) return c
  const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  grd.addColorStop(0, 'rgba(255,255,255,1)')
  grd.addColorStop(Math.max(0.05, 1 - soft), 'rgba(255,255,255,0.92)')
  grd.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, s, s)
  return c
}

const GtSnow = forwardRef<GtSnowHandle, { className?: string }>(function GtSnow({ className = '' }, ref) {
  const snowRef = useRef<HTMLCanvasElement>(null)
  const frostRef = useRef<HTMLCanvasElement>(null)
  const wind = useRef(0.35)

  useImperativeHandle(ref, () => ({
    setWind: (v) => { wind.current = Math.max(0, Math.min(1, v)) },
  }), [])

  useEffect(() => {
    const snow = snowRef.current
    const frost = frostRef.current
    if (!snow || !frost) return
    const ctx = snow.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

    let W = 0
    let H = 0
    let flakes: Flake[] = []
    let sprites: HTMLCanvasElement[] = []

    // ── the frost pattern, painted once, on its own canvas ──
    const paintFrost = (cssW: number, cssH: number) => {
      const fw = Math.min(FROST_MAX_W, Math.max(320, Math.round(cssW)))
      const fh = Math.max(200, Math.round((cssH / Math.max(1, cssW)) * fw))
      frost.width = fw
      frost.height = fh
      const c = frost.getContext('2d')
      if (!c) return
      c.clearRect(0, 0, fw, fh)
      c.strokeStyle = 'rgba(255,255,255,0.95)'
      c.lineCap = 'round'

      // one path per depth level keeps the stroke count down
      const branch = (x: number, y: number, ang: number, len: number, depth: number) => {
        if (depth <= 0 || len < 2.5) return
        const nx = x + Math.cos(ang) * len
        const ny = y + Math.sin(ang) * len
        c.lineWidth = Math.max(0.5, depth * 0.8)
        c.beginPath()
        c.moveTo(x, y)
        c.lineTo(nx, ny)
        c.stroke()
        const spread = 0.42 + Math.random() * 0.3
        branch(nx, ny, ang + spread, len * (0.5 + Math.random() * 0.16), depth - 1)
        branch(nx, ny, ang - spread, len * (0.5 + Math.random() * 0.16), depth - 1)
        branch(nx, ny, ang + (Math.random() - 0.5) * 0.24, len * (0.74 + Math.random() * 0.14), depth - 1)
      }

      const reach = Math.min(fw, fh) * 0.5
      const per = Math.max(6, Math.round(fw / 105))
      for (let i = 0; i < per; i++) {
        const t = (i + 0.5) / per
        branch(t * fw, -3, Math.PI / 2 + (Math.random() - 0.5) * 0.6, reach * (0.55 + Math.random() * 0.45), 5)
        branch(t * fw, fh + 3, -Math.PI / 2 + (Math.random() - 0.5) * 0.6, reach * (0.55 + Math.random() * 0.45), 5)
      }
      const perV = Math.max(4, Math.round(fh / 105))
      for (let i = 0; i < perV; i++) {
        const t = (i + 0.5) / perV
        branch(-3, t * fh, (Math.random() - 0.5) * 0.6, reach * (0.55 + Math.random() * 0.45), 5)
        branch(fw + 3, t * fh, Math.PI + (Math.random() - 0.5) * 0.6, reach * (0.55 + Math.random() * 0.45), 5)
      }

      // milky ice bloom — crystals on their own read as scratches
      const haze = c.createRadialGradient(fw / 2, fh / 2, 0, fw / 2, fh / 2, Math.hypot(fw, fh) / 2)
      haze.addColorStop(0.42, 'rgba(233,247,255,0)')
      haze.addColorStop(1, 'rgba(233,247,255,0.8)')
      c.fillStyle = haze
      c.fillRect(0, 0, fw, fh)

      // bake the edge-to-centre ramp, so scaling the element down brings the
      // ice inward without any per-frame masking
      const ramp = c.createRadialGradient(fw / 2, fh / 2, 0, fw / 2, fh / 2, Math.hypot(fw, fh) / 2)
      ramp.addColorStop(0.3, 'rgba(0,0,0,0)')
      ramp.addColorStop(1, 'rgba(0,0,0,1)')
      c.globalCompositeOperation = 'destination-in'
      c.fillStyle = ramp
      c.fillRect(0, 0, fw, fh)
      c.globalCompositeOperation = 'source-over'
    }

    const seed = () => {
      const target = Math.round(Math.min(340, Math.max(120, (W * H) / (dpr * dpr) / 2900)))
      flakes = []
      for (let i = 0; i < target; i++) {
        const band = i % 3 === 2 ? 2 : i % 2
        const b = BANDS[band]
        flakes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: (b.r[0] + Math.random() * (b.r[1] - b.r[0])) * dpr,
          vy: (b.vy[0] + Math.random() * (b.vy[1] - b.vy[0])) * dpr,
          drift: (Math.random() - 0.5) * 14 * dpr,
          phase: Math.random() * Math.PI * 2,
          band,
        })
      }
      sprites = BANDS.map((b) => flakeSprite(b.r[1] * dpr, b.soft))
    }

    let lastW = -1
    let lastH = -1
    const resize = () => {
      const r = snow.getBoundingClientRect()
      const cw = Math.round(r.width)
      const ch = Math.round(r.height)
      // ignore sub-pixel churn; repainting frost is the expensive bit
      if (Math.abs(cw - lastW) < 24 && Math.abs(ch - lastH) < 24) return
      lastW = cw
      lastH = ch
      W = Math.max(1, Math.round(cw * dpr))
      H = Math.max(1, Math.round(ch * dpr))
      snow.width = W
      snow.height = H
      seed()
      paintFrost(cw, ch)
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(snow)

    if (reduce) {
      return () => ro.disconnect()
    }

    let t = 0
    let raf = 0
    let prev = performance.now()
    let visible = true

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw)
      if (!visible) { prev = now; return }
      const dt = Math.min(0.05, (now - prev) / 1000)
      prev = now
      t += dt

      ctx.clearRect(0, 0, W, H)
      const gust = wind.current
      for (const f of flakes) {
        const b = BANDS[f.band]
        const w = (Math.sin(t * 0.6 + f.phase) * 26 + f.drift) * b.wind * (0.4 + gust) * dpr
        f.y += f.vy * dt * (0.5 + gust)
        f.x += w * dt
        if (f.y - f.r > H) { f.y = -f.r; f.x = Math.random() * W }
        if (f.x < -20) f.x = W + 10
        else if (f.x > W + 20) f.x = -10
        ctx.globalAlpha = b.alpha * (0.75 + 0.25 * Math.sin(t * 1.6 + f.phase))
        const sp = sprites[f.band]
        const d = f.r * 2
        ctx.drawImage(sp, f.x - f.r, f.y - f.r, d, d)
      }
      ctx.globalAlpha = 1
    }
    raf = requestAnimationFrame(draw)

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0 })
    io.observe(snow)
    const onVis = () => { visible = !document.hidden }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return (
    <>
      {/* static: the host timeline animates transform + opacity on this */}
      <canvas
        ref={frostRef}
        data-frost
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[8] h-full w-full opacity-0 will-change-transform"
      />
      {/* above the freeze slab on purpose: snow keeps falling through the
          100% SOLVENTLESS moment instead of being buried by it */}
      <canvas ref={snowRef} aria-hidden className={`pointer-events-none absolute inset-0 z-[35] h-full w-full ${className}`} />
    </>
  )
})

export default GtSnow
