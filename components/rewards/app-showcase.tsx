'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { APP_FEATURES } from '@/lib/rewards-content'
import StoreBadges from './store-badges'
import { Scrub, SplitHeading } from './motion'

// "Only on the app" — oversized glowing phone; feature pills EMERGE FROM
// BEHIND THE PHONE outward to their side (staggered), white text, big.
// Then the download CTA. Matches the live Webflow behavior, elevated.

gsap.registerPlugin(ScrollTrigger)

export default function AppShowcase() {
  const gridRef = useRef<HTMLDivElement>(null)
  const left = APP_FEATURES.slice(0, 3)
  const right = APP_FEATURES.slice(3)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const phone = grid.querySelector('[data-app-phone]')
      const leftPills = grid.querySelectorAll('[data-pill-left]')
      const rightPills = grid.querySelectorAll('[data-pill-right]')
      // phone appears FIRST — quick smooth entrance the moment it's on screen
      gsap.set(phone, { opacity: 0, scale: 0.85, transformOrigin: '50% 100%' })
      gsap.to(phone, {
        opacity: 1,
        scale: 1,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: grid, start: 'top 82%', once: true },
      })
      // then the pills pop out from behind it as you scroll — slow + smooth
      gsap.set(leftPills, { opacity: 0, xPercent: 55 })
      gsap.set(rightPills, { opacity: 0, xPercent: -55 })
      const tl = gsap.timeline({
        scrollTrigger: { trigger: grid, start: 'top 55%', end: 'bottom 95%', scrub: 1.2 },
      })
      leftPills.forEach((p, i) => {
        tl.to(p, { opacity: 1, xPercent: 0, duration: 0.6, ease: 'power1.out' }, i * 0.5)
        const rp = rightPills[i]
        if (rp) tl.to(rp, { opacity: 1, xPercent: 0, duration: 0.6, ease: 'power1.out' }, i * 0.5 + 0.25)
      })
    })
    return () => mm.revert()
  }, [])

  const pill = (label: string, side: 'left' | 'right', i: number) => (
    <li
      key={label}
      {...{ [side === 'left' ? 'data-pill-left' : 'data-pill-right']: '' }}
      className={`rounded-full bg-[#181818] px-7 py-4 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_0_24px_rgba(254,207,14,0.12)] ring-1 ring-white/15 will-change-transform md:text-base ${
        side === 'left' ? 'lg:text-right' : ''
      } ${i === 1 ? (side === 'left' ? 'lg:-translate-x-6' : 'lg:translate-x-6') : ''}`}
      style={{ fontFamily: 'var(--font-brand)' }}
    >
      {label}
    </li>
  )

  return (
    <section className="px-6 py-16 md:px-12 md:py-24 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <SplitHeading
          mode="letters"
          start="top 60%"
          className="text-center text-3xl font-extrabold uppercase tracking-tight text-[var(--color-foreground)] md:text-4xl xl:text-5xl"
          lines={[{ text: 'Only on' }, { text: 'the App', accent: true }]}
        />

        <div ref={gridRef} className="mt-12 grid items-center gap-8 lg:grid-cols-[1fr_auto_1fr]">
          <ul className="z-10 grid gap-5">{left.map((f, i) => pill(f, 'left', i))}</ul>
          <div data-app-phone className="order-first mx-auto w-full max-w-[520px] lg:order-none lg:max-w-[760px]">
            <Image
              src="/rewards/phone-glow.png"
              alt="The Jungle Boys app glowing on a phone"
              width={1005}
              height={1004}
              sizes="(max-width: 1024px) 85vw, 760px"
              className="w-full"
            />
          </div>
          <ul className="z-10 grid gap-5">{right.map((f, i) => pill(f, 'right', i))}</ul>
        </div>

        <div className="mt-24 text-center">
          <SplitHeading
            mode="letters"
            start="top 70%"
            className="text-3xl font-extrabold uppercase leading-[1.1] tracking-tight text-[var(--color-foreground)] md:text-4xl xl:text-5xl"
            lines={[
              { text: 'Download the Jungle Boys App.' },
              { text: 'Start Earning Today.', accent: true, block: true },
            ]}
          />
          <Scrub start="top 85%">
            <p
              data-reveal="rise"
              className="mt-4 text-sm font-bold uppercase tracking-wide text-[var(--color-muted)]"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              Rewards, access, and exclusive perks are waiting.
            </p>
            <div data-reveal="up">
              <StoreBadges className="mt-8 justify-center" />
            </div>
            <p
              data-reveal="rise"
              className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-muted)]"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              Get 50 bonus points just for downloading.
            </p>
          </Scrub>
        </div>
      </div>
    </section>
  )
}
