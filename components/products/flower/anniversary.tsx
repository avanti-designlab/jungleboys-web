'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// 20th Anniversary — the exclusive beat of the page. The seal SLAMS in from
// above (blur → impact squash → elastic settle) over rotating gold rays with
// expanding shockwave rings, then floats. Nug cutouts fountain up from the
// bottom corners, hang, and fade (rewards-coin-burst technique). Gold type
// carries a moving shine; copy staggers; pouches fan out over a breathing
// glow. Reduced motion = static composition, no bursts.

const FOUNTAIN_NUGS = [
  '/products/flower/nug-a.webp',
  '/products/flower/nug-b.webp',
  '/products/flower/nug-c.webp',
  '/products/flower/nug-d.webp',
  '/products/flower/anug-1.webp',
  '/products/flower/anug-2.webp',
  '/products/flower/anug-5.webp',
]

export default function Anniversary() {
  const rootRef = useRef<HTMLElement>(null)
  const badgeRef = useRef<HTMLImageElement>(null)
  const raysRef = useRef<HTMLDivElement>(null)
  const ringsRef = useRef<HTMLDivElement>(null)
  const fountainRef = useRef<HTMLDivElement>(null)
  const bagsRef = useRef<HTMLDivElement>(null)
  const bag1Ref = useRef<HTMLImageElement>(null)
  const bag2Ref = useRef<HTMLImageElement>(null)

  // shared .media-reveal handler (headline/copy/bags — CSS-driven)
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const els = Array.from(root.querySelectorAll<HTMLElement>('.media-reveal'))
    let raf = 0
    const reveal = () => {
      raf = 0
      els.forEach((el) => {
        if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < window.innerHeight * 0.88) el.classList.add('is-in')
      })
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(reveal)
    }
    const t = setTimeout(reveal, 200)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      clearTimeout(t)
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // badge slam + shockwaves + nug fountain (GSAP, motion-gated)
  useEffect(() => {
    const root = rootRef.current
    const badge = badgeRef.current
    const rays = raysRef.current
    const rings = ringsRef.current
    const fountain = fountainRef.current
    if (!root || !badge || !rays || !rings || !fountain) return

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // — the seal slams in
      const tl = gsap.timeline({
        scrollTrigger: { trigger: badge, start: 'top 82%', once: true },
      })
      tl.fromTo(
        badge,
        { y: '-46vh', scale: 2.3, rotation: -28, opacity: 0, filter: 'blur(10px)' },
        { y: 0, scale: 1, rotation: 0, opacity: 1, filter: 'blur(0px)', duration: 0.85, ease: 'power4.in' }
      )
        .to(badge, { scale: 1.18, duration: 0.12, ease: 'power2.out' })
        .to(badge, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.4)' })
        .fromTo(
          rings.children,
          { scale: 0.35, opacity: 0.95 },
          { scale: 2.6, opacity: 0, duration: 1, stagger: 0.16, ease: 'power2.out' },
          '-=0.85'
        )
        .fromTo(rays, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' }, '-=0.7')
        .to(badge, { y: -12, duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut' })

      // — the mylars deal in like cards: swing up from below with rotation,
      //   overshoot into their resting tilt, then float on offset phases
      const bags = bagsRef.current
      const bag1 = bag1Ref.current
      const bag2 = bag2Ref.current
      let bagTl: gsap.core.Timeline | undefined
      if (bags && bag1 && bag2) {
        bagTl = gsap.timeline({
          scrollTrigger: { trigger: bags, start: 'top 80%', once: true },
        })
        bagTl
          .fromTo(
            bag1,
            { y: 320, x: -140, rotation: -55, scale: 0.7, opacity: 0 },
            { y: 0, x: 0, rotation: -10, scale: 1, opacity: 1, duration: 1, ease: 'back.out(1.5)' }
          )
          .fromTo(
            bag2,
            { y: 340, x: 150, rotation: 48, scale: 0.7, opacity: 0 },
            { y: 0, x: 0, rotation: 7, scale: 1, opacity: 1, duration: 1, ease: 'back.out(1.5)' },
            '-=0.72'
          )
          .to(bag1, { y: -10, duration: 2.8, yoyo: true, repeat: -1, ease: 'sine.inOut' }, '>-0.1')
          .to(bag2, { y: -14, duration: 3.3, yoyo: true, repeat: -1, ease: 'sine.inOut' }, '<0.4')
      }

      // — nug fountain from the bottom corners while the section is on screen
      let interval = 0
      let side = 0
      const spawn = () => {
        if (document.visibilityState !== 'visible' || fountain.childElementCount > 9) return
        side ^= 1
        const img = document.createElement('img')
        img.src = FOUNTAIN_NUGS[Math.floor(Math.random() * FOUNTAIN_NUGS.length)]
        img.alt = ''
        img.className = 'fl-fnug'
        img.style[side ? 'left' : 'right'] = `${-20 - Math.random() * 50}px`
        img.style.width = `${72 + Math.random() * 84}px`
        fountain.appendChild(img)
        const dir = side ? 1 : -1
        gsap
          .timeline({ onComplete: () => img.remove() })
          .to(img, {
            x: dir * (70 + Math.random() * 280),
            y: -window.innerHeight * (0.32 + Math.random() * 0.42),
            rotation: Math.random() * 340 - 170,
            duration: 1.8 + Math.random() * 0.5,
            ease: 'power3.out', // shot out fast, hangs at the top
          })
          .to(img, { opacity: 0, duration: 0.55, ease: 'power1.in' }, '-=0.55')
      }
      const io = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            if (!interval) {
              spawn()
              interval = window.setInterval(spawn, 800)
            }
          } else if (interval) {
            window.clearInterval(interval)
            interval = 0
          }
        },
        { threshold: 0.2 }
      )
      io.observe(root)
      return () => {
        io.disconnect()
        if (interval) window.clearInterval(interval)
        tl.scrollTrigger?.kill()
        tl.kill()
        bagTl?.scrollTrigger?.kill()
        bagTl?.kill()
      }
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={rootRef} className="relative overflow-hidden bg-[#070604] py-24 md:py-36">
      {/* gold ambience */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(233,193,90,0.14), transparent 65%)' }} />

      {/* nug fountain layer — rides above the content, never blocks it */}
      <div ref={fountainRef} aria-hidden className="pointer-events-none absolute inset-0 z-20" />

      <div className="relative z-10 mx-auto max-w-[1100px] px-6 text-center">
        {/* seal — slam entrance over rotating rays + shockwaves */}
        <div className="relative mx-auto flex h-64 w-64 items-center justify-center md:h-80 md:w-80">
          <div ref={raysRef} aria-hidden className="fl-rays absolute inset-[-40%] opacity-0" />
          <div ref={ringsRef} aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-[12%] rounded-full border-2 border-[var(--fl-gold,#e9c15a)]" />
            <div className="absolute inset-[12%] rounded-full border border-[var(--fl-gold,#e9c15a)]/60" />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element -- gold seal */}
          <img ref={badgeRef} src="/products/flower/badge-20th.webp" alt="Jungle Boys 20th anniversary seal" className="relative z-10 w-56 will-change-transform md:w-72" />
        </div>

        <h2 className="media-reveal fl-stag mt-8 font-display uppercase leading-[0.86]" style={{ fontSize: 'min(13vw, 9rem)' }}>
          <span className="fl-gold-text block">20th Anniversary</span>
          <span className="mt-1 block text-white" style={{ fontSize: '0.42em', letterSpacing: '0.14em' }}>Gold Mylar</span>
        </h2>

        {/* pouches LEFT, story RIGHT — cuts the section height; bags get a
            GSAP card-deal entrance (swing in from below, overshoot, float) */}
        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2 lg:gap-8">
          <div ref={bagsRef} className="relative mx-auto flex h-[320px] w-full max-w-[560px] items-center justify-center md:h-[440px]">
            <div aria-hidden className="fl-glow pointer-events-none absolute inset-[-10%]" style={{ background: 'radial-gradient(ellipse 60% 55% at 50% 60%, rgba(233,193,90,0.3), transparent 68%)' }} />
            {/* eslint-disable-next-line @next/next/no-img-element -- pack art */}
            <img
              ref={bag1Ref}
              src="/products/flower/anniv-bag-1.webp"
              alt=""
              aria-hidden
              className="absolute left-[2%] w-[62%] will-change-transform drop-shadow-[0_40px_60px_rgba(0,0,0,0.6)]"
            />
            {/* eslint-disable-next-line @next/next/no-img-element -- pack art */}
            <img
              ref={bag2Ref}
              src="/products/flower/anniv-bag-2.webp"
              alt="Jungle Boys 20th anniversary gold mylar bags"
              className="absolute right-[2%] w-[64%] will-change-transform drop-shadow-[0_40px_60px_rgba(0,0,0,0.65)]"
            />
          </div>

          {/* condensed story — brand voice, staggered rise */}
          <div className="media-reveal fl-stag mx-auto max-w-xl space-y-5 text-left text-[15px] leading-relaxed text-white/75 md:text-base" style={{ fontFamily: 'var(--font-brand)' }}>
            <p className="uppercase tracking-wide">
              Twenty years in, the foundation hasn&apos;t moved — same small, dedicated team, still led by the hunt.
            </p>
            <p className="uppercase tracking-wide">
              From the iconic gold vials of our early days to today&apos;s 3.5g gold mylars: hand-trimmed, full, frosty
              top nugs only. <span className="text-[var(--fl-gold,#e9c15a)]">Gold is the standard</span> — what&apos;s inside earns the bag.
            </p>
          </div>
        </div>

        <p className="media-reveal fl-claim-r font-display mt-14 uppercase leading-[0.9]" style={{ fontSize: 'min(9vw, 5rem)' }}>
          <span className="text-white">Thank you for</span>{' '}
          <span className="fl-gold-text">growing with us</span>
        </p>
      </div>
    </section>
  )
}
