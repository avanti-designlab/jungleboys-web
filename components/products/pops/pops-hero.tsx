'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { buildNugField } from './pops-nugs'

gsap.registerPlugin(ScrollTrigger)

// The Pop. The section pins and the whole thing happens under the thumb:
// the striped bucket sits cut off at the bottom edge, baby nugs erupt out of
// its mouth in waves until they fill the frame, then pop off a burst at a
// time — each with a little scale-punch — until the frame is clear. The mega
// POPS wordmark punches up through the gap, and two jars swing in rotating to
// finish the reveal. Scroll back and it all packs itself away.
//
// The nug layer sits BEHIND the bucket art, so nugs spawned at the mouth are
// hidden by the bucket's own interior until they clear the rim — that is what
// sells them as coming out of it, with no masking.

const NUGS = buildNugField(34)

export default function PopsHero() {
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

          if (c.reduce) {
            gsap.set('[data-nug]', { opacity: 0 })
            gsap.set('[data-wordmark]', { opacity: 1, scale: 1, y: 0 })
            gsap.set('[data-jar]', { opacity: 1, rotate: 0, y: 0 })
            return
          }

          gsap.set('[data-wordmark]', { opacity: 0, scale: 0.55, y: '18vh' })
          gsap.set('[data-jar="l"]', { opacity: 0, xPercent: -140, rotate: -55 })
          gsap.set('[data-jar="r"]', { opacity: 0, xPercent: 140, rotate: 55 })

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root, start: 'top top', end: '+=230%',
              pin: true, scrub: 0.65, anticipatePin: 1, invalidateOnRefresh: true,
            },
          })

          // ── erupt: every nug launches from the bucket mouth to its own spot
          NUGS.forEach((n, i) => {
            const at = 0.02 + (i % 12) * 0.017 + Math.floor(i / 12) * 0.05
            tl.fromTo(`[data-nug="${i}"]`,
              { opacity: 0, left: '50%', top: '58%', scale: 0.14, rotate: 0 },
              {
                opacity: 1, left: `${n.x}%`, top: `${n.y}%`, scale: 1, rotate: n.rot,
                duration: 0.3, ease: 'power2.out',
              }, at)
          })

          // ── pop off: five bursts, each with a punch-then-vanish
          for (let w = 0; w < 5; w++) {
            const at = 0.44 + w * 0.055
            const sel = NUGS.map((n, i) => (n.wave === w ? `[data-nug="${i}"]` : null)).filter(Boolean).join(',')
            if (!sel) continue
            tl.to(sel, { scale: 1.35, duration: 0.035, ease: 'power2.out' }, at)
              .to(sel, { scale: 0, opacity: 0, rotate: '+=90', duration: 0.06, ease: 'power2.in' }, at + 0.035)
          }

          // ── the wordmark punches up through the cleared frame
          tl.to('[data-wordmark]', { opacity: 1, scale: 1, y: 0, duration: 0.16, ease: 'back.out(1.6)' }, 0.62)

          // ── two jars swing in, rotating, to finish the reveal
          tl.to('[data-jar="l"]', { opacity: 1, xPercent: 0, rotate: -9, duration: 0.18, ease: 'back.out(1.35)' }, 0.74)
            .to('[data-jar="r"]', { opacity: 1, xPercent: 0, rotate: 9, duration: 0.18, ease: 'back.out(1.35)' }, 0.79)
            // and settle upright as the section releases
            .to('[data-jar="l"]', { rotate: -4, duration: 0.1, ease: 'power2.inOut' }, 0.9)
            .to('[data-jar="r"]', { rotate: 4, duration: 0.1, ease: 'power2.inOut' }, 0.9)

          tl.to({}, { duration: 0.05 })
        }
      )
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative h-screen min-h-[560px] overflow-hidden">
      {/* nug field — behind the bucket so the mouth hides the spawn */}
      <div className="absolute inset-0 z-10">
        {NUGS.map((n, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- nug cutouts
          <img
            key={i}
            data-nug={i}
            src={n.src}
            alt=""
            aria-hidden
            className="absolute -translate-x-1/2 -translate-y-1/2 will-change-transform"
            style={{
              left: '50%', top: '58%',
              width: `${n.size}%`,
              opacity: 0,
              filter: n.depth < 0.4 ? 'brightness(0.94)' : undefined,
              zIndex: Math.round(n.depth * 8),
            }}
          />
        ))}
      </div>

      {/* the wordmark, between nugs and bucket */}
      <div
        data-wordmark
        className="pointer-events-none absolute inset-x-0 top-[11%] z-20 text-center will-change-transform"
      >
        <p
          className="font-display uppercase leading-none tracking-[0.08em] text-[var(--pops-red)]"
          style={{ fontSize: 'min(7vw, 4rem)' }}
        >
          New!
        </p>
        <h1
          className="font-display uppercase leading-[0.78] text-[var(--pops-ink)]"
          style={{ fontSize: 'min(25vw, 15.5rem)' }}
        >
          <span className="text-[var(--pops-red)]">5G</span> Pops
        </h1>
      </div>

      {/* two jars flank the wordmark */}
      {/* eslint-disable-next-line @next/next/no-img-element -- product jar */}
      <img
        data-jar="l"
        src="/products/pops/jar-bluog.webp"
        alt="Blu OG 5G Pops jar"
        className="absolute bottom-[5%] left-[4%] z-30 w-[min(23vw,205px)] origin-bottom will-change-transform drop-shadow-[0_28px_44px_rgba(0,0,0,0.28)] md:left-[9%]"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- product jar */}
      <img
        data-jar="r"
        src="/products/pops/jar-cherriez.webp"
        alt="All Cherriez 5G Pops jar"
        className="absolute bottom-[5%] right-[4%] z-30 w-[min(23vw,205px)] origin-bottom will-change-transform drop-shadow-[0_28px_44px_rgba(0,0,0,0.28)] md:right-[9%]"
      />

      {/* the bucket, cut off by the bottom edge */}
      {/* eslint-disable-next-line @next/next/no-img-element -- hero bucket */}
      <img
        src="/products/pops/bucket.webp"
        alt="Jungle Boys popcorn bucket"
        className="absolute bottom-[-14%] left-1/2 z-40 w-[min(46vw,430px)] -translate-x-1/2 drop-shadow-[0_-10px_40px_rgba(0,0,0,0.18)]"
      />
    </section>
  )
}
