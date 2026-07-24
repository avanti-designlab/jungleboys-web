'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Intro — "The Tee Box". A fairway green rolls up from the bottom of the
// section, the HASH HOLE flag plants dead-centre like a pin, and the four spec
// signs hammer into the turf on staked posts — two per side, staggered depths,
// so it reads like real course signage instead of floating boxes. Everything
// is Bebas. After the entrance the diorama idles: flag floats, signs sway
// slowly out of sync. Reduced-motion: planted and still.

type Sign = {
  big: string
  small: string
  layout: 'inline' | 'stacked'
  side: 'left' | 'right'
  inset: number // % from its side
  bottom: number // % where the SIGN base sits (post runs from here into the hill)
  post: number // post height as % of stage height
  rot: number // resting tilt
  // wind: own period/phase/amplitude — shared values make signs move in lockstep
  dur: number
  delay: number
  amp: number
}

const SIGNS: Sign[] = [
  { big: '2G', small: 'Indoor\nFlower', layout: 'inline', side: 'left', inset: 4, bottom: 46, post: 30, rot: -3, dur: 4.9, delay: -1.3, amp: 2.3 },
  { big: '.5G', small: 'Hash\nRosin', layout: 'inline', side: 'left', inset: 11, bottom: 28, post: 14, rot: 2.5, dur: 5.7, delay: -0.4, amp: 2.7 },
  { big: 'Organic', small: 'Wood Tip', layout: 'stacked', side: 'right', inset: 11, bottom: 46, post: 30, rot: 3, dur: 5.2, delay: -2.2, amp: 2.1 },
  { big: 'All Natural', small: 'Unrefined Paper', layout: 'stacked', side: 'right', inset: 4, bottom: 28, post: 14, rot: -2.5, dur: 6.1, delay: -3.1, amp: 2.5 },
]

// Bebas ships a single weight, so the small labels are optically thinned by
// stroking the glyph edges with the sign's own green (hh-sign-thin) — the big
// values keep the full bold cut. Rows are flex-centred, not baseline-aligned:
// Bebas sits low in its em box and baseline alignment reads off-centre.
function SignFace({ s }: { s: Sign }) {
  return (
    <div className="hh-plaque font-display flex items-center justify-center text-white" style={{ ['--rot' as string]: '0deg' }}>
      {s.layout === 'inline' ? (
        <span className="flex items-center gap-[0.32em] px-[0.72em] py-[0.5em]">
          <span className="whitespace-nowrap leading-[0.85]" style={{ fontSize: '1em' }}>{s.big}</span>
          <span className="hh-sign-thin whitespace-nowrap uppercase leading-[0.85]" style={{ fontSize: '0.5em', letterSpacing: '0.045em' }}>
            {s.small.replace('\n', ' ')}
          </span>
        </span>
      ) : (
        <span className="flex flex-col items-center gap-[0.06em] px-[0.72em] py-[0.42em] text-center">
          <span className="whitespace-nowrap leading-[0.85]" style={{ fontSize: '0.72em' }}>{s.big}</span>
          <span className="hh-sign-thin whitespace-nowrap uppercase leading-[0.85]" style={{ fontSize: '0.42em', letterSpacing: '0.05em' }}>
            {s.small}
          </span>
        </span>
      )}
    </div>
  )
}

