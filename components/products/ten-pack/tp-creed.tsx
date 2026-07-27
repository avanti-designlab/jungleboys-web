'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// NO TRIM. NO SHAKE. NO SHORTCUTS. Three refusals, so they land as three —
// each line wipes in on its own beat rather than the block fading up together.
// The jar pushes toward you through the whole pass.

const LINES = ['No trim.', 'No shake.', 'No shortcuts.']

export default function TpCreed() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add(
        { reduce: '(prefers-reduced-motion: reduce)', noPref: '(prefers-reduced-motion: no-preference)' },
        (mmCtx) => {
          const c = mmCtx.conditions as Record<string, boolean>
          if (c.reduce) return

          const tl = gsap.timeline({
            scrollTrigger: { trigger: root, start: 'top 78%', end: 'bottom 60%', scrub: 0.7 },
          })

          LINES.forEach((_, i) => {
            tl.fromTo(`[data-tp-creed="${i}"]`,
              { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
              { clipPath: 'inset(0 0% 0 0)', opacity: 1, ease: 'power2.out', duration: 0.24 },
              0.06 + i * 0.16)
          })
          tl.fromTo('[data-tp-creed-jar]', { yPercent: 16, scale: 0.92 }, { yPercent: -6, scale: 1.04, ease: 'none', duration: 1 }, 0)
        }
      )
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative z-10 px-2 py-2 md:px-3 md:py-3">
      <div
        data-nav-theme="dark"
        className="relative overflow-hidden rounded-[1.75rem] md:rounded-[2.5rem]"
        style={{ background: 'linear-gradient(110deg,#0b5897 0%,#0e6fb8 46%,#07406f 100%)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- texture */}
        <img src="/products/10-pack/smoke.webp" alt="" aria-hidden
          className="tp-smoke-a pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-screen" />

        <div className="relative grid grid-cols-1 items-center gap-6 px-6 py-14 md:grid-cols-[0.85fr_1.15fr] md:gap-10 md:px-14 md:py-20">
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
            <img data-tp-creed-jar src="/products/10-pack/jar-all-cherriez.webp" alt="Jungle Boys 10 Pack Pre-Rolls"
              className="h-[34vh] max-h-[400px] w-auto will-change-transform drop-shadow-[0_30px_54px_rgba(2,20,40,0.6)] md:h-[44vh]" />
          </div>

          <h2 className="font-display uppercase leading-[0.86] text-white" style={{ letterSpacing: '-0.03em' }}>
            {LINES.map((l, i) => (
              <span key={l} data-tp-creed={i} className="block will-change-[clip-path]" style={{ fontSize: 'min(13vw, 6rem)' }}>
                {l}
              </span>
            ))}
          </h2>
        </div>
      </div>
    </section>
  )
}
