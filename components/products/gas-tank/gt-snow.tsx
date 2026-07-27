'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

// SNOW + FROST, both real, both procedural.
//
// SNOW: three depth bands of drifting flakes. The far band is small, slow and
// faint; the near band is large, fast and soft-edged. A shared sinusoidal wind
// pushes every band by a different amount, which is what stops it reading as a
// flat sheet of dots falling straight down.
//
// FROST: a branching crystal pattern grown once at mount from seeds along all
// four edges, pointing inward — the classic recursive fork, so it looks like it
// actually crept in from the glass rather than being an overlay PNG. Growing it
// per frame would be far too expensive, so it is baked into an offscreen canvas
// and then REVEALED by scroll: `setFrost` scales a radial mask whose clear
// centre shrinks, so the ice closes in on the middle of the frame.
//
// The host section drives both through the ref.

export type GtSnowHandle = {
  setFrost: (v: number) => void
  setWind: (v: number) => void
}

type Flake = { x: number; y: number; r: number; vy: number; drift: number; phase: number; band: number }

const BANDS = [
  { r: [0.8, 1.6], vy: [10, 18], alpha: 0.42, wind: 0.5, blur: 0 },
  { r: [1.6, 2.8], vy: [20, 34], alpha: 0.66, wind: 1.0, blur: 0.6 },
  { r: [3.0, 5.4], vy: [38, 58], alpha: 0.85, wind: 1.7, blur: 1.6 },
]

const GtSnow = forwardRef<GtSnowHandle, { className?: string }>(function GtSnow({ className = '' }, ref) {
  const cvsRef = useRef<HTMLCanvasElement>(null)
  const frost = useRef(0)
  const wind = useRef(0.35)

  useImperativeHandle(ref, () => ({
    setFrost: (v) => { frost.current = Math.max(0, Math.min(1, v)) },
    setWind: (v) => { wind.current = Math.max(0, Math.min(1, v)) },
  }), [])

  useEffect(() => {
    const cvs = cvsRef.current
    if (!cvs) return
    const ctx = cvs.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let W = 0
    let H = 0
    let flakes: Flake[] = []
    let frostCvs: HTMLCanvasElement | null = null

    // ── the frost pattern, grown once ──
    const growFrost = () => {
      const f = document.createElement('canvas')
      f.width = W
      f.height = H
      const c = f.getContext('2d')
      if (!c) return f
      c.strokeStyle = 'rgba(255,255,255,0.95)'
      c.lineCap = 'round'

      const branch = (x: number, y: number, ang: number, len: number, depth: number) => {
        if (depth <= 0 || len < 2.5) return
        const nx = x + Math.cos(ang) * len
        const ny = y + Math.sin(ang) * len
        c.lineWidth = Math.max(0.5, depth * 0.85)
        c.beginPath()
        c.moveTo(x, y)
        c.lineTo(nx, ny)
        c.stroke()
        const spread = 0.42 + Math.random() * 0.3
        branch(nx, ny, ang + spread, len * (0.52 + Math.random() * 0.16), depth - 1)
        branch(nx, ny, ang - spread, len * (0.52 + Math.random() * 0.16), depth - 1)
        branch(nx, ny, ang + (Math.random() - 0.5) * 0.24, len * (0.76 + Math.random() * 0.14), depth - 1)
      }

      const per = Math.max(8, Math.round(W / 62))
      const reach = Math.min(W, H) * 0.46
      for (let i = 0; i < per; i++) {
        const t = (i + 0.5) / per
        branch(t * W, -4, Math.PI / 2 + (Math.random() - 0.5) * 0.6, reach * (0.5 + Math.random() * 0.5), 6)
        branch(t * W, H + 4, -Math.PI / 2 + (Math.random() - 0.5) * 0.6, reach * (0.5 + Math.random() * 0.5), 6)
      }
      const perV = Math.max(6, Math.round(H / 62))
      for (let i = 0; i < perV; i++) {
        const t = (i + 0.5) / perV
        branch(-4, t * H, (Math.random() - 0.5) * 0.6, reach * (0.5 + Math.random() * 0.5), 6)
        branch(W + 4, t * H, Math.PI + (Math.random() - 0.5) * 0.6, reach * (0.5 + Math.random() * 0.5), 6)
      }
      return f
    }

    const seed = () => {
      const area = (W * H) / (dpr * dpr)
      const target = Math.round(Math.min(260, Math.max(70, area / 5200)))
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
    }

    const resize = () => {
      const r = cvs.getBoundingClientRect()
      W = Math.max(1, Math.round(r.width * dpr))
      H = Math.max(1, Math.round(r.height * dpr))
      cvs.width = W
      cvs.height = H
      seed()
      frostCvs = growFrost()
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(cvs)

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

      // ── frost, revealed from the edges inward ──
      const fr = frost.current
      if (frostCvs && fr > 0.001) {
        ctx.save()
        // a clear centre that shrinks as frost rises
        const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.hypot(W, H) / 2)
        const clear = 0.92 * (1 - fr)
        g.addColorStop(Math.min(0.98, clear), 'rgba(0,0,0,0)')
        g.addColorStop(1, 'rgba(0,0,0,1)')
        ctx.globalAlpha = Math.min(1, fr * 1.25)
        ctx.drawImage(frostCvs, 0, 0)
        ctx.globalCompositeOperation = 'destination-in'
        ctx.globalAlpha = 1
        ctx.fillStyle = g
        ctx.fillRect(0, 0, W, H)
        ctx.restore()

        // milky ice bloom on the same mask — crystals alone read as scratches
        ctx.save()
        const haze = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.hypot(W, H) / 2)
        haze.addColorStop(Math.min(0.98, 0.86 * (1 - fr)), 'rgba(255,255,255,0)')
        haze.addColorStop(1, `rgba(233,247,255,${0.72 * fr})`)
        ctx.fillStyle = haze
        ctx.fillRect(0, 0, W, H)
        ctx.restore()
      }

      // ── snow ──
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
        ctx.filter = b.blur ? `blur(${b.blur * dpr}px)` : 'none'
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.filter = 'none'
      ctx.globalAlpha = 1
    }

    if (reduce) {
      // one static frame: frost only, no falling snow
      frost.current = 0.5
      draw(performance.now())
      cancelAnimationFrame(raf)
    } else {
      raf = requestAnimationFrame(draw)
    }

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0 })
    io.observe(cvs)
    const onVis = () => { visible = !document.hidden }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return <canvas ref={cvsRef} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />
})

export default GtSnow
