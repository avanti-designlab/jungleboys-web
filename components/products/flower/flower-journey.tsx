'use client'

import { useRef } from 'react'
import ScrollSequence from './scroll-sequence'

// Act 2 — the grow. Canvas scrubs the plant-growth sequence (61 frames) while a
// macro nug layer zooms up from the center late in the scrub until it fills the
// screen — bridging into the editorial section. Overlay layers are driven off
// the sequence's onProgress callback with direct style writes (no re-renders).

export default function FlowerJourney() {
  const kickerRef = useRef<HTMLDivElement>(null)
  const nugRef = useRef<HTMLImageElement>(null)
  const fadeRef = useRef<HTMLDivElement>(null)

  const onProgress = (p: number) => {
    // kicker: visible at the start, gone by 18%
    if (kickerRef.current) {
      const o = Math.max(0, 1 - p / 0.18)
      kickerRef.current.style.opacity = String(o)
    }
    // nug: appears from 55%, scales to fill by 100%
    if (nugRef.current) {
      const t = Math.min(1, Math.max(0, (p - 0.55) / 0.45))
      const scale = 0.25 + t * t * 7.5 // ease-in blow-up
      const op = t < 0.06 ? t / 0.06 : 1
      nugRef.current.style.opacity = String(op)
      nugRef.current.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${t * 18}deg)`
    }
    // fade to black at the very end for a seamless handoff
    if (fadeRef.current) {
      const f = Math.min(1, Math.max(0, (p - 0.9) / 0.1))
      fadeRef.current.style.opacity = String(f)
    }
  }

  return (
    <ScrollSequence frames={61} heightVh={330} onProgress={onProgress}>
      <div
        ref={kickerRef}
        className="pointer-events-none absolute inset-x-0 top-[16vh] z-10 text-center text-[11px] font-bold uppercase tracking-[0.4em] text-white/70"
        style={{ fontFamily: 'var(--font-brand)' }}
      >
        Grown in-house · from seed to fire
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- macro nug overlay */}
      <img
        ref={nugRef}
        src="/phenos/nug-3.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 z-20 w-[46vmin] max-w-none opacity-0 will-change-transform"
        style={{ transform: 'translate(-50%, -50%) scale(0.25)' }}
      />
      <div ref={fadeRef} aria-hidden className="pointer-events-none absolute inset-0 z-30 bg-black opacity-0" />
    </ScrollSequence>
  )
}
