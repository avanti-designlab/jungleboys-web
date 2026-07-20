'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { BRAND_ASSETS } from '@/lib/site-config'
import Coin from './coin'

// Slot-machine intro: "WELCOME TO" in Bebas, the PWF REWARDS logo rises up,
// coins burst out of it like a payout, "scroll to learn" cues the page.
// Hovering the logo tilts it and triggers another burst. Dark brand stage
// in both themes.

const COIN_COUNT = 18

export default function RewardsIntro() {
  const stageRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const coinsRef = useRef<HTMLDivElement>(null)
  const lastBurst = useRef(0)

  function burst() {
    const box = coinsRef.current
    if (!box || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const now = Date.now()
    if (now - lastBurst.current < 1200) return
    lastBurst.current = now
    box.querySelectorAll('[data-coin]').forEach((coin, i) => {
      const x = gsap.utils.random(-460, 460)
      const upY = gsap.utils.random(-120, -340)
      const dur = gsap.utils.random(0.55, 0.85)
      gsap.set(coin, { x: 0, y: 0, opacity: 1, scale: gsap.utils.random(0.6, 1.25), rotation: 0 })
      gsap
        .timeline({ delay: i * 0.035 })
        .to(coin, { x: x * 0.6, y: upY, rotation: gsap.utils.random(-200, 200), duration: dur, ease: 'power2.out' })
        .to(coin, { x, y: 520, rotation: `+=${gsap.utils.random(120, 300)}`, duration: dur * 1.5, ease: 'power1.in' })
        .to(coin, { opacity: 0, duration: 0.25 }, '-=0.25')
    })
  }

  function hoverLogo() {
    const logo = logoRef.current
    if (!logo || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo(
      logo,
      { rotation: 0, scale: 1 },
      { rotation: gsap.utils.random(-5, 5), scale: 1.05, duration: 0.18, yoyo: true, repeat: 3, ease: 'power1.inOut' }
    )
    burst()
  }

  function scrollDown() {
    stageRef.current?.parentElement?.nextElementSibling?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const stage = stageRef.current
    const logo = logoRef.current
    if (!stage || !logo) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const words = stage.querySelectorAll('[data-intro-word]')
      const cue = stage.querySelector('[data-intro-cue]')
      gsap.set(words, { opacity: 0, yPercent: 100 })
      gsap.set(logo, { opacity: 0, y: 90, scale: 0.85 })
      if (cue) gsap.set(cue, { opacity: 0 })
      const tl = gsap.timeline({ delay: 0.2 })
      tl.to(words, { opacity: 1, yPercent: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' })
        .to(logo, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'back.out(1.4)' }, '-=0.3')
        .add(() => burst(), '-=0.15')
        .to(cue, { opacity: 1, duration: 0.6 }, '+=0.4')
      // slot machine keeps paying out on a loop
      const loop = setInterval(burst, 4200)
      return () => clearInterval(loop)
    })
    return () => mm.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section className="w-full px-2 pt-20 md:px-3 md:pt-24">
      <div
        ref={stageRef}
        className="relative flex min-h-[92svh] flex-col items-center justify-center overflow-hidden rounded-[1.75rem] bg-[#0a0a0a] px-6 pb-28 pt-14 text-center md:rounded-[2.5rem]"
      >
        <img
          src={BRAND_ASSETS.logoWhite}
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 w-[88%] max-w-[1100px] -translate-x-1/2 -translate-y-1/2 opacity-[0.05]"
        />

        <h1 className="font-display text-[clamp(3.8rem,10vw,9.5rem)] uppercase leading-none text-white">
          <span className="inline-block overflow-hidden">
            <span data-intro-word className="inline-block">
              Welcome
            </span>
          </span>{' '}
          <span className="inline-block overflow-hidden">
            <span data-intro-word className="inline-block text-[var(--color-accent)]">
              to
            </span>
          </span>
        </h1>

        <div
          ref={logoRef}
          onMouseEnter={hoverLogo}
          onClick={hoverLogo}
          className="relative z-10 mt-10 w-[min(82vw,650px)] cursor-pointer select-none"
          role="img"
          aria-label="PWF Rewards"
        >
          <img src="/rewards/pwf-script.png" alt="" className="mx-auto w-full" />
          <img src="/rewards/pwf-rewards-plate.png" alt="" className="mx-auto -mt-2 w-[82%]" />
        </div>

        {/* coin layer — coins burst from behind the logo */}
        <div ref={coinsRef} aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 z-0">
          {Array.from({ length: COIN_COUNT }).map((_, i) => (
            <span key={i} data-coin className="absolute -left-7 -top-7 opacity-0">
              <Coin className="h-14 w-14" />
            </span>
          ))}
        </div>

        <button
          data-intro-cue
          onClick={scrollDown}
          className="group absolute bottom-10 flex cursor-pointer flex-col items-center gap-2"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/80 transition-colors group-hover:text-[var(--color-accent)]">
            Scroll to Learn
          </span>
          <span className="flex flex-col items-center text-[var(--color-accent)]">
            {[0, 1, 2].map((d) => (
              <svg
                key={d}
                viewBox="0 0 20 10"
                className="rw-chevron -mt-0.5 h-2.5 w-5"
                style={{ animationDelay: `${d * 0.2}s` }}
                fill="currentColor"
              >
                <path d="M0 0h20L10 10z" />
              </svg>
            ))}
          </span>
        </button>
      </div>
    </section>
  )
}
