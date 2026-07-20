'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import StoreBadges from './store-badges'
import Coin from './coin'
import { SplitHeading } from './motion'

// App-download section: everything centered, giant phone as the centerpiece
// with coins bursting from behind it on a loop (slot-machine energy).

gsap.registerPlugin(ScrollTrigger)

const COIN_COUNT = 14

export default function RewardsHero() {
  const phoneWrapRef = useRef<HTMLDivElement>(null)
  const coinsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrap = phoneWrapRef.current
    const box = coinsRef.current
    if (!wrap || !box) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const burst = () => {
        box.querySelectorAll('[data-coin]').forEach((coin, i) => {
          const x = gsap.utils.random(-380, 380)
          const upY = gsap.utils.random(-140, -320)
          const dur = gsap.utils.random(0.55, 0.8)
          gsap.set(coin, { x: 0, y: 0, opacity: 1, scale: gsap.utils.random(0.55, 1.15), rotation: 0 })
          gsap
            .timeline({ delay: i * 0.04 })
            .to(coin, { x: x * 0.6, y: upY, rotation: gsap.utils.random(-180, 180), duration: dur, ease: 'power2.out' })
            .to(coin, { x, y: 460, rotation: `+=${gsap.utils.random(120, 280)}`, duration: dur * 1.5, ease: 'power1.in' })
            .to(coin, { opacity: 0, duration: 0.25 }, '-=0.25')
        })
      }
      // phone floats gently; coins pay out on a loop once it's on screen
      gsap.to(wrap, { y: -14, duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut' })
      let loop: ReturnType<typeof setInterval> | null = null
      const st = ScrollTrigger.create({
        trigger: wrap,
        start: 'top 85%',
        onEnter: () => {
          burst()
          if (!loop) loop = setInterval(burst, 4600)
        },
      })
      return () => {
        st.kill()
        if (loop) clearInterval(loop)
      }
    })
    return () => mm.revert()
  }, [])

  return (
    <section className="relative overflow-hidden px-6 py-20 text-center md:px-12 md:py-28 lg:px-20">
      <div className="relative mx-auto max-w-5xl">
        <SplitHeading
          as="h2"
          mode="words"
          className="text-[clamp(2rem,4vw,3.6rem)] font-extrabold uppercase leading-[1.1] tracking-tight text-[var(--color-foreground)]"
          lines={[
            { text: 'Download the Jungle Boys App.', block: true, nowrap: true },
            { text: 'Unlock PWF Rewards.', accent: true, block: true, nowrap: true },
          ]}
        />
        <p
          className="mx-auto mt-6 max-w-xl text-sm uppercase leading-relaxed tracking-wide text-[var(--color-muted)] md:text-base"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          Playing With Fire has its perks. Earn points, unlock exclusive drops,
          and get rewarded every time you shop.
        </p>
        <StoreBadges className="mt-8 justify-center" />
        <p
          className="mt-4 text-[11px] uppercase tracking-widest text-[var(--color-muted)]"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          Get 100 bonus points just for downloading.
        </p>

        <div ref={phoneWrapRef} className="relative mx-auto mt-14 w-full max-w-[560px] lg:max-w-[700px]">
          {/* coin layer behind the phone */}
          <div ref={coinsRef} aria-hidden className="pointer-events-none absolute left-1/2 top-[22%] z-0">
            {Array.from({ length: COIN_COUNT }).map((_, i) => (
              <span key={i} data-coin className="absolute -left-7 -top-7 opacity-0">
                <Coin className="h-14 w-14" />
              </span>
            ))}
          </div>
          <Image
            src="/rewards/phone-hero.png"
            alt="The Jungle Boys app on a phone"
            width={833}
            height={833}
            priority
            sizes="(max-width: 1024px) 560px, 700px"
            className="relative z-10 w-full"
          />
        </div>
      </div>
    </section>
  )
}
