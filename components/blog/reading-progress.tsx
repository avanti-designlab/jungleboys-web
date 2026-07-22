'use client'

import { useEffect, useRef } from 'react'

// Fixed reading-progress bar — fills as you scroll the article. Pointer-safe,
// GPU-only transform. Harmless under reduced motion (it's feedback, not motion).

export default function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return
    let raf = 0
    const update = () => {
      raf = 0
      const doc = document.documentElement
      const max = doc.scrollHeight - doc.clientHeight
      const p = max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0
      bar.style.transform = `scaleX(${p})`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent">
      <div ref={barRef} className="h-full origin-left scale-x-0 bg-[var(--color-accent)] will-change-transform" />
    </div>
  )
}
