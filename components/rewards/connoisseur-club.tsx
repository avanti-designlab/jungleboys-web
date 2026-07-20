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

// Closed theater curtain drawn in the scene's cartoon style: swag valance,
// gathered folds with a scalloped hem, and a gold rope + tassel. One panel,
// mirrored for the right side.
function CurtainPanel({ mirrored = false }: { mirrored?: boolean }) {
  const folds = Array.from({ length: 7 })
  return (
    <svg
      viewBox="0 0 520 900"
      preserveAspectRatio="none"
      aria-hidden
      className="h-full w-full"
      style={mirrored ? { transform: 'scaleX(-1)' } : undefined}
    >
      <defs>
        <linearGradient id="rw-fold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4a0a0d" />
          <stop offset="0.45" stopColor="#96181f" />
          <stop offset="0.62" stopColor="#b02026" />
          <stop offset="1" stopColor="#4a0a0d" />
        </linearGradient>
        <linearGradient id="rw-valance" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7d1419" />
          <stop offset="1" stopColor="#3f0709" />
        </linearGradient>
        <linearGradient id="rw-inner-shadow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.75" stopColor="#000000" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      {/* deep backing so gaps between folds read as fold shadow */}
      <rect x="0" y="0" width="520" height="880" fill="#3f0709" />

      {/* gathered folds — each column billows to a rounded hem */}
      {folds.map((_, i) => {
        const w = 520 / folds.length
        const x = i * w
        const sway = i % 2 === 0 ? 14 : -10
        return (
          <path
            key={i}
            d={`M${x},0 h${w} c${sway},300 ${-sway},560 ${w * 0.12},846
               q${-w * 0.38},46 ${-w * 0.62},8
               q${-w * 0.3},-34 ${-w * 0.5 - w * 0.12},-14 Z`}
            fill="url(#rw-fold)"
          />
        )
      })}

      {/* fold crease highlights */}
      {folds.map((_, i) => {
        const w = 520 / folds.length
        const x = i * w + w * 0.58
        const sway = i % 2 === 0 ? 12 : -9
        return (
          <path
            key={`c${i}`}
            d={`M${x},10 c${sway},300 ${-sway},560 ${-w * 0.06},860`}
            stroke="#d8353c"
            strokeOpacity="0.35"
            strokeWidth="6"
            fill="none"
          />
        )
      })}

      {/* swag valance */}
      <path
        d="M0,0 H520 V64 Q455,168 347,74 Q331,190 173,86 Q160,196 0,92 Z"
        fill="url(#rw-valance)"
      />
      <path
        d="M0,92 Q160,196 173,86 M173,86 Q331,190 347,74 M347,74 Q455,168 520,64"
        stroke="#e0b400"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />

      {/* gold rope + tassel */}
      <path
        d="M-10,470 C150,560 330,585 530,505"
        stroke="#8a6200"
        strokeWidth="16"
        fill="none"
      />
      <path
        d="M-10,466 C150,554 330,579 530,499"
        stroke="#e6b800"
        strokeWidth="9"
        fill="none"
      />
      <path
        d="M-10,462 C150,549 330,574 530,495"
        stroke="#ffdf47"
        strokeWidth="3"
        fill="none"
      />
      <g transform="translate(255 572)">
        <rect x="-11" y="0" width="22" height="26" rx="6" fill="#e6b800" stroke="#8a6200" strokeWidth="3" />
        <path d="M-14,26 q14,10 28,0 l-4,52 q-10,10 -20,0 Z" fill="#d9a400" stroke="#8a6200" strokeWidth="3" />
        <path d="M-7,32 v40 M0,34 v42 M7,32 v40" stroke="#8a6200" strokeWidth="2.5" />
      </g>

      {/* inner-edge shading toward the split */}
      <rect x="0" y="0" width="520" height="900" fill="url(#rw-inner-shadow)" />
    </svg>
  )
}

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
          <div className="rw-breathe relative mx-auto -mt-[14%] w-full max-w-[1280px]">
            <Image
              src="/rewards/club-bg-title.png"
              alt="Jungle Boys mascots in a private lounge"
              width={1475}
              height={913}
              sizes="(max-width: 1024px) 100vw, 1280px"
              className="w-full"
            />
            {/* smoke wisps rising from the lounge */}
            <span aria-hidden className="rw-smoke left-[30%] top-[38%]" />
            <span aria-hidden className="rw-smoke left-[52%] top-[30%]" style={{ animationDelay: '1.6s' }} />
            <span aria-hidden className="rw-smoke left-[68%] top-[36%]" style={{ animationDelay: '3.1s' }} />
          </div>
        </div>

        {/* decorative tied-back drapes (from the art) at the stage edges */}
        <img src="/rewards/curtain-left.png" alt="" aria-hidden className="absolute left-0 top-0 z-20 w-[15%] max-w-[300px] opacity-95" />
        <img src="/rewards/curtain-right.png" alt="" aria-hidden className="absolute right-0 top-0 z-20 w-[15%] max-w-[300px] opacity-95" />

        {/* closing gathered curtains (scene-style art) that part on scroll */}
        <div data-curtain-left aria-hidden className="absolute inset-y-0 left-0 z-30 w-[52%] will-change-transform">
          <CurtainPanel />
        </div>
        <div data-curtain-right aria-hidden className="absolute inset-y-0 right-0 z-30 w-[52%] will-change-transform">
          <CurtainPanel mirrored />
        </div>
      </div>

      {/* invite-only panel — illuminated ring, high-end gold treatment */}
      <div className="px-6 md:px-12 lg:px-20">
        <div className="relative mx-auto mt-16 max-w-5xl overflow-hidden rounded-[2.5rem] p-[3px]">
          <span aria-hidden className="rw-ring absolute inset-0 rounded-[2.5rem]" />
          <div
            className="relative rounded-[calc(2.5rem-3px)] border border-[var(--color-accent)]/40 bg-[#0b0a07] px-6 py-12 md:px-14"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.35em] text-white/90">
              The highest tier of PWF Rewards
            </p>
            <SplitHeading
              as="h3"
              mode="letters"
              accentClass="text-[var(--color-accent)]"
              className="mt-3 text-center text-2xl font-extrabold uppercase tracking-wide text-[var(--color-accent)] md:text-4xl"
              lines={[{ text: 'Invite Only. Limited Availability.' }]}
            />
            <p className="mt-4 text-center text-xs font-bold uppercase leading-relaxed tracking-wide text-white md:whitespace-nowrap">
              Reserved for a select group of OG customers and brand loyalists.
            </p>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
              {CLUB_PERKS.map((p) => (
                <li
                  key={p.label}
                  className="rw-shimmer relative flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-[#e0b400] via-[#ffdf47] to-[#e0b400] px-6 py-5"
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
