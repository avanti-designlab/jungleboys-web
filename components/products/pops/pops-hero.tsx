'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { buildNugField } from './pops-nugs'

gsap.registerPlugin(ScrollTrigger)

// The Pop.
//
// ON LOAD the hero already reads: the giant 5G POPS wordmark drops in
// letter-by-letter over the candy stripes. (The bucket was pulled — sitting
// there empty it read as a prop with nothing to do.)
//
// ON SCROLL: ~300 kernels POP into place all over the frame — scattered, not
// swept — until the screen is full and the type is buried. Then gravity takes
// them: they tumble down and out in a ragged cascade, uncovering the wordmark
// again. Two jars swing in to close.
//
// PERF: kernels animate on TRANSFORM ONLY (x/y in vw/vh, scale, rotate).
// Animating `left`/`top` forces layout for every element every frame — fine at
// 34, fatal at 300.

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
            gsap.set('[data-herojar]', { opacity: 1, rotate: 0 })
            return
          }

          gsap.set('[data-herojar="l"]', { opacity: 0, xPercent: -150, rotate: -60 })
          gsap.set('[data-herojar="r"]', { opacity: 0, xPercent: 150, rotate: 60 })

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root, start: 'top top', end: '+=250%',
              pin: true, scrub: 0.65, anticipatePin: 1, invalidateOnRefresh: true,
            },
          })

          // ── 1. kernels POP into place, scattered across the whole frame
          NUGS.forEach((n, i) => {
            const at = n.popAt * 0.30
            tl.fromTo(`[data-nug="${i}"]`,
              { opacity: 0, scale: 0, rotate: 0, y: 0, x: 0 },
              { opacity: 1, scale: 1, rotate: n.rot, duration: 0.06, ease: 'back.out(2.2)' }, at)
          })

          // ── 2. gravity: they tumble down and out, uncovering the type
          NUGS.forEach((n, i) => {
            const at = 0.46 + n.fallAt * 0.22
            tl.to(`[data-nug="${i}"]`,
              {
                y: '135vh', x: `${n.drift}vw`, rotate: `+=${n.spin}`,
                duration: 0.30, ease: 'power2.in',
              }, at)
              .to(`[data-nug="${i}"]`, { opacity: 0, duration: 0.06 }, at + 0.24)
          })

          // ── 3. the wordmark breathes back out as the last kernels clear
          tl.fromTo('[data-word]', { scale: 0.94 }, { scale: 1, duration: 0.12, ease: 'power2.out' }, 0.72)

          // ── 4. two jars swing in rotating
          tl.to('[data-herojar="l"]', { opacity: 1, xPercent: 0, rotate: -9, duration: 0.16, ease: 'back.out(1.35)' }, 0.80)
            .to('[data-herojar="r"]', { opacity: 1, xPercent: 0, rotate: 9, duration: 0.16, ease: 'back.out(1.35)' }, 0.84)
            .to('[data-herojar="l"]', { rotate: -4, duration: 0.08, ease: 'power2.inOut' }, 0.93)
            .to('[data-herojar="r"]', { rotate: 4, duration: 0.08, ease: 'power2.inOut' }, 0.93)

          tl.to({}, { duration: 0.04 })
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
      {/* giant wordmark — present from load, same treatment as /media + /products */}
      <div
        data-word
        className="pointer-events-none absolute inset-x-0 top-[13%] z-10 text-center will-change-transform"
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

      {/* kernel field — clipped on its own, over the type so it buries it */}
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
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
              left: `${n.x}%`, top: `${n.y}%`,
              width: `${n.size}%`,
              opacity: 0,
              filter: n.depth < 0.35 ? 'brightness(0.93)' : undefined,
            }}
          />
        ))}
      </div>

      {/* two jars flank the wordmark */}
      {/* eslint-disable-next-line @next/next/no-img-element -- product jar */}
      <img
        data-herojar="l"
        src="/products/pops/jar-bluog.webp"
        alt="Blu OG 5G Pops jar"
        className="absolute bottom-[7%] left-[3%] z-30 w-[min(23vw,205px)] origin-bottom will-change-transform drop-shadow-[0_28px_44px_rgba(0,0,0,0.28)] md:left-[8%]"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- product jar */}
      <img
        data-herojar="r"
        src="/products/pops/jar-cherriez.webp"
        alt="All Cherriez 5G Pops jar"
        className="absolute bottom-[7%] right-[3%] z-30 w-[min(23vw,205px)] origin-bottom will-change-transform drop-shadow-[0_28px_44px_rgba(0,0,0,0.28)] md:right-[8%]"
      />

    </section>
  )
}
