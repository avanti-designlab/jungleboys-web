'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// More Variety, Same Value — the full lineup as a scroll-linked coverflow, on a
// red ground. Vertical scroll drives the rail; the jar crossing centre lifts,
// straightens out of its tilt and names itself underneath. Click it and the
// quick facts expand: strain type, THC, effects, description, price.
//
// Everything shown comes from the frozen lib/dutchie interface via props, so
// Phase 3 swaps the provider and this populates itself. Only in-stock items
// reach the rail — that filter runs on variant quantityAvailable rather than a
// new ProductFilter field, since the filter interface is frozen.
//
// Reduced-motion + mobile: a plain swipeable row, no pin; the same tap-to-expand.

export type LineupItem = {
  id: string
  name: string
  image: string
  strainType?: string
  thc?: number
  description?: string
  effects?: string[]
  price?: string
  option?: string
}

const TYPE_COLOR: Record<string, string> = {
  indica: '#6f9bff',
  sativa: '#ff9b9b',
  hybrid: '#7ce6a0',
}

export default function PopsLineup({ items }: { items: LineupItem[] }) {
  const rootRef = useRef<HTMLElement>(null)
  const [open, setOpen] = useState<LineupItem | null>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root || items.length === 0) return
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
            items.forEach((_, i) => {
              const d = i - state.i
              const near = Math.max(0, 1 - Math.abs(d))
              const card = root.querySelector<HTMLElement>(`[data-jar="${i}"]`)
              if (!card) return
              gsap.set(card, {
                xPercent: -50,
                x: `${d * 19}vw`,
                rotateY: Math.max(-58, Math.min(58, -d * 34)),
                z: -Math.abs(d) * 210,
                scale: 0.66 + near * 0.58,
                opacity: Math.abs(d) > 3.4 ? 0 : Math.min(1, 0.82 + near * 0.18),
                zIndex: 100 - Math.round(Math.abs(d) * 10),
              })
            })
            const active = Math.round(state.i)
            if (active !== shown && items[active]) {
              shown = active
              if (label) label.textContent = items[active].name
              if (sub) sub.textContent = items[active].strainType ?? ''
              gsap.fromTo([label, sub], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out', stagger: 0.04 })
            }
          }
          paint()

          gsap.to(state, {
            i: items.length - 1,
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
  }, [items])

  // Escape closes the quick facts
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (items.length === 0) return null

  return (
    // solid pill on the striped page — the stripes show only in the gutter
    <section ref={rootRef} className="relative z-10 p-2 md:h-screen md:min-h-[680px] md:p-3">
      <div className="overflow-hidden rounded-[2rem] bg-[var(--pops-red)] py-14 text-white md:flex md:h-full md:items-center md:rounded-[3rem] md:py-0">
      <div className="relative w-full">
        <h2
          className="font-display px-6 text-center uppercase leading-[0.82] text-white"
          style={{ fontSize: 'min(11vw, 6rem)' }}
        >
          More Variety. <span className="text-[var(--pops-ink)]">Same Value.</span>
        </h2>

        {/* desktop: 3D coverflow rail */}
        <div className="pops-scene relative mt-8 hidden h-[42vh] min-h-[280px] md:block">
          <div data-rail className="pops-3d absolute inset-0">
            {items.map((j, i) => (
              <button
                key={j.id}
                data-jar={i}
                type="button"
                onClick={() => setOpen(j)}
                aria-label={`${j.name} — quick facts`}
                className="absolute left-1/2 top-1/2 h-full -translate-y-1/2 cursor-pointer border-0 bg-transparent p-0 will-change-transform"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- jar art */}
                <img src={j.image} alt={`${j.name} 5G Pops jar`} className="h-full w-auto max-w-none drop-shadow-[0_30px_50px_rgba(0,0,0,0.34)]" />
              </button>
            ))}
          </div>
        </div>

        {/* the jar crossing centre names itself — bigger, lower */}
        <div className="mt-10 hidden text-center md:block">
          <p data-label className="font-display uppercase leading-none text-white" style={{ fontSize: 'min(10vw, 5.5rem)' }}>
            {items[0].name}
          </p>
          <p data-sub className="mt-2 text-sm font-extrabold uppercase tracking-[0.38em] text-[var(--pops-ink)]" style={{ fontFamily: 'var(--font-brand)' }}>
            {items[0].strainType ?? ''}
          </p>
          <p className="mt-3 text-[11px] uppercase tracking-[0.28em] text-white/70" style={{ fontFamily: 'var(--font-brand)' }}>
            Tap a jar for quick facts
          </p>
        </div>

        {/* mobile: swipeable row, no pin */}
        <div className="mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((j) => (
            <button key={j.id} type="button" onClick={() => setOpen(j)} className="w-[54vw] shrink-0 snap-center border-0 bg-transparent p-0 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- jar art */}
              <img src={j.image} alt={`${j.name} 5G Pops jar`} loading="lazy"
                className="mx-auto h-[34vh] w-auto drop-shadow-[0_22px_36px_rgba(0,0,0,0.3)]" />
              <span className="font-display mt-3 block text-3xl uppercase leading-none text-white">
                {j.name}
                <span className="mt-1 block text-[10px] font-extrabold tracking-[0.3em] text-[var(--pops-ink)]" style={{ fontFamily: 'var(--font-brand)' }}>
                  {j.strainType ?? ''}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      </div>

      {/* ── quick facts ── */}
      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm md:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={`${open.name} quick facts`}
          onClick={() => setOpen(null)}
        >
          <div
            className="relative w-full max-w-[560px] overflow-hidden rounded-[1.75rem] bg-[#0b0b0d] text-white shadow-[0_30px_80px_rgba(0,0,0,0.6)] ring-1 ring-white/12"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              ✕
            </button>

            <div className="flex gap-4 p-5 md:gap-6 md:p-7">
              <div className="w-[34%] shrink-0 rounded-2xl bg-[linear-gradient(180deg,#241416_0%,#140c0d_100%)] p-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- jar art */}
                <img src={open.image} alt={`${open.name} 5G Pops jar`} className="h-full w-full object-contain" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-display text-4xl uppercase leading-[0.9] md:text-5xl">{open.name}</h3>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {open.strainType && (
                    <span
                      className="rounded-full border-2 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest"
                      style={{ fontFamily: 'var(--font-brand)', color: TYPE_COLOR[open.strainType] ?? '#7ce6a0', borderColor: TYPE_COLOR[open.strainType] ?? '#7ce6a0' }}
                    >
                      {open.strainType}
                    </span>
                  )}
                  {open.thc !== undefined && (
                    <span className="rounded-full border border-white/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white/80" style={{ fontFamily: 'var(--font-brand)' }}>
                      THC {open.thc}%
                    </span>
                  )}
                  {open.option && (
                    <span className="rounded-full bg-[var(--pops-red)] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white" style={{ fontFamily: 'var(--font-brand)' }}>
                      {open.option}
                    </span>
                  )}
                </div>

                {open.description && (
                  <p className="mt-3 text-sm leading-relaxed text-white/75" style={{ fontFamily: 'var(--font-brand)' }}>
                    {open.description}
                  </p>
                )}

                {open.effects && open.effects.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-white/45" style={{ fontFamily: 'var(--font-brand)' }}>Effects</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {open.effects.map((e) => (
                        <span key={e} className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white/85" style={{ fontFamily: 'var(--font-brand)' }}>
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {open.price && (
                  <p className="font-display mt-4 text-3xl leading-none">{open.price}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
