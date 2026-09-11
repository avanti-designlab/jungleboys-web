'use client'

import { useEffect } from 'react'

// Page-wide controller for the ORC reveals + light parallax (the hash-hole
// pattern): toggles `.is-in` on `.media-reveal` as it enters view — CSS owns
// the transition, so it works even with a frozen rAF clock — and drifts
// `[data-orc-plx]` cutouts against scroll. Reduced-motion: instant reveals,
// no drift.

export default function OrcRevealRoot() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const reveals = Array.from(document.querySelectorAll<HTMLElement>('.orc-page .media-reveal'))
    const plx = Array.from(document.querySelectorAll<HTMLElement>('[data-orc-plx]'))
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
          el.style.translate = `0 ${(d * parseFloat(el.dataset.orcPlx || '0') * vh).toFixed(1)}px`
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
