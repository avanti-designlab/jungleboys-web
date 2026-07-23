'use client'

import { useEffect, useRef, useState } from 'react'

// Scroll-scrubbed frame sequence on <canvas> (see docs: scroll-hero-sequence
// brief). The video is never played — frames are drawn by scroll progress.
//
// Regenerate frames from the source videos:
//   ffmpeg -i hero-desktop.mp4 -vf fps=12 -q:v 2 fd/%04d.jpg   (16:9)
//   ffmpeg -i hero-mobile.mp4  -vf fps=12 -q:v 2 fm/%04d.jpg   (9:16)
//   → sharp resize (1360w / 720w) → webp q55-58 → public/products/flower/frames/
//
// Rules implemented from the brief:
//  • canvas + drawImage, never <video> scrubbing (iOS seek jank)
//  • all frames decoded (image.decode()) before the scroll handler attaches;
//    frame 0001 shows as a static poster while loading
//  • scroll handler only stores progress + requests rAF; no decode/alloc in path
//  • rAF-throttled, redundant frame draws skipped
//  • DPR-capped backing store (2 desktop / 1.5 mobile), cover-fit draw
//  • breakpoint (desktop/mobile sequence) chosen ONCE at mount
//  • prefers-reduced-motion → static LAST frame, no handler at all
//  • emits onProgress(0–1) so parent layers can drive their own reveals

type Config = {
  frames: number
  heightVh?: number // section height (scrub length)
  base?: string // frame directory; default has desktop/ + mobile/ subdirs
  single?: boolean // one frame set for all viewports (cover-fit crops)
  onProgress?: (p: number) => void
  className?: string
  children?: React.ReactNode // overlay layers, composited above the canvas
}

const BASE = '/products/flower/frames'

export default function ScrollSequence({ frames, heightVh = 300, base = BASE, single = false, onProgress, className = '', children }: Config) {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const stateRef = useRef({ frame: -1, target: 0, current: 0, raf: 0, loop: 0, ready: false, dpr: 2 })
  const onProgressRef = useRef(onProgress)
  onProgressRef.current = onProgress
  const [poster, setPoster] = useState<string | null>(null)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    if (!section || !canvas) return

    // breakpoint + DPR chosen once, before preload (per brief)
    const mobile = window.innerWidth < 768
    const dir = single ? base : mobile ? `${base}/mobile` : `${base}/desktop`
    const src = (i: number) => `${dir}/${String(i + 1).padStart(4, '0')}.webp`
    stateRef.current.dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReduced(true)
      setPoster(src(frames - 1)) // static mature field
      return
    }
    setPoster(src(0))

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let cancelled = false

    const size = () => {
      const { dpr } = stateRef.current
      canvas.width = Math.round(canvas.clientWidth * dpr)
      canvas.height = Math.round(canvas.clientHeight * dpr)
      stateRef.current.frame = -1 // force redraw at new size
      draw()
    }

    const draw = () => {
      const st = stateRef.current
      if (!st.ready) return
      const idx = Math.round(st.current * (frames - 1))
      if (idx === st.frame) return
      st.frame = idx
      const img = imagesRef.current[idx]
      if (!img) return
      ctx.imageSmoothingQuality = 'high'
      // cover-fit
      const cw = canvas.width
      const ch = canvas.height
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
      const w = img.naturalWidth * s
      const h = img.naturalHeight * s
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h)
    }

    // scrub smoothing: `current` glides toward `target` each frame (GSAP-scrub
    // feel) so fast flicks sweep through frames instead of jumping, and the
    // overlays ride the same eased progress
    const tick = () => {
      const st = stateRef.current
      const diff = st.target - st.current
      if (Math.abs(diff) < 0.0004) {
        st.current = st.target
        st.loop = 0
      } else {
        st.current += diff * 0.16
        st.loop = requestAnimationFrame(tick)
      }
      draw()
      onProgressRef.current?.(st.current)
    }
    const ensureLoop = () => {
      const st = stateRef.current
      if (!st.loop) st.loop = requestAnimationFrame(tick)
    }

    const measure = (snap = false) => {
      const rect = section.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0
      const st = stateRef.current
      st.target = p
      if (snap) {
        st.current = p
        draw()
        onProgressRef.current?.(p)
      } else {
        ensureLoop()
      }
    }

    const onScroll = () => {
      const st = stateRef.current
      if (!st.raf) {
        st.raf = requestAnimationFrame(() => {
          st.raf = 0
          measure()
        })
      }
    }

    let resizeT = 0
    const onResize = () => {
      window.clearTimeout(resizeT)
      resizeT = window.setTimeout(size, 150)
    }

    // Preload lazily: start when the section approaches (never blocks first paint)
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        io.disconnect()
        const imgs = Array.from({ length: frames }, (_, i) => {
          const im = new Image()
          im.src = src(i)
          return im
        })
        imagesRef.current = imgs
        Promise.all(imgs.map((im) => im.decode().catch(() => {}))).then(() => {
          if (cancelled) return
          stateRef.current.ready = true
          size()
          measure(true) // first paint snaps straight to the scroll position
          window.addEventListener('scroll', onScroll, { passive: true })
          window.addEventListener('resize', onResize)
        })
      },
      { rootMargin: '100% 0px' }
    )
    io.observe(section)

    return () => {
      cancelled = true
      io.disconnect()
      if (stateRef.current.raf) cancelAnimationFrame(stateRef.current.raf)
      if (stateRef.current.loop) cancelAnimationFrame(stateRef.current.loop)
      window.clearTimeout(resizeT)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [frames, base, single])

  return (
    <section
      ref={sectionRef}
      className={`relative ${className}`}
      style={{ height: reduced ? '100vh' : `${heightVh}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        {poster && (
          // eslint-disable-next-line @next/next/no-img-element -- canvas poster
          <img src={poster} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
        )}
        {!reduced && <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />}
        {children}
      </div>
    </section>
  )
}
