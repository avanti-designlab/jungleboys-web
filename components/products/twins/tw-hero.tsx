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
// Over that, the real TWINS script mark arrives MASSIVE: it starts oversized,
// blurred and
// deep in Z, then slams down into place with an overshoot and a specular sweep
// runs across it. The sweep is a skewed gradient behind a mask of the mark, so
// it lights the lettering and its coloured outline rather than a rectangle.

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
        {
          isMobile: '(max-width: 767px)',
          reduce: '(prefers-reduced-motion: reduce)',
          noPref: '(prefers-reduced-motion: no-preference)',
        },
        (mmCtx) => {
          const c = mmCtx.conditions as Record<string, boolean>
          if (c.reduce) return

          // The pair are laid out side by side in a flex row, so xPercent 0 is
          // already "shoulder to shoulder at centre" — NOT stacked. Moving them
          // OUT from there is what walked them off a phone: at 390px each
          // mascot is ~209px wide, the row is already 418px, and any positive
          // split pushed ~96px of each one past the edge.
          //
          // So on a phone the move runs the other way: they start OVERLAPPED at
          // centre (reading as one figure, which is the whole idea) and part to
          // land shoulder to shoulder, both fully in frame. Wide screens have
          // the room to keep parting outward.
          const startX = c.isMobile ? 36 : 0
          const endX = c.isMobile ? 0 : 122

          const tl = gsap.timeline({ delay: 0.2 })

          // one becomes two — and they arrive a beat apart so you read each
          tl.fromTo('[data-tw-mascot="l"]',
            { xPercent: startX, opacity: 0, scale: 0.9 },
            { xPercent: -endX, opacity: 1, scale: 1, duration: 1.15, ease: 'power3.out' }, 0)
            .fromTo('[data-tw-mascot="r"]',
              { xPercent: -startX, opacity: 0, scale: 0.9 },
              { xPercent: endX, opacity: 1, scale: 1, duration: 1.15, ease: 'power3.out' }, 0.18)

          // the mark slams in from深 Z
          tl.fromTo('[data-tw-mark]',
            { scale: 2.6, opacity: 0, filter: 'blur(26px)', rotateX: 28 },
            { scale: 1, opacity: 1, filter: 'blur(0px)', rotateX: 0, duration: 1.15, ease: 'back.out(1.5)' }, 0.35)
            .fromTo('[data-tw-sub]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 1.25)
            .fromTo('[data-tw-stat]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }, 1.45)

          // Specular sweep, on a loop. xPercent is relative to the element's OWN
          // width and this element is 36% of its container, so clearing the right
          // edge takes 100/36*100 = 278% — at the old 140 it stopped dead over the
          // lettering and read as a smear. -130 -> 330 takes it fully off both sides.
          gsap.fromTo('[data-tw-shine]',
            { xPercent: -130 },
            { xPercent: 330, duration: 1.5, ease: 'power1.inOut', repeat: -1, repeatDelay: 3.8, delay: 1.35 })

          const st = gsap.timeline({
            scrollTrigger: {
              // 170% of pinned scroll left roughly a screen of nothing but
              // background once the mark had gone. The travel now ends shortly
              // after the twins finish growing.
              trigger: root, start: 'top top', end: c.isMobile ? '+=105%' : '+=170%',
              pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true,
            },
          })
          st.to('[data-tw-mark-wrap]', { scale: 0.5, yPercent: -14, opacity: 0, ease: 'power1.in', duration: 0.45 }, 0)
            .to('[data-tw-stats]', { opacity: 0, y: 30, ease: 'power2.in', duration: 0.2 }, 0.06)

          if (c.isMobile) {
            // the mark hands the frame OVER: as it shrinks away the twins grow
            // into the space it leaves. Origin is the floor they stand on, so
            // they scale up without their feet sliding.
            st.to('[data-tw-pair-l]', { scale: 1.35, transformOrigin: '50% 100%', ease: 'power1.inOut', duration: 1 }, 0)
              .to('[data-tw-pair-r]', { scale: 1.35, transformOrigin: '50% 100%', ease: 'power1.inOut', duration: 1 }, 0)
          } else {
            // the twins drift further apart as you travel through — the entrance
            // owns [data-tw-mascot], this owns the wrapper, so they never fight
            st.to('[data-tw-pair-l]', { xPercent: -26, yPercent: -6, ease: 'none', duration: 1 }, 0)
              .to('[data-tw-pair-r]', { xPercent: 26, yPercent: -6, ease: 'none', duration: 1 }, 0)
          }
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
        {/* The TWINS mark is artwork, not type, so the page had no h1 at all.
            Hidden heading supplies one without touching the design. */}
        <h1 className="sr-only">Jungle Boys Twins — 2 Pack Pre-Rolls</h1>

        {/* the two brand colours drifting against each other */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="tw-bloom absolute -inset-[30%]"
            style={{ background: 'radial-gradient(42% 40% at 30% 62%, rgba(193,17,26,0.55) 0%, rgba(193,17,26,0) 70%)' }} />
          <div className="tw-bloom-b absolute -inset-[30%]"
            style={{ background: 'radial-gradient(44% 42% at 70% 38%, rgba(27,63,176,0.55) 0%, rgba(27,63,176,0) 72%)' }} />
        </div>

        {/* Brick wall over the gradient, from the Figma hero. Figma draws it as
            a field of vector rects — exporting that would be a huge file for a
            flat pattern, so this is a 156px running-bond tile that repeats:
            sharp at any size, and a fraction of a kilobyte. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[1]"
          style={{ backgroundImage: 'url(/products/twins/brick.svg)', backgroundRepeat: 'repeat', backgroundSize: '156px 156px' }} />

        {/* floor rake */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[2]"
          style={{ background: 'radial-gradient(115% 68% at 50% 112%, rgba(230,36,44,0.34) 0%, rgba(27,63,176,0.2) 34%, rgba(5,6,12,0) 74%)' }} />

        {/* THE TWINS — one asset, mirrored. They part from dead centre. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[-6%] z-10 flex items-end justify-center">
          <div data-tw-pair-l className="relative will-change-transform">
            <div data-tw-mascot="l" className="will-change-transform">
              <div className="tw-idle-l">
                {/* eslint-disable-next-line @next/next/no-img-element -- brand art */}
                <img src="/products/twins/mascot.webp" alt="Jungle Boys Twins mascot"
                  className="h-[42vh] w-auto drop-shadow-[0_30px_60px_rgba(0,0,0,0.8)] md:h-[66vh]" />
              </div>
            </div>
          </div>
          <div data-tw-pair-r className="relative will-change-transform">
            <div data-tw-mascot="r" className="will-change-transform">
              <div className="tw-idle-r">
                {/* eslint-disable-next-line @next/next/no-img-element -- brand art */}
                <img src="/products/twins/mascot.webp" alt="" aria-hidden
                  className="h-[42vh] w-auto -scale-x-100 drop-shadow-[0_30px_60px_rgba(0,0,0,0.8)] md:h-[66vh]" />
              </div>
            </div>
          </div>
        </div>

        {/* THE MARK — massive */}
        <div className="pointer-events-none absolute inset-x-0 top-[19%] z-30 px-[3vw] text-center md:top-[13%]" style={{ perspective: '1200px' }}>
          <div data-tw-mark-wrap className="will-change-transform">
            <div data-tw-mark
              className="relative mx-auto w-full will-change-transform [--tw-mark-w:88vw] md:[--tw-mark-w:min(48vw,700px)]"
              style={{ maxWidth: 'var(--tw-mark-w)' }}>
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
            <div data-tw-sub
              className="mx-auto mt-3 w-full will-change-transform [--tw-sub-w:72vw] md:[--tw-sub-w:min(38vw,460px)]"
              style={{ maxWidth: 'var(--tw-sub-w)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- brand mark */}
              <img src="/products/twins/wordmark-2pack.webp" alt="2 Pack Pre-Rolls" className="mx-auto h-auto w-full" />
            </div>
          </div>
        </div>

        <div data-tw-stats className="absolute inset-x-0 bottom-[13%] z-30 will-change-transform md:bottom-[4%]">
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
