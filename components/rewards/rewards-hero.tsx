'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import StoreBadges from './store-badges'
import Coin from './coin'
import { SplitHeading } from './motion'

// App-download section: phone rides right under the headline and runs to the
// section bottom (no dead space); store badges + the +50 bonus pill overlap
// the phone's lower half. Coins burst from behind the phone on a loop.

gsap.registerPlugin(ScrollTrigger)

const COIN_COUNT = 14

export default function RewardsHero() {
  const phoneWrapRef = useRef<HTMLDivElement>(null)
  const coinsRef = useRef<HTMLDivElement>(null)
  const bonusNumRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const wrap = phoneWrapRef.current
    const box = coinsRef.current
    if (!wrap || !box) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const burst = () => {
        box.querySelectorAll('[data-coin]').forEach((coin, i) => {
          const x = gsap.utils.random(-380, 380)
          const upY = gsap.utils.random(-140, -300)
          const dur = gsap.utils.random(0.55, 0.8)
          gsap.set(coin, { x: 0, y: 0, opacity: 1, scale: gsap.utils.random(0.55, 1.15), rotation: 0 })
          gsap
            .timeline({ delay: i * 0.04 })
            .to(coin, { x: x * 0.6, y: upY, rotation: gsap.utils.random(-180, 180), duration: dur, ease: 'power2.out' })
            .to(coin, { x, y: 420, rotation: `+=${gsap.utils.random(120, 280)}`, duration: dur * 1.5, ease: 'power1.in' })
            .to(coin, { opacity: 0, duration: 0.25 }, '-=0.25')
        })
      }
      let loop: ReturnType<typeof setInterval> | null = null
      const st = ScrollTrigger.create({
        trigger: wrap,
        start: 'top 85%',
        onEnter: () => {
          burst()
          if (!loop) loop = setInterval(burst, 4600)
          // the +50 pill counts up fast
          const num = bonusNumRef.current
          if (num) {
            const state = { n: 0 }
            gsap.to(state, {
              n: 50,
              duration: 0.8,
              ease: 'power1.out',
              snap: { n: 1 },
              onUpdate: () => {
                num.textContent = String(state.n)
              },
            })
          }
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
    <section className="relative overflow-hidden px-6 py-14 md:px-12 md:py-20 lg:px-20">
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <SplitHeading
            as="h2"
            mode="words"
            className="text-[clamp(1.9rem,3.2vw,3.2rem)] font-extrabold uppercase leading-[1.1] tracking-tight text-[var(--color-foreground)]"
            lines={[
              { text: 'Download the Jungle Boys App.', block: true },
              { text: 'Unlock PWF Rewards.', accent: true, block: true, nowrap: true },
            ]}
          />
          <p
            className="mt-5 max-w-md text-sm uppercase leading-relaxed tracking-wide text-[var(--color-muted)] md:text-base"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Playing With Fire has its perks. Earn points, unlock exclusive
            drops, and get rewarded every time you shop.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <StoreBadges />
            <span
              className="rw-shimmer relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[var(--color-accent)] py-3 pl-3 pr-5 text-black shadow-[0_0_34px_rgba(254,207,14,0.4)]"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              <Coin className="h-7 w-7" />
              <span className="text-base font-extrabold tracking-tight">
                +<span ref={bonusNumRef}>50</span> PTS
              </span>
              <span className="text-[10px] font-bold uppercase leading-tight tracking-widest">
                just for
                <br />
                downloading
              </span>
            </span>
          </div>
        </div>

        {/* phone right, coins bursting from behind it on a loop */}
        <div ref={phoneWrapRef} className="relative mx-auto w-full max-w-[440px] lg:max-w-[520px]">
          <div ref={coinsRef} aria-hidden className="pointer-events-none absolute left-1/2 top-[18%] z-0">
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
            sizes="(max-width: 1024px) 440px, 520px"
            className="relative z-10 w-full"
          />
        </div>
      </div>
    </section>
  )
}
