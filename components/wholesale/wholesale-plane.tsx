'use client'

import { useEffect, useRef, useState } from 'react'

// The JB fighter plane flies across right→left and drops parachutes from its
// tail. Pure CSS (.ws-plane / .ws-chute in globals), gated on .is-flying;
// reduced-motion stills it.
//
// Two mounts (Avanti, 2026-08-04): DESKTOP flies across the HERO banner
// (startOn="reveal" — waits for the intro/age-gate to clear, else the flight
// finishes unseen behind the overlay, the recorded ungated-hero-anim trap);
// MOBILE keeps the original intro-section flyover (startOn="visible", IO).

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

export default function WholesalePlane({
  startOn = 'visible',
  className = '',
}: {
  startOn?: 'visible' | 'reveal'
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [flying, setFlying] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (startOn === 'reveal') {
      // hero mount: take off once the intro + age gate have cleared (same
      // pattern as hh-hero's video start), with a beat for the hero to settle
      let timer: number | null = null
      const start = () => {
        timer = window.setTimeout(() => setFlying(true), 700)
      }
      let cleared = false
      try {
        cleared = sessionStorage.getItem('jb-intro-done') === '1' && !!localStorage.getItem('jb-age-gate')
      } catch {}
      if (cleared || document.documentElement.classList.contains('jb-reveal')) {
        start()
      } else {
        window.addEventListener('jb:intro-done', start, { once: true })
        window.addEventListener('jb:gate-passed', start, { once: true })
      }
      return () => {
        if (timer) window.clearTimeout(timer)
        window.removeEventListener('jb:intro-done', start)
        window.removeEventListener('jb:gate-passed', start)
      }
    }

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
  }, [startOn])

  return (
    <div
      ref={ref}
      aria-hidden
      className={`ws-flyzone pointer-events-none absolute inset-0 z-20 overflow-hidden ${flying ? 'is-flying' : ''} ${className}`}
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
        <img src="/wholesale/plane.webp" alt="" className="h-auto w-full drop-shadow-[0_18px_34px_rgba(0,0,0,0.5)]" />
      </div>
    </div>
  )
}
