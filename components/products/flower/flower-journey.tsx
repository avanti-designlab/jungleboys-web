'use client'

import { useRef } from 'react'
import ScrollSequence from './scroll-sequence'

// Act 2 — the grow. Canvas scrubs the plant-growth sequence (61 frames) while:
//  • a giant outlined genetics statement holds the opening beats
//  • the frosty purple nug cutout (native-res Figma fill, true alpha) zooms
//    up from center until it swallows the screen
// Overlays are driven off onProgress with direct style writes (no re-renders).

export default function FlowerJourney() {
  const statementRef = useRef<HTMLDivElement>(null)
  const nugRef = useRef<HTMLImageElement>(null)
  const fadeRef = useRef<HTMLDivElement>(null)

  const onProgress = (p: number) => {
    // statement: reads through the opening, gone by 30%
    if (statementRef.current) {
      const o = p < 0.16 ? 1 : Math.max(0, 1 - (p - 0.16) / 0.14)
      statementRef.current.style.opacity = String(o)
    }
    // nug: appears from 50%, blows up past the viewport by 100%
    if (nugRef.current) {
      const t = Math.min(1, Math.max(0, (p - 0.5) / 0.5))
      const scale = 0.3 + t * t * 4.5 // ease-in blow-up, capped to keep the native cutout crisp
      const op = t <= 0 ? 0 : t < 0.07 ? t / 0.07 : 1
      nugRef.current.style.opacity = String(op)
      nugRef.current.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${t * 12}deg)`
    }
    // full fade to black, compressed into the last beats — reaches 1 exactly
    // when the stage un-pins, so the handoff into the next section is a
    // seamless black-to-black cut (no visible seam, no long dead stretch)
    if (fadeRef.current) {
      const f = Math.min(1, Math.max(0, (p - 0.9) / 0.1))
      fadeRef.current.style.opacity = String(f)
    }
  }

  return (
    <ScrollSequence frames={61} heightVh={330} onProgress={onProgress}>
      {/* genetics statement — outlined in JB yellow, owns the frame */}
      <div
        ref={statementRef}
        className="font-display pointer-events-none absolute inset-x-0 top-[10vh] z-10 text-center uppercase leading-[0.9]"
        style={{ fontSize: 'min(9.5vw, 8rem)' }}
      >
        <span className="fl-stroke-accent block">Jungle Boys Genetics</span>
        <span className="fl-stroke-accent block">From Seed to Fire</span>
      </div>

      {/* frosty nug cutout blows up to fill */}
      {/* eslint-disable-next-line @next/next/no-img-element -- native-res cutout */}
      <img
        ref={nugRef}
        src="/products/flower/nug-hd.webp"
        alt=""
        aria-hidden
        loading="lazy"
        className="pointer-events-none absolute left-1/2 top-1/2 z-20 w-[46vmin] max-w-none opacity-0 will-change-transform drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)]"
        style={{ transform: 'translate(-50%, -50%) scale(0.3)' }}
      />

      <div ref={fadeRef} aria-hidden className="pointer-events-none absolute inset-0 z-30 bg-black opacity-0" />
    </ScrollSequence>
  )
}
