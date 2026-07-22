'use client'

import { useEffect, useRef, useState } from 'react'

// The JB fighter plane flies across the section right→left and drops parachutes
// from its tail. Triggers when the section scrolls into view (not on the hero,
// so it never covers the mascot). Pure CSS (.ws-plane / .ws-chute in globals),
// gated on .is-flying; reduced-motion stills it.

// left = where each parachute lands; delay is staggered so each drops as the
// plane's tail passes that point (right→left). w = size in px.
const CHUTES = [
  { left: '84%', top: '34%', w: 60, delay: 0.5 },
  { left: '69%', top: '62%', w: 90, delay: 0.95 },
  { left: '53%', top: '40%', w: 64, delay: 1.45 },
  { left: '38%', top: '66%', w: 52, delay: 1.9 },
  { left: '22%', top: '46%', w: 78, delay: 2.35 },
  { left: '10%', top: '70%', w: 48, delay: 2.75 },
]

export default function WholesalePlane() {
  const ref = useRef<HTMLDivElement>(null)
  const [flying, setFlying] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setFlying(true)
          io.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden
      className={`ws-flyzone pointer-events-none absolute inset-0 z-20 overflow-hidden ${flying ? 'is-flying' : ''}`}
    >
      {CHUTES.map((c, i) => (
        <div
          key={i}
          className="ws-chute absolute"
          style={{ left: c.left, top: c.top, width: c.w, ['--delay' as string]: `${c.delay}s` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- transparent art */}
          <img src="/wholesale/parachute.png" alt="" className="h-auto w-full drop-shadow-[0_10px_16px_rgba(0,0,0,0.4)]" />
        </div>
      ))}
      <div className="ws-plane absolute left-0 top-[4%] z-30 w-[min(58vw,660px)]">
        {/* eslint-disable-next-line @next/next/no-img-element -- transparent art */}
        <img src="/wholesale/plane.png" alt="" className="h-auto w-full drop-shadow-[0_18px_34px_rgba(0,0,0,0.5)]" />
      </div>
    </div>
  )
}
