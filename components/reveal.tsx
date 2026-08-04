'use client'

import { useEffect, useRef } from 'react'

// Scroll-reveal wrapper — Standard motion tier (frozen tokens: 24px translate
// max, 0.7s, cinematic ease). REBUILT 2026-08-04 on the site's own CSS
// mechanism (.jb-reveal-block + .is-in, like .media-reveal everywhere else)
// instead of GSAP ScrollTrigger: the GSAP version animated headlessly but
// never in Avanti's preview pane (frozen ticker — recorded), which read as
// "no motion on any of the pages". CSS transitions + an IntersectionObserver
// run anywhere. Children render server-side; animation only enhances, and
// prefers-reduced-motion neutralizes the hidden start state in globals.css.

export default function Reveal({
  children,
  delay = 0,
  className,
  slide = false,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  /** transform-only (no opacity-0 start) — use on tiles that hold the LCP
      image, where an invisible start would push the LCP paint out */
  slide?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || el.classList.contains('is-in')) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add('is-in')
            io.disconnect()
          }
        }
      },
      // mirrors the old "top 85%" trigger line
      { rootMargin: '0px 0px -15% 0px' }
    )
    io.observe(el)
    // failsafe, same as the locations directory: nothing stays invisible if
    // the observer never fires (odd embed contexts)
    const fs = window.setTimeout(() => el.classList.add('is-in'), 2600)
    return () => {
      io.disconnect()
      window.clearTimeout(fs)
    }
  }, [])

  return (
    <div
      ref={ref}
      className={`${slide ? 'jb-reveal-slide' : 'jb-reveal-block'} ${className ?? ''}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  )
}
