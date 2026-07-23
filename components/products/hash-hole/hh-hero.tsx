'use client'

import { useEffect, useRef } from 'react'

// Hero — the intro film plays full-bleed in a wide rounded pill that zooms in
// on entry (media-hero-in, released by RevealGate once the loading intro + age
// gate clear — same as every other page). The video holds until that reveal so
// it doesn't run behind the loading screen. Just a white SCROLL bubble with a
// gently bouncing arrow beneath.

export default function HhHero() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const start = () => v.play().catch(() => {})
    // if the intro + gate already cleared (refresh / return), play now
    let cleared = false
    try {
      cleared = sessionStorage.getItem('jb-intro-done') === '1' && !!localStorage.getItem('jb-age-gate')
    } catch {}
    if (cleared || document.documentElement.classList.contains('jb-reveal')) {
      start()
      return
    }
    // otherwise wait for the loading intro / age gate to finish
    window.addEventListener('jb:intro-done', start, { once: true })
    window.addEventListener('jb:gate-passed', start, { once: true })
    return () => {
      window.removeEventListener('jb:intro-done', start)
      window.removeEventListener('jb:gate-passed', start)
    }
  }, [])

  return (
    <section className="relative px-2 pt-2 md:px-3">
      {/* the header samples this region: dark video → dark header pill */}
      <div data-nav-theme="dark" className="media-hero-in relative h-[92vh] min-h-[560px] overflow-hidden rounded-[1.75rem] bg-[#0b0b0d] md:rounded-[2.5rem]">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          loop
          muted
          playsInline
          preload="auto"
          poster="/products/hash-hole/hero-poster.webp"
        >
          <source src="/products/hash-hole/hero.mp4" type="video/mp4" />
        </video>

        <a
          href="#hh-intro"
          className="absolute bottom-8 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-extrabold uppercase tracking-[0.25em] text-[var(--hh-ink)] shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-transform hover:scale-105"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          Scroll
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" className="hh-arrow-bounce" aria-hidden>
            <path d="M12 5v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </section>
  )
}
