'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Small Nugs. Loud Flavor. — the six facts flip through ONE fixed card slot
// like a rolodex: each card hinges up from below on rotateX, sits square and
// full-size dead centre while you read it, then hinges away over the top.
//
// The first pass put the cards around a rotating drum, which threw them out of
// frame and rescaled them as they came round. Here every card shares the exact
// same box, so the slot never moves and nothing ever leaves the frame — the
// depth comes from the hinge, not from travel.
//
// Icons are the originals from the Figma design (exported as SVG, recoloured to
// currentColor so one set works on both the red cards and dark panels).

const FACTS = [
  { icon: 'jar', ar: 41 / 87, head: '5G Jar', body: 'A full five grams in the candy-striped jar — the format built for sharing.' },
  { icon: 'nug', ar: 81 / 61, head: 'Small Nug Flower', body: 'The same indoor cannabis flower, just in bite-size pops.' },
  { icon: 'strains', ar: 73 / 74, head: 'Same Exotic Strains', body: 'Pulled from the identical premium exotic genetics as our top-shelf jars.' },
  { icon: 'value', ar: 64 / 66, head: 'Better Value', body: 'A friendlier price per gram without giving up an ounce of quality.' },
  { icon: 'terps', ar: 65 / 67, head: 'Terpene-Rich', body: 'Full flavor profiles — the nose and the taste come through exactly the same.' },
  { icon: 'hand', ar: 67 / 68, head: 'Hand-Selected', body: 'Every pop is picked by hand from the top of each harvest.' },
]

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

          // STRICT SEQUENTIAL HANDOVER. Any symmetric fade leaves the outgoing
          // and incoming cards both part-visible and stacked — measured at two
          // cards on screen for 85% of the scroll, which is the bleed-through
          // that read as glitching. So: the current card flips away and is
          // fully gone BEFORE the next one starts flipping in.
          // kept tight: a longer handover means a longer stretch with an EMPTY
          // slot, which flickers just as badly as the overlap did
          const OUT_FROM = 0.76 // frac of a step where the current starts leaving
          const OUT_TO = 0.88 //                     …and is fully gone
          const state = { i: 0 }
          const paint = () => {
            const base = Math.min(FACTS.length - 1, Math.floor(state.i))
            const frac = state.i - base
            FACTS.forEach((_, i) => {
              const card = root.querySelector<HTMLElement>(`[data-fact="${i}"]`)
              const dot = root.querySelector<HTMLElement>(`[data-dot="${i}"]`)
              if (!card) return

              let rot = 0
              let op = 0
              let y = 0
              if (i === base) {
                if (frac < OUT_FROM) { rot = 0; op = 1; y = 0 }
                else if (frac < OUT_TO) {
                  const u = (frac - OUT_FROM) / (OUT_TO - OUT_FROM)
                  rot = -u * 85; op = 1 - u; y = -u * 26
                }
              } else if (i === base + 1 && frac >= OUT_TO) {
                const v = (frac - OUT_TO) / (1 - OUT_TO)
                rot = (1 - v) * 85; op = v; y = (1 - v) * 26
              }

              gsap.set(card, { rotateX: rot, yPercent: y, opacity: op, zIndex: op > 0.5 ? 10 : 1 })

              const activeDot = frac >= OUT_TO ? base + 1 : base
              if (dot) {
                const on = i === activeDot
                gsap.set(dot, { scaleX: on ? 1 : 0.25, opacity: on ? 1 : 0.3 })
              }
            })
          }
          paint()

          gsap.to(state, {
            i: FACTS.length - 1,
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
    // solid pill on the striped page — the stripes show only in the gutter
    <section id="pops-facts" ref={rootRef} className="pops-slide relative z-10 h-screen min-h-[620px] scroll-mt-0 p-2 md:p-3">
      <div data-reveal className="pops-reveal flex h-full w-full items-center overflow-hidden rounded-[2rem] bg-[#0b0b0d] px-6 text-white md:rounded-[3rem]">
      <div className="relative mx-auto grid w-full max-w-[1240px] items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <h2
          className="font-display text-center uppercase leading-[0.78] text-white lg:text-left"
          style={{ fontSize: 'min(15vw, 8.5rem)' }}
        >
          Small <br /> Nugs. <br />
          <span className="text-[var(--pops-red)]">Loud <br /> Flavor.</span>
        </h2>

        {/* the slot — fixed box, cards hinge through it */}
        <div className="pops-scene relative">
          <div className="pops-3d relative mx-auto h-[300px] w-full max-w-[560px] md:h-[340px]">
            {FACTS.map((f, i) => (
              <article
                key={f.icon}
                data-fact={i}
                className="absolute inset-0 flex flex-col justify-center rounded-[1.6rem] border-4 border-white bg-[var(--pops-red)] px-7 py-8 text-white shadow-[0_24px_54px_rgba(200,0,0,0.3)] md:px-10"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transformOrigin: '50% 50% -180px' }}
              >
                {/* masked, not <img>: an <img>-loaded SVG is an isolated
                    document, so its currentColor can never pick up this card's
                    text colour. The mask paints the glyph in bg-current. */}
                <span
                  aria-hidden
                  className="block h-12 shrink-0 bg-current md:h-14"
                  style={{
                    width: `calc(3.5rem * ${f.ar})`,
                    WebkitMaskImage: `url(/products/pops/icons/${f.icon}.svg)`,
                    maskImage: `url(/products/pops/icons/${f.icon}.svg)`,
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'left center',
                    maskPosition: 'left center',
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                  }}
                />
                <h3 className="font-display mt-4 uppercase leading-[0.9]" style={{ fontSize: 'clamp(2rem, 4.6vw, 3.2rem)' }}>
                  {f.head}
                </h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-white/90 md:text-base" style={{ fontFamily: 'var(--font-brand)' }}>
                  {f.body}
                </p>
              </article>
            ))}
          </div>

          {/* progress ticks */}
          <div className="mx-auto mt-7 flex max-w-[560px] gap-2">
            {FACTS.map((f, i) => (
              <span key={f.icon} data-dot={i} className="h-1.5 flex-1 origin-left rounded-full bg-[var(--pops-red)]" />
            ))}
          </div>
        </div>
        </div>
      </div>
    </section>
  )
}
