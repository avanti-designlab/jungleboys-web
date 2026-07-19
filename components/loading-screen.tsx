'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { LOGO_PATHS as PATHS, LOGO_VIEWBOX } from '@/lib/logo-paths'

// First-load intro: the JB script logo draws itself in (stroke trace of the
// actual logo path), fill inks in, the screen flashes to brand yellow, then
// the page splits open top/bottom. Runs once per session; skipped entirely
// for reduced-motion visitors and return visits.

const SESSION_KEY = 'jb-intro-done'


export default function LoadingScreen() {
  const [show, setShow] = useState(true)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let skip = false
    try {
      skip =
        sessionStorage.getItem(SESSION_KEY) === '1' ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch {}
    if (skip) {
      setShow(false)
      return
    }

    const root = rootRef.current
    if (!root) return
    document.documentElement.style.overflow = 'hidden'
    const paths = root.querySelectorAll<SVGPathElement>('path')
    const panels = root.querySelectorAll<HTMLElement>('[data-panel]')
    const logo = root.querySelector('[data-logo]')

    // prep stroke-draw on the big script path; marks start hidden
    paths.forEach((p, i) => {
      const len = p.getTotalLength()
      p.style.fillOpacity = '0'
      p.style.strokeDasharray = `${len}`
      p.style.strokeDashoffset = i === 0 ? `${len}` : '0'
      if (i > 0) p.style.opacity = '0'
    })

    const tl = gsap.timeline({
      onComplete: () => {
        try {
          sessionStorage.setItem(SESSION_KEY, '1')
        } catch {}
        document.documentElement.style.overflow = ''
        window.dispatchEvent(new CustomEvent('jb:intro-done'))
        setShow(false)
      },
    })

    tl.to(paths[0], { strokeDashoffset: 0, duration: 1.5, ease: 'power1.inOut' }, 0.2)
      .to(paths, { fillOpacity: 1, duration: 0.35, ease: 'power2.out' }, 1.55)
      .to([paths[1], paths[2]], { opacity: 1, duration: 0.25 }, 1.6)
      // yellow flash — panels to brand yellow, logo flips to black
      .to(panels, { backgroundColor: '#FECF0E', duration: 0.3, ease: 'power2.inOut' }, 2.0)
      .to(logo, { color: '#0a0a0a', duration: 0.3 }, 2.0)
      // split open
      .to(logo, { scale: 1.06, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, 2.45)
      .to(panels[0], { yPercent: -100, duration: 0.7, ease: 'power4.inOut' }, 2.6)
      .to(panels[1], { yPercent: 100, duration: 0.7, ease: 'power4.inOut' }, 2.6)

    return () => {
      tl.kill()
      document.documentElement.style.overflow = ''
    }
  }, [])

  if (!show) return null

  return (
    <div ref={rootRef} className="fixed inset-0 z-[1200]" aria-hidden>
      <div data-panel className="absolute inset-x-0 top-0 h-1/2 bg-[#050505]" />
      <div data-panel className="absolute inset-x-0 bottom-0 h-1/2 bg-[#050505]" />
      <div
        data-logo
        className="absolute inset-0 flex items-center justify-center text-white"
      >
        <svg
          viewBox={LOGO_VIEWBOX}
          className="w-56 md:w-72"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="0.8"
        >
          {PATHS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </svg>
      </div>
    </div>
  )
}
