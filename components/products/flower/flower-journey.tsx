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

  const onProgress = (p: number) => {
    // Statement holds LONGER. It used to be gone by 30% while the nug does not
    // start until 50%, so p 0.30-0.50 had nothing in it but the sequence's
    // opening frames, which are its darkest (mean luma 18 of 255). On a phone
    // that measured as 300px of void. Now it hands over to the nug directly.
    if (statementRef.current) {
      const o = p < 0.3 ? 1 : Math.max(0, 1 - (p - 0.3) / 0.16)
      statementRef.current.style.opacity = String(o)
    }
    // nug: starts as the statement leaves, blows up past the viewport by 100%
    if (nugRef.current) {
      const t = Math.min(1, Math.max(0, (p - 0.42) / 0.58))
      const scale = 0.3 + t * t * 4.5 // ease-in blow-up, capped to keep the native cutout crisp
      const op = t <= 0 ? 0 : t < 0.07 ? t / 0.07 : 1
      nugRef.current.style.opacity = String(op)
      nugRef.current.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${t * 12}deg)`
    }
    // There WAS a black overlay here, meant as a seamless black-to-black cut
    // into the next section. It produced a measured 600px corridor of nothing
    // instead. The scroll handler stops updating once the section leaves its
    // range, so the overlay kept whatever opacity it last wrote — full black —
    // while the sticky stage spent the rest of the section scrolling out. The
    // next section is already black, so the cut was buying nothing anyway.
  }

  return (
    <ScrollSequence frames={121} heightVh={270} onProgress={onProgress}>
      {/* genetics statement — outlined in JB yellow, owns the frame */}
      <div
        ref={statementRef}
        className="font-display pointer-events-none absolute inset-x-0 top-[13vh] z-10 text-center uppercase leading-[0.9] md:top-[10vh]"
        style={{ fontSize: 'min(16vw, 8rem)' }}
      >
        {/* three lines, not two: "Jungle Boys Genetics" was the longest run and
            it alone set the size ceiling. Split off "Genetics" and the widest
            line becomes "From Seed to Fire", which buys the whole lockup a jump
            in size and fills the black band it sits in. */}
        <span className="fl-stroke-accent block whitespace-nowrap">Jungle Boys</span>
        <span className="fl-stroke-accent block whitespace-nowrap">Genetics</span>
        <span className="fl-stroke-accent block whitespace-nowrap">From Seed to Fire</span>
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

    </ScrollSequence>
  )
}
