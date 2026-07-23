'use client'

import { useEffect, useRef } from 'react'

// Fixed sky behind the whole page: a day-blue gradient that warms toward the
// golf-course finale, the real Figma clouds drifting in two bands, and birds
// crossing on loops. Pure transform/opacity; reduced-motion stills it.

const CLOUDS = ['cloud-a', 'cloud-b', 'cloud-c', 'cloud-d']

function CloudRow({ cls, opacity, sizes }: { cls: string; opacity: number; sizes: number[] }) {
  return (
    <div className={`absolute flex w-[200%] ${cls}`} style={{ opacity }}>
      {[0, 1].map((k) => (
        <div key={k} className="flex w-1/2 shrink-0 items-start justify-around">
          {sizes.map((w, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- decorative cloud
            <img
              key={i}
              src={`/products/hash-hole/${CLOUDS[(i + k) % CLOUDS.length]}.webp`}
              alt=""
              aria-hidden
              className="shrink-0"
              style={{ width: `${w}vw`, minWidth: w * 3, transform: `translateY(${(i % 3) * 26 - 14}px)` }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function Bird({ style }: { style: React.CSSProperties }) {
  return (
    <span className="hh-bird absolute" style={style} aria-hidden>
      <svg viewBox="0 0 40 16" width="40" height="16" fill="none" stroke="rgba(14,42,23,0.5)" strokeWidth="2.4" strokeLinecap="round">
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
        warm.style.opacity = String(Math.max(0, (p - 0.55) / 0.45))
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
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #7fd0f7 0%, #4db2ef 55%, #63c3f5 100%)' }} />
      <div ref={warmRef} className="absolute inset-0 opacity-0" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(255,220,130,0.22) 72%, rgba(150,210,120,0.35) 100%)' }} />
      {/* cloud bands */}
      <div className="absolute inset-x-0 top-[6vh] h-[46vh]">
        <CloudRow cls="hh-clouds-slow top-0" opacity={0.9} sizes={[15, 22, 13]} />
        <CloudRow cls="hh-clouds top-[24vh]" opacity={1} sizes={[19, 12, 24]} />
      </div>
      {/* birds */}
      <Bird style={{ top: '16vh', ['--s' as string]: 0.8, animationDuration: '30s', animationDelay: '0s' }} />
      <Bird style={{ top: '28vh', ['--s' as string]: 1.1, animationDuration: '38s', animationDelay: '10s' }} />
      <Bird style={{ top: '11vh', ['--s' as string]: 0.6, animationDuration: '46s', animationDelay: '22s' }} />
    </div>
  )
}
