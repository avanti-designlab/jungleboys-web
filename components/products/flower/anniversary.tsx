'use client'

import { useEffect, useRef } from 'react'

// 20th Anniversary — all gold. The two gold mylar pouches reveal with the
// condensed anniversary story, the 20-year seal, and a THANK YOU send-off.
// Copy condensed from the Figma frame, brand voice kept.

export default function Anniversary() {
  const rootRef = useRef<HTMLElement>(null)

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

  return (
    <section ref={rootRef} className="relative overflow-hidden bg-[#070604] py-24 md:py-36">
      {/* gold ambience */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(233,193,90,0.14), transparent 65%)' }} />

      <div className="relative z-10 mx-auto max-w-[1100px] px-6 text-center">
        {/* seal */}
        {/* eslint-disable-next-line @next/next/no-img-element -- gold seal */}
        <img src="/products/flower/badge-20th.webp" alt="Jungle Boys 20th anniversary seal" className="media-reveal fl-float mx-auto w-28 md:w-36" />

        <h2 className="media-reveal font-display mt-6 uppercase leading-[0.86]" style={{ fontSize: 'min(13vw, 9rem)' }}>
          <span className="fl-gold-text">20th Anniversary</span>
          <span className="mt-1 block text-white" style={{ fontSize: '0.42em', letterSpacing: '0.14em' }}>Gold Mylar</span>
        </h2>

        {/* the pouches */}
        <div className="media-reveal relative mx-auto mt-12 flex h-[300px] max-w-[640px] items-center justify-center md:h-[380px]">
          {/* eslint-disable-next-line @next/next/no-img-element -- pack art */}
          <img src="/products/flower/anniv-bag-1.webp" alt="" aria-hidden className="fl-bag absolute w-[52%] -rotate-[10deg] drop-shadow-[0_40px_60px_rgba(0,0,0,0.6)]" style={{ left: '8%' }} />
          {/* eslint-disable-next-line @next/next/no-img-element -- pack art */}
          <img src="/products/flower/anniv-bag-2.webp" alt="Jungle Boys 20th anniversary gold mylar bags" className="fl-bag absolute w-[56%] rotate-[7deg] drop-shadow-[0_40px_60px_rgba(0,0,0,0.65)]" style={{ right: '6%', animationDelay: '0.7s' }} />
        </div>

        {/* condensed story — brand voice */}
        <div className="mx-auto mt-12 max-w-2xl space-y-5 text-[15px] leading-relaxed text-white/75 md:text-base" style={{ fontFamily: 'var(--font-brand)' }}>
          <p className="media-reveal uppercase tracking-wide">
            Twenty years in, the foundation hasn&apos;t moved — same small, dedicated team, still led by the hunt.
          </p>
          <p className="media-reveal uppercase tracking-wide">
            From the iconic gold vials of our early days to today&apos;s 3.5g gold mylars: hand-trimmed, full, frosty
            top nugs only. <span className="text-[var(--fl-gold,#e9c15a)]">Gold is the standard</span> — what&apos;s inside earns the bag.
          </p>
        </div>

        <p className="media-reveal font-display mt-14 uppercase leading-[0.9]" style={{ fontSize: 'min(9vw, 5rem)' }}>
          <span className="text-white">Thank you for</span>{' '}
          <span className="fl-gold-text">growing with us</span>
        </p>
      </div>
    </section>
  )
}
