'use client'

import { useEffect } from 'react'

// Page-wide motion controller for ORC (hash-hole pattern, extended for v4):
//  • `.media-reveal` gets `.is-in` as it enters (CSS owns the transition)
//  • `[data-orc-plx]` drifts against scroll (viewport-centered delta)
//  • `[data-orc-rot]` spins slowly with scroll (deg across a viewport of
//    travel), preserving a `data-orc-rot-base` starting angle
//  • `[data-orc-pin]` (the pinned sections) gets a `--p` custom property,
//    0→1 across its own scroll span — children animate with pure CSS calc()
// All rAF + transform/opacity; reduced-motion keeps reveals instant and
// leaves --p driven (it tracks scroll position, not a clock).

export default function OrcRevealRoot() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const q = <T extends HTMLElement>(s: string) => Array.from(document.querySelectorAll<T>(s))
    const reveals = q('.orc-page .media-reveal')
    const plx = q<HTMLElement>('[data-orc-plx]')
    const rot = q<HTMLElement>('[data-orc-rot]')
    const pins = q<HTMLElement>('[data-orc-pin]')
    let raf = 0

    const tick = () => {
      raf = 0
      const vh = window.innerHeight
      reveals.forEach((el) => {
        if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < vh * 0.86) el.classList.add('is-in')
      })
      pins.forEach((el) => {
        const r = el.getBoundingClientRect()
        const total = Math.max(1, r.height - vh)
        const p = Math.min(1, Math.max(0, -r.top / total))
        el.style.setProperty('--p', p.toFixed(4))
      })
      if (!reduce) {
        plx.forEach((el) => {
          const r = el.getBoundingClientRect()
          const d = (r.top + r.height / 2 - vh / 2) / vh
          el.style.translate = `0 ${(d * parseFloat(el.dataset.orcPlx || '0') * vh).toFixed(1)}px`
        })
        rot.forEach((el) => {
          const r = el.getBoundingClientRect()
          const d = (r.top + r.height / 2 - vh / 2) / vh
          const base = parseFloat(el.dataset.orcRotBase || '0')
          el.style.rotate = `${(base + d * parseFloat(el.dataset.orcRot || '0')).toFixed(2)}deg`
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
