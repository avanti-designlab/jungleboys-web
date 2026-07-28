'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

// NO PREP. ALL FIRE. — travelling VERTICALLY, and flipping from solid to
// outlined exactly where it crosses the pre-roll.
//
// How the flip works: the copy is rendered TWICE, in perfect register — once
// solid, once as a lime outline. Each layer is then masked by the joint's own
// alpha, complementarily:
//
//   outline layer -> mask-image: the joint          (shows only ON the joint)
//   solid layer   -> the joint SUBTRACTED from a full-bleed rectangle, via
//                    mask-composite: exclude        (shows only OFF the joint)
//
// So the two layers tile the plane exactly and the boundary is the joint's real
// silhouette — tapered tip, rounded ends and all — instead of a rectangle.
//
// The joint is painted as a BACKGROUND rather than an <img> so the visible plate
// and both masks can be driven from one shared set of position/size values.
// Aligning a mask to a separately-laid-out <img> is exactly the kind of thing
// that drifts the moment a breakpoint changes.
//
// Both marquees are moved by ONE tween with two targets. Two matched CSS
// animations would start whenever each element happened to begin animating; a
// single tween writing identical transforms cannot drift.

const PLATE_URL = '/products/pre-rolls/joint-h.webp'
const PLATE_POS = 'center 50%'
const PLATE_SIZE = '94% auto'

const plate = {
  backgroundImage: `url(${PLATE_URL})`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: PLATE_POS,
  backgroundSize: PLATE_SIZE,
}

// shows ONLY where the joint is
const maskOnJoint = {
  WebkitMaskImage: `url(${PLATE_URL})`,
  maskImage: `url(${PLATE_URL})`,
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskPosition: PLATE_POS,
  maskPosition: PLATE_POS,
  WebkitMaskSize: PLATE_SIZE,
  maskSize: PLATE_SIZE,
}

// shows everywhere EXCEPT the joint — a full-bleed rectangle with the joint
// punched out of it. -webkit-mask-composite: xor is Safari's spelling of exclude.
const maskOffJoint = {
  WebkitMaskImage: `linear-gradient(#000, #000), url(${PLATE_URL})`,
  maskImage: `linear-gradient(#000, #000), url(${PLATE_URL})`,
  WebkitMaskRepeat: 'no-repeat, no-repeat',
  maskRepeat: 'no-repeat, no-repeat',
  WebkitMaskPosition: `0 0, ${PLATE_POS}`,
  maskPosition: `0 0, ${PLATE_POS}`,
  WebkitMaskSize: `100% 100%, ${PLATE_SIZE}`,
  maskSize: `100% 100%, ${PLATE_SIZE}`,
  WebkitMaskComposite: 'xor',
  maskComposite: 'exclude',
}

const LINE = 'One joint. All fire.'
const REPEATS = 7

function Column({ outlined }: { outlined: boolean }) {
  const rows = Array.from({ length: REPEATS }, (_, i) => (
    <span
      key={i}
      className="block whitespace-nowrap text-center"
      style={{
        fontSize: 'var(--pr-line-size)',
        letterSpacing: '-0.035em',
        lineHeight: 1.02,
        ...(outlined
          ? {
              color: 'transparent',
              WebkitTextStroke: 'clamp(1.4px, 0.22vw, 3px) var(--pr-lime)',
            }
          : { color: '#ffffff' }),
      }}
    >
      {LINE}
    </span>
  ))
  return (
    <div data-pr-marq className="font-display w-full uppercase will-change-transform">
      <div>{rows}</div>
      {/* second copy makes the -50% loop seamless */}
      <div aria-hidden>{rows}</div>
    </div>
  )
}

export default function PrCrossover() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add(
        { reduce: '(prefers-reduced-motion: reduce)', noPref: '(prefers-reduced-motion: no-preference)' },
        (mmCtx) => {
          const c = mmCtx.conditions as Record<string, boolean>
          if (c.reduce) return
          // ONE tween, both layers — see the note at the top of this file
          gsap.to('[data-pr-marq]', {
            yPercent: -50,
            duration: 26,
            ease: 'none',
            repeat: -1,
          })
        }
      )
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    // Full bleed, no pill: every other section on this page is a rounded panel,
    // and boxing a scrolling band inside one made it read as a widget. Running
    // it edge to edge on flat black lets it behave like a band the page passes
    // through, which is what it is.
    <section ref={rootRef} className="relative z-10">
      <div
        data-nav-theme="dark"
        className="relative h-[62vh] min-h-[380px] overflow-hidden bg-[var(--pr-black)]"
        // Sized in vw with no rem cap so the line always spans the full width.
        // The old min(13.5vw, 8.5rem) capped out and left the copy floating in
        // the middle of the panel with dead margins either side. The coefficient
        // is measured, not guessed — see the note below.
        style={{ ['--pr-line-size' as string]: '17.7vw' }}
      >
        {/* glow under the joint so it reads as lit, not pasted on */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[1]"
          style={{ background: 'radial-gradient(52% 26% at 50% 50%, rgba(125,255,79,0.22) 0%, rgba(125,255,79,0) 72%)' }} />

        {/* the pre-roll itself */}
        <div aria-hidden className="absolute inset-0 z-10 drop-shadow-[0_24px_50px_rgba(0,0,0,0.6)]" style={plate} />

        {/* solid copy — everywhere the joint ISN'T */}
        <div className="absolute inset-0 z-20 flex items-center justify-center overflow-hidden" style={maskOffJoint}>
          <Column outlined={false} />
        </div>

        {/* outlined copy — only ON the joint */}
        <div className="absolute inset-0 z-30 flex items-center justify-center overflow-hidden" style={maskOnJoint}>
          <Column outlined />
        </div>
      </div>
    </section>
  )
}
