'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ONE BECOMES TWO.
//
// The whole product is "you get two", so the hero performs that rather than
// captioning it: a single mascot stands dead centre, then splits — the twin
// peels off it and the pair settle mirrored, left and right. There is only ONE
// mascot asset; the second is the same file with scaleX(-1), which is also
// exactly how the artwork was drawn.
//
// Over that, the TWINS mark arrives MASSIVE: it starts oversized, blurred and
// deep in Z, then slams down into place with an overshoot and a specular sweep
// runs across it. The sweep is a skewed gradient behind a mask of the mark, so
// it lights the letterforms rather than a rectangle.

const STATS = [
  { n: '2', l: 'Pre-rolls' },
  { n: '0.75g', l: 'Each' },
  { n: '1.5g', l: 'Total' },
]

export default function TwHero() {
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

          const tl = gsap.timeline({ delay: 0.2 })

          // the split: both twins start stacked at centre, then part
          tl.fromTo('[data-tw-mascot="l"]',
            { xPercent: 0, opacity: 0, scale: 0.9 },
            { xPercent: -122, opacity: 1, scale: 1, duration: 1.15, ease: 'power3.out' }, 0)
            .fromTo('[data-tw-mascot="r"]',
              { xPercent: 0, opacity: 0, scale: 0.9 },
              { xPercent: 122, opacity: 1, scale: 1, duration: 1.15, ease: 'power3.out' }, 0)

          // the mark slams in from深 Z
          tl.fromTo('[data-tw-mark]',
            { scale: 2.6, opacity: 0, filter: 'blur(26px)', rotateX: 28 },
            { scale: 1, opacity: 1, filter: 'blur(0px)', rotateX: 0, duration: 1.15, ease: 'back.out(1.5)' }, 0.35)
            .fromTo('[data-tw-sub]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 1.25)
            // specular sweep, once, after it lands
            .fromTo('[data-tw-shine]', { xPercent: -140 }, { xPercent: 140, duration: 1.1, ease: 'power2.inOut' }, 1.35)
            .fromTo('[data-tw-stat]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }, 1.45)

          const st = gsap.timeline({
            scrollTrigger: {
              trigger: root, start: 'top top', end: '+=170%',
              pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true,
            },
          })
          st.to('[data-tw-mark-wrap]', { scale: 0.5, yPercent: -14, opacity: 0, ease: 'power1.in', duration: 0.45 }, 0)
            .to('[data-tw-stats]', { opacity: 0, y: 30, ease: 'power2.in', duration: 0.2 }, 0.06)
          // the twins drift further apart as you travel through — the entrance
          // owns [data-tw-mascot], this owns the wrapper, so they never fight
          st.to('[data-tw-pair-l]', { xPercent: -26, yPercent: -6, ease: 'none', duration: 1 }, 0)
            .to('[data-tw-pair-r]', { xPercent: 26, yPercent: -6, ease: 'none', duration: 1 }, 0)
        }
      )
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative px-2 pt-2 md:px-3">
      <div
        data-nav-theme="dark"
        className="media-hero-in relative h-[94vh] min-h-[620px] overflow-hidden rounded-[1.75rem] bg-[var(--tw-black)] md:rounded-[2.5rem]"
      >
        {/* the two brand colours drifting against each other */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="tw-bloom absolute -inset-[30%]"
            style={{ background: 'radial-gradient(42% 40% at 30% 62%, rgba(193,17,26,0.55) 0%, rgba(193,17,26,0) 70%)' }} />
          <div className="tw-bloom-b absolute -inset-[30%]"
            style={{ background: 'radial-gradient(44% 42% at 70% 38%, rgba(27,63,176,0.55) 0%, rgba(27,63,176,0) 72%)' }} />
        </div>

        {/* floor rake */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[1]"
          style={{ background: 'radial-gradient(115% 68% at 50% 112%, rgba(230,36,44,0.34) 0%, rgba(27,63,176,0.2) 34%, rgba(5,6,12,0) 74%)' }} />

        {/* THE TWINS — one asset, mirrored. They part from dead centre. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[-6%] z-10 flex items-end justify-center">
          <div data-tw-pair-l className="relative will-change-transform">
            <div data-tw-mascot="l" className="will-change-transform">
              <div className="tw-idle-l">
                {/* eslint-disable-next-line @next/next/no-img-element -- brand art */}
                <img src="/products/twins/mascot.webp" alt="Jungle Boys Twins mascot"
                  className="h-[58vh] w-auto drop-shadow-[0_30px_60px_rgba(0,0,0,0.8)] md:h-[66vh]" />
              </div>
            </div>
          </div>
          <div data-tw-pair-r className="relative will-change-transform">
            <div data-tw-mascot="r" className="will-change-transform">
              <div className="tw-idle-r">
                {/* eslint-disable-next-line @next/next/no-img-element -- brand art */}
                <img src="/products/twins/mascot.webp" alt="" aria-hidden
                  className="h-[58vh] w-auto -scale-x-100 drop-shadow-[0_30px_60px_rgba(0,0,0,0.8)] md:h-[66vh]" />
              </div>
            </div>
          </div>
        </div>

        {/* THE MARK — massive */}
        <div className="pointer-events-none absolute inset-x-0 top-[7%] z-30 px-[3vw] text-center" style={{ perspective: '1200px' }}>
          <div data-tw-mark-wrap className="will-change-transform">
            <div data-tw-mark className="relative mx-auto w-full will-change-transform" style={{ maxWidth: '80vw' }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- brand mark */}
              <img src="/products/twins/wordmark-twins.webp" alt="Twins"
                className="mx-auto h-auto w-full drop-shadow-[0_18px_50px_rgba(0,0,0,0.75)]" />
              {/* specular sweep, masked to the mark so it lights the letterforms
                  and not a passing rectangle */}
              <div aria-hidden className="absolute inset-0 overflow-hidden"
                style={{
                  WebkitMaskImage: 'url(/products/twins/wordmark-twins.webp)',
                  maskImage: 'url(/products/twins/wordmark-twins.webp)',
                  WebkitMaskSize: '100% 100%', maskSize: '100% 100%',
                  WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
                }}>
                <div data-tw-shine className="absolute inset-y-[-40%] left-0 w-[36%] will-change-transform"
                  style={{ background: 'linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0) 100%)', transform: 'skewX(-16deg)' }} />
              </div>
            </div>
            <div data-tw-sub className="mx-auto mt-3 w-full will-change-transform" style={{ maxWidth: 'min(52vw, 620px)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- brand mark */}
              <img src="/products/twins/wordmark-2pack.webp" alt="2 Pack Pre-Rolls" className="mx-auto h-auto w-full" />
            </div>
          </div>
        </div>

        <div data-tw-stats className="absolute inset-x-0 bottom-[4%] z-30 will-change-transform">
          <div className="mx-auto flex w-full max-w-[720px] items-stretch justify-center gap-2 px-4 md:gap-4">
            {STATS.map((s) => (
              <span key={s.l} data-tw-stat
                className="flex flex-1 flex-col items-center rounded-2xl border border-white/15 bg-black/70 px-3 py-2.5 backdrop-blur-md md:px-5 md:py-3.5">
                <span className="font-display leading-none text-white" style={{ fontSize: 'min(8vw, 2.4rem)' }}>{s.n}</span>
                <span className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.24em] text-[var(--tw-red-hot)] md:text-[11px]"
                  style={{ fontFamily: 'var(--font-brand)' }}>{s.l}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
