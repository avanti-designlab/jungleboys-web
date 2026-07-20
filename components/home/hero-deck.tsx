'use client'

import Image from 'next/image'
import PillCta from '@/components/pill-cta'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { HERO_SLIDES } from '@/lib/home-content'
import { isAgeVerified } from '@/components/age-gate'

// Full-bleed pinned hero deck (reference: swissminimal.framer.website):
//  - covers the viewport completely; scrolling flips through the slides —
//    the active slide recedes (scales down, dims) while the next rises over it
//  - on first paint, the opening slide's text zooms inward (scale 1.3 → 1)
//  - after the last slide, the page releases into normal scrolling
// Art contract: 16:9 desktop banners, 9:16 mobile (config: lib/home-content.ts).
// Reduced motion: single static slide, no pin, no zoom.

gsap.registerPlugin(ScrollTrigger)

export default function HeroDeck() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const stage = stageRef.current
    if (!wrap || !stage) return
    const slides = Array.from(stage.querySelectorAll<HTMLElement>('[data-slide]'))
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // entry (swiss-minimal): the WHOLE hero — art and type together — settles
      // in from a zoom. Plays only when the visitor can actually SEE it: after
      // the age gate is dismissed, or after the intro for returning visitors.
      gsap.set(stage, { scale: 1.18 })
      const playEntry = () => {
        gsap.to(stage, { scale: 1, duration: 1.4, ease: 'power3.out', delay: 0.1 })
      }
      let introPending = false
      try {
        introPending = sessionStorage.getItem('jb-intro-done') !== '1'
      } catch {}
      if (!isAgeVerified()) {
        window.addEventListener('jb:gate-passed', playEntry, { once: true })
      } else if (introPending) {
        window.addEventListener('jb:intro-done', playEntry, { once: true })
      } else {
        playEntry()
      }

      // deck: slides > 0 start parked below the viewport
      gsap.set(slides.slice(1), { yPercent: 100 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      })
      slides.forEach((slide, i) => {
        if (i === slides.length - 1) return
        tl.to(slide, { scale: 0.78, yPercent: -6, autoAlpha: 0.75, ease: 'power2.inOut', duration: 1 }, i)
        tl.to(slides[i + 1], { yPercent: 0, ease: 'power2.inOut', duration: 1 }, i)
      })
    })

    mm.add('(prefers-reduced-motion: reduce)', () => {
      wrap.style.height = '100svh'
      slides.slice(1).forEach((s) => (s.style.display = 'none'))
    })

    return () => mm.revert()
  }, [])

  return (
    <section
      ref={wrapRef}
      data-hero
      aria-label="Featured promotions"
      style={{ height: `${HERO_SLIDES.length * 100}svh` }}
      className="relative"
    >
      <div ref={stageRef} className="sticky top-0 h-svh w-full overflow-hidden bg-[var(--color-background)]">
        {HERO_SLIDES.map((s, i) => (
          <div
            key={s.title}
            data-slide
            style={{ zIndex: i + 1 }}
            className="absolute inset-2 overflow-hidden rounded-[1.75rem] will-change-transform md:inset-3 md:rounded-[2.5rem]"
          >
            {/* 9:16 art on phones when supplied; 16:9 desktop art otherwise */}
            <div className="relative h-full w-full">
              <Image
                src={s.imageMobile ?? s.image}
                alt={s.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                className={`object-cover ${s.imageMobile ? 'md:hidden' : 'hidden'}`}
              />
              <Image
                src={s.image}
                alt={s.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                className={`object-cover ${s.imageMobile ? 'hidden md:block' : ''}`}
              />
            </div>
            {s.overlay !== false && <div className="absolute inset-0 bg-black/30" />}
            <div
              data-content={i}
              className="absolute inset-0 flex flex-col items-start justify-end gap-4 p-8 pb-16 text-white md:p-16 md:pb-20"
            >
              <p
                className="text-sm font-bold uppercase tracking-[0.2em] md:text-base"
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                {s.kicker}
              </p>
              <h1 className="font-display text-7xl uppercase md:text-9xl xl:text-[11rem]">
                {s.title}
              </h1>
              <PillCta label={s.cta} href={s.href} className="mt-2" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
