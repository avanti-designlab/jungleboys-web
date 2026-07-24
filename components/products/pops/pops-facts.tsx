'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Why Pops — the six facts ride a real 3D drum. The cards are placed around
// the surface of a cylinder with CSS `rotateX` + `translateZ`, and scrolling
// spins the drum so each fact turns to face you, gets read, and rolls away.
// The lit card scales up and its neighbours dim, so depth reads even on a flat
// panel. First use of true perspective on the site.
// Reduced-motion: the drum is flattened into a plain stacked list.

const FACTS = [
  { n: '01', head: '5G Jar', body: 'A full five grams in the candy-striped jar — the format built for sharing.' },
  { n: '02', head: 'Small Nug Flower', body: 'The same indoor cannabis flower, just in bite-size pops.' },
  { n: '03', head: 'Same Exotic Strains', body: 'Pulled from the identical premium exotic genetics as our top-shelf jars.' },
  { n: '04', head: 'Better Value', body: 'A friendlier price per gram without giving up an ounce of quality.' },
  { n: '05', head: 'Terpene-Rich', body: 'Full flavor profiles — the nose and the taste come through exactly the same.' },
  { n: '06', head: 'Hand-Selected', body: 'Every pop is picked by hand from the top of each harvest.' },
]

const STEP = 360 / FACTS.length // degrees between cards on the drum
const RADIUS = 300 // px out from the drum axis

export default function PopsFacts() {
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

          const drum = root.querySelector<HTMLElement>('[data-drum]')
          if (!drum) return

          const state = { rot: 0 }
          const paint = () => {
            gsap.set(drum, { rotateX: -state.rot })
            // card i faces the viewer when i*STEP === rot; use the signed
            // shortest angle to that, so 0 = dead ahead
            FACTS.forEach((_, i) => {
              const raw = i * STEP - state.rot
              const diff = ((raw + 180) % 360 + 360) % 360 - 180
              const facing = Math.max(0, 1 - Math.abs(diff) / STEP)
              const card = root.querySelector<HTMLElement>(`[data-fact="${i}"]`)
              const lit = Math.pow(facing, 1.7) // falls off fast — no ghost stack
              if (card) gsap.set(card, { opacity: 0.05 + lit * 0.95, scale: 0.86 + lit * 0.14 })
            })
          }
          paint()

          gsap.to(state, {
            rot: (FACTS.length - 1) * STEP,
            ease: 'none',
            onUpdate: paint,
            scrollTrigger: {
              trigger: root, start: 'top top', end: '+=260%',
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
    <section ref={rootRef} className="relative flex h-screen min-h-[560px] items-center overflow-hidden px-6">
      <div className="mx-auto grid w-full max-w-[1240px] items-center gap-10 lg:grid-cols-[0.82fr_1.18fr]">
        <h2
          className="font-display text-center uppercase leading-[0.8] text-[var(--pops-ink)] lg:text-left"
          style={{ fontSize: 'min(13vw, 7.5rem)' }}
        >
          Why <br className="hidden lg:block" /> they <span className="text-[var(--pops-red)]">hit</span>
        </h2>

        {/* the drum */}
        <div className="pops-scene relative h-[340px] md:h-[420px]">
          <div data-drum className="pops-3d absolute inset-0" style={{ transformOrigin: `50% 50% -${RADIUS}px` }}>
            {FACTS.map((f, i) => (
              <article
                key={f.n}
                data-fact={i}
                className="absolute inset-x-0 top-1/2 mx-auto max-w-[560px] -translate-y-1/2 rounded-[1.5rem] border-4 border-white bg-[var(--pops-red)] px-6 py-7 text-white shadow-[0_22px_50px_rgba(200,0,0,0.28)] md:px-9 md:py-9"
                style={{
                  transform: `rotateX(${i * STEP}deg) translateZ(${RADIUS}px)`,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                <p className="font-display text-2xl leading-none text-white/55">{f.n}</p>
                <h3 className="font-display mt-1 uppercase leading-[0.9]" style={{ fontSize: 'clamp(1.8rem, 4.4vw, 3rem)' }}>
                  {f.head}
                </h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-white/90 md:text-base" style={{ fontFamily: 'var(--font-brand)' }}>
                  {f.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
