'use client'

import { useEffect, useRef, useState } from 'react'

// Designer's animated banner character (Bodymovin export, assets embedded).
// Uses lottie_light — SVG renderer only, no expression evaluation. The static
// SVG stays in place until the animation is ready, and permanently for
// reduced-motion users. Plays only while on screen.

export default function MediaLottie({
  src,
  fallback,
  alt,
  className = '',
}: {
  src: string
  fallback: string
  alt: string
  className?: string
}) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let anim: { play: () => void; pause: () => void; destroy: () => void } | null = null
    let io: IntersectionObserver | null = null
    let cancelled = false

    import('lottie-web/build/player/lottie_light').then((mod) => {
      if (cancelled) return
      const lottie = mod.default
      const a = lottie.loadAnimation({
        container: box,
        renderer: 'svg',
        loop: true,
        autoplay: false,
        path: src,
      })
      anim = a
      a.addEventListener('DOMLoaded', () => {
        if (cancelled) return
        setReady(true)
        io = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) a.play()
            else a.pause()
          },
          { threshold: 0.15 }
        )
        io.observe(box)
      })
    })

    return () => {
      cancelled = true
      io?.disconnect()
      anim?.destroy()
    }
  }, [src])

  return (
    <span className={`relative block ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static fallback */}
      <img src={fallback} alt={alt} className={`h-full w-full object-contain ${ready ? 'invisible' : ''}`} />
      <span ref={boxRef} aria-hidden className={`absolute inset-0 ${ready ? '' : 'invisible'}`} />
    </span>
  )
}
