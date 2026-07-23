'use client'

import { useEffect, useRef } from 'react'

// Fixed sky behind the whole page: a day-blue gradient that warms slightly as
// you scroll toward the golf-course finale, two drifting cloud bands, and a few
// birds crossing on loops. Pure transform/opacity; reduced-motion stills it.

function Cloud({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 220 90" className={className} style={style} aria-hidden fill="#ffffff">
      <ellipse cx="60" cy="60" rx="60" ry="28" />
      <ellipse cx="110" cy="46" rx="50" ry="34" />
      <ellipse cx="160" cy="60" rx="55" ry="26" />
      <rect x="30" y="58" width="160" height="26" rx="13" />
    </svg>
  )
}

function CloudRow({ cls, opacity }: { cls: string; opacity: number }) {
  // two copies for a seamless -50% loop
  return (
    <div className={`absolute flex w-[200%] ${cls}`} style={{ opacity }}>
      {[0, 1].map((k) => (
        <div key={k} className="flex w-1/2 shrink-0 items-start justify-around">
          <Cloud className="w-[16vw] min-w-[130px]" />
          <Cloud className="w-[22vw] min-w-[180px] -translate-y-6" />
          <Cloud className="w-[13vw] min-w-[110px] translate-y-10" />
          <Cloud className="w-[19vw] min-w-[150px] -translate-y-2" />
        </div>
      ))}
    </div>
  )
}

function Bird({ style }: { style: React.CSSProperties }) {
  return (
    <span className="hh-bird absolute" style={style} aria-hidden>
      <svg viewBox="0 0 40 16" width="40" height="16" fill="none" stroke="rgba(14,42,23,0.55)" strokeWidth="2.4" strokeLinecap="round">
        <path d="M2 12 Q11 2 20 11 Q29 2 38 12" />
      </svg>
    </span>
  )
}

export default function HhSky() {
  const warmRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const warm = warmRef.current
    if (!warm) return
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const p = Math.min(1, window.scrollY / (document.body.scrollHeight - window.innerHeight || 1))
        warm.style.opacity = String(Math.max(0, (p - 0.4) / 0.6)) // warm haze fades in lower down
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* base day gradient */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, var(--hh-sky-top) 0%, var(--hh-sky-mid) 55%, #7fd0f7 100%)' }} />
      {/* warm haze that grows toward the finale */}
      <div ref={warmRef} className="absolute inset-0 opacity-0" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(255,214,120,0.25) 70%, rgba(150,210,120,0.4) 100%)' }} />
      {/* cloud bands */}
      <div className="absolute inset-x-0 top-[8vh] h-[40vh]">
        <CloudRow cls="hh-clouds-slow top-0" opacity={0.55} />
        <CloudRow cls="hh-clouds top-[22vh]" opacity={0.85} />
      </div>
      {/* birds */}
      <Bird style={{ top: '18vh', ['--s' as string]: 0.8, animationDuration: '26s', animationDelay: '0s' }} />
      <Bird style={{ top: '30vh', ['--s' as string]: 1.1, animationDuration: '34s', animationDelay: '8s' }} />
      <Bird style={{ top: '12vh', ['--s' as string]: 0.6, animationDuration: '40s', animationDelay: '18s' }} />
    </div>
  )
}
