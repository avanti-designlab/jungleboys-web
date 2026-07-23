'use client'

// Two video cards — "The Roll" and "The Smoke". They autoplay-loop muted when
// in view (once Avanti drops the files at the paths below); until then they
// show a labelled placeholder so the layout is locked in. Swap `src` when the
// real clips land — no other change needed.

import { useEffect, useRef } from 'react'

const CARDS = [
  { src: '/products/hash-hole/roll.mp4', kicker: 'Watch', title: 'The Roll', blurb: 'How the Hash Hole gets built — flower, rosin rope, wood tip.' },
  { src: '/products/hash-hole/smoke.mp4', kicker: 'Watch', title: 'The Smoke', blurb: 'One clean, even burn from spark to finish.' },
]

function VideoCard({ src, kicker, title, blurb }: (typeof CARDS)[number]) {
  const vidRef = useRef<HTMLVideoElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const v = vidRef.current
    const wrap = wrapRef.current
    if (!v || !wrap) return
    // only try to play if the source actually resolves
    const io = new IntersectionObserver(
      (e) => {
        if (e[0].isIntersecting) v.play().catch(() => {})
        else v.pause()
      },
      { threshold: 0.25 }
    )
    io.observe(wrap)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrapRef} className="media-reveal overflow-hidden rounded-[1.5rem] border-4 border-white bg-white/85 shadow-[0_14px_40px_rgba(19,92,43,0.18)] backdrop-blur">
      <div className="relative aspect-video overflow-hidden bg-[var(--hh-ink)]">
        <video ref={vidRef} className="absolute inset-0 h-full w-full object-cover" loop muted playsInline preload="metadata">
          <source src={src} type="video/mp4" />
        </video>
        {/* placeholder shown until the file exists (video stays transparent/black) */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rounded-full bg-white/15 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.3em] text-white/80" style={{ fontFamily: 'var(--font-brand)' }}>
            Video coming soon
          </span>
        </div>
      </div>
      <div className="p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--hh-green)]" style={{ fontFamily: 'var(--font-brand)' }}>{kicker}</p>
        <h3 className="font-display mt-1 text-3xl uppercase leading-none text-[var(--hh-green-deep)]">{title}</h3>
        <p className="mt-2 text-sm font-medium text-[var(--hh-ink)]/75" style={{ fontFamily: 'var(--font-brand)' }}>{blurb}</p>
      </div>
    </div>
  )
}

export default function HhVideos() {
  return (
    <section className="px-6 py-16 md:py-24">
      <div className="mx-auto grid max-w-[1100px] gap-6 md:grid-cols-2">
        {CARDS.map((c) => (
          <VideoCard key={c.title} {...c} />
        ))}
      </div>
    </section>
  )
}
