'use client'

import { useEffect, useRef, useState } from 'react'

// Hero — the intro film plays full-bleed in a wide rounded pill. HASH HOLE
// stays hidden while the film plays; it reveals — massive, white, covering
// most of the banner — the moment the visitor scrolls, or after 30s if they
// never do. One line, letter drop-in, then a white SCROLL bubble.

const WORD = 'HASH HOLE'

export default function HhHero() {
  const [revealed, setRevealed] = useState(false)
  const armed = useRef(false)

  useEffect(() => {
    if (armed.current) return
    armed.current = true
    const fire = () => setRevealed(true)
    // whichever comes first: any scroll, or 30s
    const onScroll = () => {
      if (window.scrollY > 4) fire()
    }
    window.addEventListener('scroll', onScroll, { passive: true, once: true })
    const timer = window.setTimeout(fire, 30000)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.clearTimeout(timer)
    }
  }, [])

  let li = 0
  return (
    <section className="relative px-2 pt-2 md:px-3">
      <div className="relative h-[92vh] min-h-[560px] overflow-hidden rounded-[1.75rem] bg-[#0b0b0d] md:rounded-[2.5rem]">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          poster="/products/hash-hole/hero-poster.webp"
        >
          <source src="/products/hash-hole/hero.mp4" type="video/mp4" />
        </video>
        {/* dim veil fades in with the wordmark so white type reads big */}
        <div
          aria-hidden
          className="absolute inset-0 transition-opacity duration-700"
          style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 50%, rgba(0,0,0,0.45), rgba(0,0,0,0.15))', opacity: revealed ? 1 : 0 }}
        />

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4">
          <h1
            className={`font-display select-none text-center uppercase leading-[0.8] text-white drop-shadow-[0_10px_40px_rgba(0,0,0,0.5)] ${revealed ? 'hh-reveal-on' : ''}`}
            style={{ fontSize: 'min(23vw, 20rem)' }}
          >
            {WORD.split('').map((ch) => (
              <span
                key={li}
                className="hh-letter-hold inline-block"
                style={{ transitionDelay: `${li++ * 0.045}s` }}
              >
                {ch === ' ' ? ' ' : ch}
              </span>
            ))}
          </h1>
          <a
            href="#hh-intro"
            className={`mt-4 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-extrabold uppercase tracking-[0.25em] text-[var(--hh-ink)] shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-all duration-500 hover:scale-105 ${revealed ? 'opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}
            style={{ fontFamily: 'var(--font-brand)', transitionDelay: revealed ? '0.6s' : '0s' }}
          >
            Scroll
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M12 5v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
