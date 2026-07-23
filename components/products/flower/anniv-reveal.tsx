'use client'

import { useRef } from 'react'
import ScrollSequence from './scroll-sequence'

// 20th Anniversary opener — Avanti's Higgsfield reveal animation, scroll-
// scrubbed on canvas (61 frames, single 16:9 set, cover-fit). A small gold
// kicker holds the first beats; the tail eases into the anniversary section's
// near-black so the headline/mylars pick up seamlessly below.

export default function AnnivReveal() {
  const kickerRef = useRef<HTMLDivElement>(null)
  const fadeRef = useRef<HTMLDivElement>(null)

  const onProgress = (p: number) => {
    if (kickerRef.current) {
      const o = p < 0.12 ? 1 : Math.max(0, 1 - (p - 0.12) / 0.12)
      kickerRef.current.style.opacity = String(o)
    }
    if (fadeRef.current) {
      const f = Math.min(1, Math.max(0, (p - 0.92) / 0.08))
      fadeRef.current.style.opacity = String(f)
    }
  }

  return (
    <ScrollSequence frames={61} heightVh={260} base="/products/flower/frames/anniv" onProgress={onProgress}>
      <div
        ref={kickerRef}
        className="pointer-events-none absolute inset-x-0 top-[14vh] z-10 text-center text-[11px] font-bold uppercase tracking-[0.4em] text-[var(--fl-gold,#e9c15a)]"
        style={{ fontFamily: 'var(--font-brand)' }}
      >
        Twenty years of fire
      </div>
      <div ref={fadeRef} aria-hidden className="pointer-events-none absolute inset-0 z-20 bg-[#070604] opacity-0" />
    </ScrollSequence>
  )
}
