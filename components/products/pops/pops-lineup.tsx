'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// More Variety, Same Value — the full lineup as a scroll-linked coverflow.
// Vertical scroll drives a horizontal rail: jars slide past, and the one
// crossing the centre lifts, straightens out of its 3D tilt and brightens
// while its strain name swaps in beneath. Every jar is angled in perspective,
// so the rail reads as a shelf receding to both sides rather than a filmstrip.
// Reduced-motion + mobile: a plain swipeable row, no pin.

const JARS = [
  { key: 'bluog', name: 'Blu OG', type: 'Indica' },
  { key: 'bluzerdz', name: 'Blu Zerdz', type: 'Indica' },
  { key: 'cherriez', name: 'All Cherriez', type: 'Hybrid' },
  { key: 'lagelato', name: 'La Gelato', type: 'Hybrid' },
  { key: 'cherrygelato', name: 'Cherry Gelato', type: 'Hybrid' },
  { key: 'dosidos', name: 'Do-Si-Dos', type: 'Indica' },
  { key: 'gatorbreath', name: 'Gator Breath', type: 'Indica' },
  { key: 'junglecake', name: 'Jungle Cake', type: 'Hybrid' },
  { key: 'cochino', name: 'Cochino', type: 'Sativa' },
]

export default function PopsLineup() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add(
        {
          isDesktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
          isMobile: '(max-width: 767px)',
          reduce: '(prefers-reduced-motion: reduce)',
        },
        (mmCtx) => {
          const c = mmCtx.conditions as Record<string, boolean>
          if (!c.isDesktop) return

          const rail = root.querySelector<HTMLElement>('[data-rail]')
          const label = root.querySelector<HTMLElement>('[data-label]')
          const sub = root.querySelector<HTMLElement>('[data-sub]')
          if (!rail) return

          const state = { i: 0 }
          let shown = -1
          const paint = () => {
            JARS.forEach((_, i) => {
              const d = i - state.i // signed distance from centre, in slots
              const near = Math.max(0, 1 - Math.abs(d))
              const card = root.querySelector<HTMLElement>(`[data-jar="${i}"]`)
              if (!card) return
              gsap.set(card, {
                xPercent: -50,
                x: `${d * 19}vw`,
                rotateY: Math.max(-58, Math.min(58, -d * 34)),
                z: -Math.abs(d) * 210,
                scale: 0.66 + near * 0.58,
                // solid until they leave the rail — depth reads from scale and
                // perspective; transparency just made them look like ghosts
                opacity: Math.abs(d) > 3.4 ? 0 : Math.min(1, 0.82 + near * 0.18),
                zIndex: 100 - Math.round(Math.abs(d) * 10),
              })
            })
            const active = Math.round(state.i)
            if (active !== shown && JARS[active]) {
              shown = active
              if (label) label.textContent = JARS[active].name
              if (sub) sub.textContent = JARS[active].type
              gsap.fromTo([label, sub], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out', stagger: 0.04 })
            }
          }
          paint()

          gsap.to(state, {
            i: JARS.length - 1,
            ease: 'none',
            onUpdate: paint,
            scrollTrigger: {
              trigger: root, start: 'top top', end: '+=300%',
              pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true,
            },
          })
        }
      )
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative z-10 overflow-hidden py-14 md:flex md:h-screen md:min-h-[620px] md:items-center md:py-0">
      <div className="w-full">
        <h2
          className="font-display px-6 text-center uppercase leading-[0.82] text-[var(--pops-ink)]"
          style={{ fontSize: 'min(11vw, 6rem)' }}
        >
          More Variety. <span className="text-[var(--pops-red)]">Same Value.</span>
        </h2>

        {/* desktop: 3D coverflow rail */}
        <div className="pops-scene relative mt-10 hidden h-[46vh] min-h-[300px] md:block">
          <div data-rail className="pops-3d absolute inset-0">
            {JARS.map((j, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- jar art
              <img
                key={j.key}
                data-jar={i}
                src={`/products/pops/jar-${j.key}.webp`}
                alt={`${j.name} 5G Pops jar`}
                className="absolute left-1/2 top-1/2 h-full w-auto max-w-none -translate-y-1/2 will-change-transform drop-shadow-[0_30px_50px_rgba(0,0,0,0.3)]"
              />
            ))}
          </div>
        </div>

        {/* the jar crossing centre names itself */}
        <div className="mt-8 hidden text-center md:block">
          <p data-label className="font-display uppercase leading-none text-[var(--pops-ink)]" style={{ fontSize: 'min(7vw, 3.6rem)' }}>
            {JARS[0].name}
          </p>
          <p data-sub className="mt-1 text-xs font-extrabold uppercase tracking-[0.34em] text-[var(--pops-red)]" style={{ fontFamily: 'var(--font-brand)' }}>
            {JARS[0].type}
          </p>
        </div>

        {/* mobile: swipeable row, no pin */}
        <div className="mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {JARS.map((j) => (
            <figure key={j.key} className="w-[54vw] shrink-0 snap-center text-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- jar art */}
              <img src={`/products/pops/jar-${j.key}.webp`} alt={`${j.name} 5G Pops jar`} loading="lazy"
                className="mx-auto h-[38vh] w-auto drop-shadow-[0_22px_36px_rgba(0,0,0,0.28)]" />
              <figcaption className="font-display mt-3 text-2xl uppercase leading-none text-[var(--pops-ink)]">
                {j.name}
                <span className="mt-1 block text-[10px] font-extrabold tracking-[0.3em] text-[var(--pops-red)]" style={{ fontFamily: 'var(--font-brand)' }}>
                  {j.type}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
