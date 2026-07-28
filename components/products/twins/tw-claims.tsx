'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// THE SIX — laid out as a mirrored pair rather than a grid.
//
// Two columns of three that are each other's reflection: the left column runs
// icon-on-the-right and text right-aligned, the right column is the exact
// mirror. They also arrive mirrored — left slides in from the left, right from
// the right, in matched pairs — so the section is doing the "twins" idea in its
// layout instead of only in its copy.
//
// Colour alternates red / blue down the pairs, the two colours taken out of the
// mark itself.

const LEFT = [
  { icon: 'strain', text: '0.75g pre-rolls, 1.5g total', tone: 'red' },
  { icon: 'burn', text: 'Smooth, consistent burn start to finish', tone: 'blue' },
  { icon: 'sealed', text: 'All natural unrefined paper & crutch', tone: 'red' },
]
const RIGHT = [
  { icon: 'indoor', text: 'Premium cannabis flower only', tone: 'blue' },
  { icon: 'sharing', text: 'No cones. Rolled to perfection', tone: 'red' },
  { icon: 'value', text: 'Perfect for solo sessions or sharing', tone: 'blue' },
]

const TONE: Record<string, { ring: string; disc: string; glow: string }> = {
  red: {
    ring: 'rgba(230,36,44,0.45)',
    disc: 'radial-gradient(circle at 35% 30%, #ff7b80 0%, #e6242c 46%, #8a0d13 100%)',
    glow: 'rgba(230,36,44,0.3)',
  },
  blue: {
    ring: 'rgba(47,92,224,0.45)',
    disc: 'radial-gradient(circle at 35% 30%, #8fb0ff 0%, #2f5ce0 46%, #10225e 100%)',
    glow: 'rgba(47,92,224,0.3)',
  },
}

function Claim({ item, mirrored }: { item: (typeof LEFT)[number]; mirrored: boolean }) {
  const t = TONE[item.tone]
  return (
    <div
      data-tw-claim
      className={`flex items-center gap-3 rounded-2xl border px-3 py-3 backdrop-blur-md will-change-transform md:gap-4 md:rounded-[1.4rem] md:px-5 md:py-4 ${
        mirrored ? 'flex-row' : 'flex-row-reverse'
      }`}
      style={{
        borderColor: t.ring,
        background: 'linear-gradient(160deg, rgba(10,17,48,0.9) 0%, rgba(4,5,12,0.92) 100%)',
        boxShadow: `0 18px 44px rgba(0,0,0,0.5), inset 0 1px 0 ${t.glow}`,
      }}
    >
      <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-full md:h-14 md:w-14"
        style={{ background: t.disc, boxShadow: `0 8px 24px ${t.glow}` }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- section icon */}
        <img src={`/products/twins/icons/${item.icon}.svg`} alt="" className="h-5 w-5 md:h-7 md:w-7" />
      </span>
      <span className={`text-[12px] font-extrabold uppercase leading-tight tracking-[0.06em] text-white md:text-[14px] ${mirrored ? 'text-left' : 'text-right'}`}
        style={{ fontFamily: 'var(--font-brand)' }}>
        {item.text}
      </span>
    </div>
  )
}

export default function TwClaims() {
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

          // matched pairs arrive together, from opposite sides
          gsap.from('[data-tw-col="l"] [data-tw-claim]', {
            opacity: 0, x: -70, duration: 0.8, stagger: 0.12, ease: 'power3.out',
            scrollTrigger: { trigger: root, start: 'top 74%' },
          })
          gsap.from('[data-tw-col="r"] [data-tw-claim]', {
            opacity: 0, x: 70, duration: 0.8, stagger: 0.12, ease: 'power3.out',
            scrollTrigger: { trigger: root, start: 'top 74%' },
          })
          gsap.from('[data-tw-spine]', {
            scaleY: 0, duration: 1.1, ease: 'power2.out', transformOrigin: 'top center',
            scrollTrigger: { trigger: root, start: 'top 74%' },
          })
          gsap.from('[data-tw-claims-head]', {
            opacity: 0, yPercent: 28, duration: 0.85, ease: 'power3.out',
            scrollTrigger: { trigger: root, start: 'top 80%' },
          })
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
        className="relative overflow-hidden rounded-[1.75rem] px-4 py-14 md:rounded-[2.5rem] md:px-10 md:py-20"
        style={{ background: 'linear-gradient(170deg, #0a1130 0%, #070b1e 48%, #04050c 100%)' }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="tw-bloom absolute -inset-[30%]"
            style={{ background: 'radial-gradient(38% 36% at 24% 32%, rgba(193,17,26,0.32) 0%, rgba(193,17,26,0) 70%)' }} />
          <div className="tw-bloom-b absolute -inset-[30%]"
            style={{ background: 'radial-gradient(38% 36% at 76% 66%, rgba(27,63,176,0.34) 0%, rgba(27,63,176,0) 72%)' }} />
        </div>

        <div className="relative z-10 mx-auto max-w-[1240px]">
          <div className="text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.42em] text-[var(--tw-red-hot)] md:text-xs"
              style={{ fontFamily: 'var(--font-brand)' }}>
              Matched pair
            </p>
            <h2 data-tw-claims-head className="font-display mt-2 uppercase leading-[0.84] text-white will-change-transform"
              style={{ fontSize: 'min(12vw, 6.5rem)', letterSpacing: '-0.035em' }}>
              Built the same.
            </h2>
          </div>

          {/* the spine down the middle is the mirror line */}
          <div className="relative mt-10 md:mt-16">
            <div data-tw-spine aria-hidden
              className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 will-change-transform md:block"
              style={{ background: 'linear-gradient(180deg, rgba(230,36,44,0) 0%, rgba(230,36,44,0.55) 20%, rgba(47,92,224,0.55) 80%, rgba(47,92,224,0) 100%)' }} />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-x-14 md:gap-y-4">
              <div data-tw-col="l" className="flex flex-col gap-3 md:gap-4">
                {LEFT.map((it) => <Claim key={it.text} item={it} mirrored={false} />)}
              </div>
              <div data-tw-col="r" className="flex flex-col gap-3 md:gap-4">
                {RIGHT.map((it) => <Claim key={it.text} item={it} mirrored />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