export default function HhIntro() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set('[data-logo]', { xPercent: -50 })
        const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 70%', once: true } })
        // 1. the course rises
        tl.from('[data-hill="back"]', { yPercent: 70, duration: 0.55, ease: 'power2.out' }, 0)
          .from('[data-hill="front"]', { yPercent: 80, duration: 0.55, ease: 'power2.out' }, 0.08)
          // 2. the pin plants
          .from('[data-logo]', { opacity: 0, y: -110, scale: 0.9, duration: 0.7, ease: 'back.out(1.45)' }, 0.3)
        // 3. signs hammer in, one per beat (i % 4: desktop + mobile both render)
        root.querySelectorAll<HTMLElement>('[data-sign]').forEach((el, i) => {
          const k = i % 4
          tl.from(el, { opacity: 0, y: -150, rotate: k % 2 ? 9 : -9, duration: 0.55, ease: 'back.out(1.7)' }, 0.75 + k * 0.13)
        })
      })
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="hh-intro" ref={rootRef} className="relative overflow-hidden px-0 pt-16 md:pt-20">
      {/* ── desktop diorama ── */}
      <div className="relative mx-auto hidden w-full md:block" style={{ height: 'min(92vh, 900px)' }}>
        {/* fairway — two rolling layers pinned to the section floor */}
        <div
          data-hill="back"
          aria-hidden
          className="absolute bottom-0 left-[-15%] h-[24%] w-[130%] rounded-t-[100%_100%] bg-[var(--hh-green-deep)]"
        />
        <div
          data-hill="front"
          aria-hidden
          className="absolute bottom-0 left-[-10%] h-[15%] w-[120%] rounded-t-[100%_100%] bg-[var(--hh-green)]"
        />

        {/* the pin — planted behind the front hill crest */}
        {/* eslint-disable-next-line @next/next/no-img-element -- hero logo */}
        <img
          data-logo
          src="/products/hash-hole/hashhole-logo.webp"
          alt="Jungle Boys Hash Hole"
          className="hh-float absolute left-1/2 top-0 h-[78%] w-auto"
          style={{ transform: 'translateX(-50%)' }}
        />

        {/* staked signage — posts run from each sign into the turf */}
        {SIGNS.map((s) => (
          // outer = the wind (pivots where the post meets the turf); inner =
          // the GSAP entrance. Separate elements because transform-origin is
          // shared between `transform` and the `rotate` property.
          <div
            key={s.big}
            className="hh-sway absolute"
            style={{
              [s.side]: `${s.inset}%`,
              bottom: `${s.bottom}%`,
              fontSize: 'min(4.2vw, 58px)',
              transformOrigin: `50% calc(100% + ${s.post}vh)`,
              ['--rot' as string]: `${s.rot}deg`,
              ['--sway-dur' as string]: `${s.dur}s`,
              ['--sway-delay' as string]: `${s.delay}s`,
              ['--sway-amp' as string]: `${s.amp}deg`,
            }}
          >
            <div data-sign className="origin-bottom">
              <SignFace s={s} />
              <span
                aria-hidden
                className="absolute left-1/2 top-[96%] -z-10 w-[10px] -translate-x-1/2 rounded-b-full bg-white shadow-[0_10px_18px_rgba(19,92,43,0.3)]"
                style={{ height: `calc(${s.post}vh)` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── mobile: pin, signs 2×2, turf below ── */}
      <div className="relative pt-2 md:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- hero logo */}
        <img src="/products/hash-hole/hashhole-logo.webp" alt="Jungle Boys Hash Hole" className="hh-float relative z-10 mx-auto w-[72vw]" />
        <div className="relative z-10 mx-auto mt-8 grid max-w-[520px] grid-cols-2 gap-4 px-6" style={{ fontSize: '8vw' }}>
          {SIGNS.map((s) => (
            <div
              key={s.big}
              className="hh-sway origin-bottom"
              style={{
                ['--rot' as string]: `${s.rot}deg`,
                ['--sway-dur' as string]: `${s.dur}s`,
                ['--sway-delay' as string]: `${s.delay}s`,
                ['--sway-amp' as string]: `${s.amp}deg`,
              }}
            >
              <div data-sign>
                <SignFace s={s} />
              </div>
            </div>
          ))}
        </div>
        <div aria-hidden className="relative mt-[-4vw] h-[22vw]">
          <div data-hill="back" className="absolute bottom-0 left-[-15%] h-[80%] w-[130%] rounded-t-[100%_100%] bg-[var(--hh-green-deep)]" />
          <div data-hill="front" className="absolute bottom-0 left-[-10%] h-[52%] w-[120%] rounded-t-[100%_100%] bg-[var(--hh-green)]" />
        </div>
      </div>
    </section>
  )
}
