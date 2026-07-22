'use client'

import { useRef } from 'react'
import ScrollSequence from './scroll-sequence'

// Act 2 — the grow. Canvas scrubs the plant-growth sequence (61 frames) while:
//  • a giant yellow-outlined genetics statement holds the opening beats
//  • a circle-masked 4K frost macro (Candy Bones stacked tops) zooms up from
//    the center until it swallows the screen — native-res crystals at fill
// Overlays are driven off onProgress with direct style writes (no re-renders).

export default function FlowerJourney() {
  const statementRef = useRef<HTMLDivElement>(null)
  const portholeRef = useRef<HTMLDivElement>(null)
  const macroRef = useRef<HTMLImageElement>(null)
  const fadeRef = useRef<HTMLDivElement>(null)

  const onProgress = (p: number) => {
    // statement: reads through the opening, gone by 30%
    if (statementRef.current) {
      const o = p < 0.16 ? 1 : Math.max(0, 1 - (p - 0.16) / 0.14)
      statementRef.current.style.opacity = String(o)
    }
    // porthole: appears from 50%, blows up past the viewport by 100%
    if (portholeRef.current) {
      const t = Math.min(1, Math.max(0, (p - 0.5) / 0.5))
      const scale = 0.3 + t * t * 5.5 // ease-in blow-up; 5.8 covers portrait too
      const op = t <= 0 ? 0 : t < 0.07 ? t / 0.07 : 1
      portholeRef.current.style.opacity = String(op)
      portholeRef.current.style.transform = `translate(-50%, -50%) scale(${scale})`
      if (macroRef.current) macroRef.current.style.transform = `scale(1.15) rotate(${t * 10}deg)`
    }
    // fade to black at the very end for a seamless handoff
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

      {/* circle-masked frost macro */}
      <div
        ref={portholeRef}
        className="pointer-events-none absolute left-1/2 top-1/2 z-20 aspect-square w-[44vmin] overflow-hidden rounded-full opacity-0 will-change-transform"
        style={{ transform: 'translate(-50%, -50%) scale(0.3)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- 4K macro */}
        <img
          ref={macroRef}
          src="/products/flower/nug-macro.webp"
          alt=""
          aria-hidden
          loading="lazy"
          className="h-full w-full object-cover will-change-transform"
          style={{ transform: 'scale(1.15)' }}
        />
      </div>

      <div ref={fadeRef} aria-hidden className="pointer-events-none absolute inset-0 z-30 bg-black opacity-0" />
    </ScrollSequence>
  )
}
