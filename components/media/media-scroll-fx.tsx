'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Premium scroll motion for the media page (Standard tier):
//  - banner background parallaxes as you scroll past (depth) — GSAP scrub
//  - .media-reveal elements (headline, latest pill) rise + fade in on entry —
//    driven by a scroll handler that toggles a CSS class, so the reveal runs on
//    the compositor (no dependency on a JS animation loop) and can't get stuck
//    hidden. A timeout failsafe reveals anything still hidden.
// Tile reveals live in MediaHub. Everything is transform/opacity only.

gsap.registerPlugin(ScrollTrigger)

export default function MediaScrollFx() {
  useEffect(() => {
    // CSS-class reveal (reliable everywhere)
    const els = Array.from(document.querySelectorAll<HTMLElement>('.media-reveal'))
    let raf = 0
    const reveal = () => {
      raf = 0
      els.forEach((el) => {
        if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < window.innerHeight * 0.9) {
          el.classList.add('is-in')
        }
      })
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(reveal)
    }
    const t = setTimeout(reveal, 200)
    const failsafe = setTimeout(() => els.forEach((el) => el.classList.add('is-in')), 2600)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    // banner parallax (GSAP scrub). Image is scaled 110%, so ±7% drift never
    // exposes an edge — and if the scrub can't run, the banner just stays static.
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const banner = document.querySelector('[data-media-banner]')
      const bg = document.querySelector('[data-media-bg]')
      if (banner && bg) {
        gsap.fromTo(
          bg,
          { yPercent: -7 },
          { yPercent: 7, ease: 'none', scrollTrigger: { trigger: banner, start: 'top top', end: 'bottom top', scrub: true } }
        )
      }
    })

    return () => {
      clearTimeout(t)
      clearTimeout(failsafe)
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      mm.revert()
    }
  }, [])

  return null
}
