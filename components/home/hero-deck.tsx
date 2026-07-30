'use client'

import Image from 'next/image'
import PillCta from '@/components/pill-cta'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { HERO_SLIDES, type HeroSlide } from '@/lib/home-content'
import { isAgeVerified } from '@/components/age-gate'

// Full-bleed pinned hero deck (reference: swissminimal.framer.website):
//  - covers the viewport completely; scrolling flips through the slides —
//    the active slide recedes (scales down, dims) while the next rises over it
//  - on first paint, the opening slide's text zooms inward (scale 1.3 → 1)
//  - after the last slide, the page releases into normal scrolling
// Art contract: 16:9 desktop banners, 9:16 mobile (config: lib/home-content.ts).
// Reduced motion: single static slide, no pin, no zoom.

gsap.registerPlugin(ScrollTrigger)

export default function HeroDeck({ slides = HERO_SLIDES }: { slides?: HeroSlide[] }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  // Slides 2 and 3 are stacked in the SAME viewport box as slide 1 (all
  // `absolute inset-2` inside the sticky stage), so `loading="lazy"` never
  // holds them back — the browser sees them as in-viewport and fetches all
  // three up front. Their art is therefore kept out of the DOM until `load`,
  // the same treatment the 10-Pack smoke video needed. Only the slide you can
  // actually see competes for the critical path.
  const [showRest, setShowRest] = useState(false)
  useEffect(() => {
    if (document.readyState === 'complete') return setShowRest(true)
    const on = () => setShowRest(true)
    window.addEventListener('load', on, { once: true })
    return () => window.removeEventListener('load', on)
  }, [])

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
      // Was: `slides.slice(1).forEach(s => s.style.display = 'none')` — which
      // DELETED two of the three promotions for anyone with reduced motion on,
      // with no carousel control to reach them. Not a degraded animation: the
      // content was unreachable, and GOLD MYLARS is the home LCP element.
      //
      // Same fix shape as the two Pops stacks: give reduced-motion visitors the
      // CONTENT in normal flow instead of the first frame of an animation they
      // will never see. Three full-height panels they simply scroll through.
      const stage = stageRef.current
      if (stage) {
        stage.style.position = 'static'
        stage.style.height = 'auto'
      }
      wrap.style.height = 'auto'
      slides.forEach((sl) => {
        sl.style.position = 'relative'
        sl.style.height = '100svh'
        sl.style.opacity = '1'
        sl.style.transform = 'none'
      })
    })

    return () => mm.revert()
  }, [])

  return (
    <section
      ref={wrapRef}
      data-hero
      data-nav-theme="dark"
      aria-label="Featured promotions"
      style={{ height: `${slides.length * 100}svh` }}
      className="relative"
    >
      <div ref={stageRef} className="sticky top-0 h-svh w-full overflow-hidden bg-[var(--color-background)]">
        {slides.map((s, i) => (
          <div
            key={s.title}
            data-slide
            style={{ zIndex: i + 1 }}
            className="absolute inset-2 overflow-hidden rounded-[1.75rem] will-change-transform md:inset-3 md:rounded-[2.5rem]"
          >
            {/* 9:16 art on phones when supplied; 16:9 desktop art otherwise */}
            <div className="relative h-full w-full">
              {/* Both variants render and `display:none` does NOT stop a
                  download, so every slide was fetching its phone AND desktop
                  art. Worse, both carried `priority`, so on a phone the DESKTOP
                  file preloaded at 1962ms and delayed the mobile file that is
                  the actual LCP element to 2599ms — the hero was queued behind
                  a copy of itself nobody sees.
                  Priority now goes to the phone variant only (the measured
                  profile and the one under budget pressure); the desktop
                  variant loads lazily and is in-viewport on desktop anyway, so
                  it still fetches immediately there, just without competing for
                  the preload slot. */}
              {(i === 0 || showRest) && (
              <Image
                src={s.imageMobile ?? s.image}
                alt={s.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                className={`object-cover ${s.imageMobile ? 'md:hidden' : 'hidden'}`}
              />
              )}
              {(i === 0 || showRest) && (
              <Image
                src={s.image}
                alt={s.alt}
                fill
                loading={i === 0 && !s.imageMobile ? undefined : 'lazy'}
                priority={i === 0 && !s.imageMobile}
                sizes="100vw"
                className={`object-cover ${s.imageMobile ? 'hidden md:block' : ''}`}
              />
              )}
            </div>
            {/* overlays removed — banners show full-bright (Avanti) */}
            <div
              data-content={i}
              className="absolute inset-0 flex flex-col items-start justify-end gap-3 p-8 pb-28 text-white md:p-16 md:pb-20"
            >
              <p
                className="inline-flex rounded-full bg-black/55 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-white backdrop-blur-sm md:text-sm"
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                {s.kicker}
              </p>
              <h1 className="font-display text-7xl uppercase leading-[0.82] md:text-9xl xl:text-[11rem]">
                {s.title}
              </h1>
              <PillCta label={s.cta} href={s.href} className="mt-3" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
