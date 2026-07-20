'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CLUB_PERKS } from '@/lib/rewards-content'
import { SplitHeading } from './motion'

// The Connoisseur Club — full-width theater. Velvet curtains start CLOSED and
// part as you scroll, revealing the title art and lounge scene (with the
// tied-back drapes from the Figma art at the edges). Below: the invite-only
// panel with a rotating gold illumination ring and shimmering perk pills.

gsap.registerPlugin(ScrollTrigger)

const VELVET =
  'repeating-linear-gradient(90deg, #4a0a0d 0 14px, #7d1419 14px 34px, #5c0e12 34px 48px)'

export default function ConnoisseurClub() {
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const left = stage.querySelector('[data-curtain-left]')
      const right = stage.querySelector('[data-curtain-right]')
      const inner = stage.querySelector('[data-club-inner]')
      gsap.set(inner, { scale: 1.08, opacity: 0.55 })
      const tl = gsap.timeline({
        scrollTrigger: { trigger: stage, start: 'top 65%', end: 'bottom 75%', scrub: true },
      })
      tl.to(left, { xPercent: -104, duration: 1, ease: 'none' }, 0)
        .to(right, { xPercent: 104, duration: 1, ease: 'none' }, 0)
        .to(inner, { scale: 1, opacity: 1, duration: 1, ease: 'none' }, 0)
    })
    return () => mm.revert()
  }, [])

  return (
    <section className="py-16 md:py-24">
      {/* full-bleed theater stage */}
      <div ref={stageRef} className="relative w-full overflow-hidden bg-[#070505]">
        <h2 className="sr-only">The Connoisseur Club</h2>
        <div data-club-inner className="relative mx-auto max-w-7xl px-4 pb-6 pt-10 md:pt-14">
          <Image
            src="/rewards/club-table-scene.png"
            alt="The Connoisseur Club"
            width={975}
            height={644}
            sizes="(max-width: 768px) 88vw, 640px"
            className="relative z-10 mx-auto w-[70%] max-w-[640px]"
          />
          <Image
            src="/rewards/club-bg-title.png"
            alt="Jungle Boys mascots in a private lounge"
            width={1475}
            height={913}
            sizes="(max-width: 1024px) 100vw, 1280px"
            className="mx-auto -mt-[14%] w-full max-w-[1280px]"
          />
        </div>

        {/* decorative tied-back drapes (from the art) at the stage edges */}
        <img src="/rewards/curtain-left.png" alt="" aria-hidden className="absolute left-0 top-0 z-20 w-[15%] max-w-[300px] opacity-95" />
        <img src="/rewards/curtain-right.png" alt="" aria-hidden className="absolute right-0 top-0 z-20 w-[15%] max-w-[300px] opacity-95" />

        {/* closing velvet curtains that part on scroll */}
        <div
          data-curtain-left
          aria-hidden
          className="absolute inset-y-0 left-0 z-30 w-[52%] will-change-transform"
          style={{ background: VELVET, boxShadow: 'inset -30px 0 40px rgba(0,0,0,0.55)' }}
        />
        <div
          data-curtain-right
          aria-hidden
          className="absolute inset-y-0 right-0 z-30 w-[52%] will-change-transform"
          style={{ background: VELVET, boxShadow: 'inset 30px 0 40px rgba(0,0,0,0.55)' }}
        />
      </div>

      {/* invite-only panel — illuminated ring, high-end gold treatment */}
      <div className="px-6 md:px-12 lg:px-20">
        <div className="relative mx-auto mt-16 max-w-5xl overflow-hidden rounded-[2.5rem] p-[3px]">
          <span aria-hidden className="rw-ring absolute inset-0 rounded-[2.5rem]" />
          <div
            className="relative rounded-[calc(2.5rem-3px)] border border-[var(--color-accent)]/40 bg-[#0b0a07] px-6 py-12 md:px-14"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.35em] text-[#d8b53c]">
              The highest tier of PWF Rewards
            </p>
            <SplitHeading
              as="h3"
              mode="letters"
              accentClass="text-[var(--color-accent)]"
              className="mt-3 text-center text-2xl font-extrabold uppercase tracking-wide text-[var(--color-accent)] md:text-4xl"
              lines={[{ text: 'Invite Only. Limited Availability.' }]}
            />
            <p className="mx-auto mt-4 max-w-md text-center text-xs font-bold uppercase leading-relaxed tracking-wide text-white">
              Reserved for a select group of OG customers and brand loyalists.
            </p>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
              {CLUB_PERKS.map((p) => (
                <li
                  key={p.label}
                  className="rw-shimmer relative flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-[#8a6b00] via-[var(--color-accent)] to-[#8a6b00] px-6 py-5"
                >
                  <img src={p.icon} alt="" aria-hidden className="h-9 w-9 shrink-0" />
                  <span className="text-sm font-extrabold uppercase leading-tight tracking-wide text-black">
                    {p.label}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">
              Membership by invitation only
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
