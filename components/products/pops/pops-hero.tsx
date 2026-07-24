'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { buildNugField } from './pops-nugs'

gsap.registerPlugin(ScrollTrigger)

// The Pop. The striped bucket sits at the bottom edge and RUNS ON past it,
// behind the red band below, so it never reads as cropped. On scroll it kicks,
// then ~300 pops fountain out of its mouth in a dense stream until they fill
// the frame; they blow off in six bursts, the giant 5G POPS wordmark — sized
// like the /media and /products wordmarks and dropped in letter-by-letter —
// punches up behind the spray, and two jars swing in rotating.
//
// PERF: every kernel animates on TRANSFORM ONLY (x/y in vw/vh, scale, rotate).
// The first pass animated `left`/`top`, which forces layout on every element
// every frame — survivable at 34 kernels, fatal at 300.
//
// The nug layer sits BEHIND the bucket art, so kernels spawned at the mouth are
// hidden by the bucket's own interior until they clear the rim — that is what
// sells them as coming out of it, with no masking.

const NUGS = buildNugField(300)
const WORD = '5G POPS'

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
            gsap.set('[data-jar]', { opacity: 1, rotate: 0 })
            return
          }

          gsap.set('[data-jar="l"]', { opacity: 0, xPercent: -150, rotate: -60 })
          gsap.set('[data-jar="r"]', { opacity: 0, xPercent: 150, rotate: 60 })

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root, start: 'top top', end: '+=260%',
              pin: true, scrub: 0.65, anticipatePin: 1, invalidateOnRefresh: true,
            },
          })

          // the bucket kicks as the first kernels blow
          tl.to('[data-bucket]', { scaleX: 1.05, scaleY: 0.95, duration: 0.02, ease: 'power2.out' }, 0)
            .to('[data-bucket]', { scaleX: 1, scaleY: 1, duration: 0.06, ease: 'elastic.out(1.4,0.4)' }, 0.02)

          // ── the fountain: kernels leave the mouth, near ones first
          NUGS.forEach((n, i) => {
            const at = n.lead * 0.30 + (i % 7) * 0.004
            tl.fromTo(`[data-nug="${i}"]`,
              { opacity: 0, x: 0, y: 0, scale: 0.1, rotate: 0 },
              {
                opacity: 1, x: `${n.dx}vw`, y: `${n.dy}vh`, scale: 1, rotate: n.rot,
                duration: 0.34, ease: 'power2.out',
              }, at)
          })

          // ── blow off in six bursts: punch, then gone
          for (let w = 0; w < 6; w++) {
            const at = 0.50 + w * 0.038
            const sel = NUGS.map((n, i) => (n.wave === w ? `[data-nug="${i}"]` : null)).filter(Boolean).join(',')
            if (!sel) continue
            tl.to(sel, { scale: 1.5, duration: 0.022, ease: 'power2.out' }, at)
              .to(sel, { scale: 0, opacity: 0, rotate: '+=120', duration: 0.05, ease: 'power2.in' }, at + 0.022)
          }

          // ── the wordmark punches up through the clearing spray
          tl.fromTo('[data-word]',
            { opacity: 0, scale: 0.62, y: '16vh' },
            { opacity: 1, scale: 1, y: 0, duration: 0.17, ease: 'back.out(1.5)' }, 0.60)

          // ── two jars swing in rotating
          tl.to('[data-jar="l"]', { opacity: 1, xPercent: 0, rotate: -9, duration: 0.17, ease: 'back.out(1.35)' }, 0.76)
            .to('[data-jar="r"]', { opacity: 1, xPercent: 0, rotate: 9, duration: 0.17, ease: 'back.out(1.35)' }, 0.80)
            .to('[data-jar="l"]', { rotate: -4, duration: 0.09, ease: 'power2.inOut' }, 0.9)
            .to('[data-jar="r"]', { rotate: 4, duration: 0.09, ease: 'power2.inOut' }, 0.9)

          tl.to({}, { duration: 0.05 })
        }
      )
      return () => mm.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    // NOT overflow-hidden: the bucket has to run past the bottom edge and under
    // the red band. The kernels get their own clipping layer instead.
    <section ref={rootRef} className="relative h-screen min-h-[560px]">
      {/* kernel fountain — clipped on its own, behind the bucket */}
      <div className="absolute inset-0 z-10 overflow-hidden">
        {NUGS.map((n, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- kernel cutouts
          <img
            key={i}
            data-nug={i}
            src={n.src}
            alt=""
            aria-hidden
            className="absolute -translate-x-1/2 -translate-y-1/2 will-change-transform"
            style={{
              left: '50%', top: '57%',
              width: `${n.size}%`,
              opacity: 0,
              filter: n.depth < 0.35 ? 'brightness(0.93)' : undefined,
              zIndex: Math.round(n.depth * 8),
            }}
          />
        ))}
      </div>

      {/* giant wordmark — same treatment as the /media and /products heroes */}
      <div
        data-word
        className="pointer-events-none absolute inset-x-0 top-[13%] z-20 text-center will-change-transform"
      >
        <h1
          aria-label="5G Pops"
          className="font-display whitespace-nowrap uppercase leading-[0.8] text-[var(--pops-ink)]"
          style={{ fontSize: 'min(33vw, 30rem)' }}
        >
          {WORD.split('').map((ch, i) => (
            <span
              key={i}
              aria-hidden
              className="contact-letter"
              style={{ animationDelay: `${0.25 + i * 0.07}s`, color: i < 2 ? 'var(--pops-red)' : undefined }}
            >
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
        </h1>
      </div>

      {/* two jars flank the wordmark */}
      {/* eslint-disable-next-line @next/next/no-img-element -- product jar */}
      <img
        data-jar="l"
        src="/products/pops/jar-bluog.webp"
        alt="Blu OG 5G Pops jar"
        className="absolute bottom-[7%] left-[3%] z-30 w-[min(23vw,205px)] origin-bottom will-change-transform drop-shadow-[0_28px_44px_rgba(0,0,0,0.28)] md:left-[8%]"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- product jar */}
      <img
        data-jar="r"
        src="/products/pops/jar-cherriez.webp"
        alt="All Cherriez 5G Pops jar"
        className="absolute bottom-[7%] right-[3%] z-30 w-[min(23vw,205px)] origin-bottom will-change-transform drop-shadow-[0_28px_44px_rgba(0,0,0,0.28)] md:right-[8%]"
      />

      {/* the bucket — runs past the section edge; the red band's own z-10
          paints over its base, so it reads as continuing behind the strip */}
      {/* eslint-disable-next-line @next/next/no-img-element -- hero bucket */}
      <img
        data-bucket
        src="/products/pops/bucket.webp"
        alt="Jungle Boys popcorn bucket"
        className="absolute bottom-[-24%] left-1/2 z-[5] w-[min(46vw,430px)] -translate-x-1/2 origin-bottom will-change-transform drop-shadow-[0_-10px_40px_rgba(0,0,0,0.16)]"
      />
    </section>
  )
}
