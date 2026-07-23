'use client'

import { useEffect } from 'react'

// One page-wide controller for the hash-hole reveals + light parallax, so each
// content section can stay a plain server component. Toggles `.is-in` on every
// `.media-reveal` as it enters view (CSS drives the actual transition — works
// even when a preview's rAF clock is frozen), and drifts `[data-hh-plx]`
// elements against scroll. Reduced-motion: reveals show immediately, no drift.

export default function HhRevealRoot() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const reveals = Array.from(document.querySelectorAll<HTMLElement>('.media-reveal'))
    const plx = Array.from(document.querySelectorAll<HTMLElement>('[data-hh-plx]'))
    let raf = 0

    const tick = () => {
      raf = 0
      const vh = window.innerHeight
      reveals.forEach((el) => {
        if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < vh * 0.86) el.classList.add('is-in')
      })
      if (!reduce) {
        plx.forEach((el) => {
          const r = el.getBoundingClientRect()
          const d = (r.top + r.height / 2 - vh / 2) / vh
          el.style.translate = `0 ${(d * parseFloat(el.dataset.hhPlx || '0') * vh).toFixed(1)}px`
        })
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const t = setTimeout(tick, 150)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      clearTimeout(t)
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return null
}
