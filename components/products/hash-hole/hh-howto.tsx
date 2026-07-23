'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// How to Smoke — the four steps, each a looping video (Avanti's clips) + copy,
// revealing in sequence under the "HOW TO SMOKE" wordmark. Videos autoplay
// muted and loop; an observer pauses them off-screen for battery/perf.
//
// Clip order is NOT source order: the delivered files are 1=inhale, 2=rotate,
// 3=lighter, 4=ashtray, so each step pulls the clip that matches its action
// (Avanti's mapping — step1←3, step2←1, step3←2, step4←4).

const STEPS = [
  {
    video: '/products/hash-hole/howto-3.mp4',
    poster: '/products/hash-hole/howto-3-poster.webp',
    title: 'Light the Tip Properly',
    body: 'Use a lighter or hemp wick. Toast the end evenly (like lighting a cigar) instead of torching one side. Once it’s evenly lit, take a slow first pull.',
  },
  {
    video: '/products/hash-hole/howto-1.mp4',
    poster: '/products/hash-hole/howto-1-poster.webp',
    title: 'Pace Your Hits',
    body: 'Take slow, steady inhales instead of big rips. Hash burns hotter and stronger than flower. Exhale fully and wait a moment before your next hit.',
  },
  {
    video: '/products/hash-hole/howto-2.mp4',
    poster: '/products/hash-hole/howto-2-poster.webp',
    title: 'Rotate as You Smoke',
    body: 'Rotate the joint as you puff so the cherry burns evenly. If the flower starts to canoe, gently touch it up with your lighter.',
  },
  {
    video: '/products/hash-hole/howto-4.mp4',
    poster: '/products/hash-hole/howto-4-poster.webp',
    title: 'Let Ash Fall Naturally',
    body: 'Let the cherry fall naturally into the ashtray instead of tapping too hard — this helps the hash line burn through.',
  },
]

function Step({ step, i }: { step: (typeof STEPS)[number]; i: number }) {
  const vidRef = useRef<HTMLVideoElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const v = vidRef.current
    const wrap = wrapRef.current
    if (!v || !wrap) return
    const io = new IntersectionObserver(
      (e) => {
        if (e[0].isIntersecting) v.play().catch(() => {})
        else v.pause()
      },
      { threshold: 0.2 }
    )
    io.observe(wrap)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={wrapRef}
      className="flex flex-col overflow-hidden rounded-[1.5rem] border-4 border-white bg-white/85 shadow-[0_14px_40px_rgba(19,92,43,0.18)] backdrop-blur"
    >
      <div className="relative m-3 aspect-square overflow-hidden rounded-2xl bg-[color-mix(in_srgb,var(--hh-sky-top)_55%,white)]">
        <video
          ref={vidRef}
          className="absolute inset-0 h-full w-full rounded-2xl object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={step.poster}
        >
          <source src={step.video} type="video/mp4" />
        </video>
        <span className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--hh-green)] text-sm font-extrabold text-white" style={{ fontFamily: 'var(--font-brand)' }}>
          {i + 1}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display whitespace-nowrap uppercase leading-[0.9] text-[var(--hh-green-deep)]" style={{ fontSize: 'clamp(1.15rem, 2.05vw, 1.9rem)' }}>{step.title}</h3>
        <p className="text-[12px] font-medium leading-relaxed text-[var(--hh-ink)]/75" style={{ fontFamily: 'var(--font-brand)' }}>
          {step.body}
        </p>
      </div>
    </div>
  )
}

export default function HhHowTo() {
  const gridRef = useRef<HTMLDivElement>(null)

  // cards fall in from above, one after another, as the row scrolls into view
  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const cards = grid.children
      const tw = gsap.fromTo(
        cards,
        { y: -140, opacity: 0, rotate: -3 },
        {
          y: 0, opacity: 1, rotate: 0, duration: 0.75, ease: 'back.out(1.4)',
          stagger: 0.18,
          scrollTrigger: { trigger: grid, start: 'top 82%', once: true },
        }
      )
      return () => { tw.scrollTrigger?.kill(); tw.kill() }
    })
    return () => mm.revert()
  }, [])

  return (
    <section className="relative px-6 py-16 md:py-24">
      {/* eslint-disable-next-line @next/next/no-img-element -- section wordmark */}
      <img src="/products/hash-hole/wm-howtosmoke.webp" alt="How to Smoke" className="media-reveal mx-auto w-[min(80vw,620px)]" />

      <div ref={gridRef} className="mx-auto mt-14 grid max-w-[1240px] gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <Step key={s.title} step={s} i={i} />
        ))}
      </div>
    </section>
  )
}
