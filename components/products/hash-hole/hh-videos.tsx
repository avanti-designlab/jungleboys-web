'use client'

// Two video cards — "The Roll" and "The Smoke". They autoplay-loop muted when
// in view. Give a card a `src` when the real clip lands; that is the only change
// needed.
//
// A card with no clip renders the placeholder INSTEAD OF a <video>, not on top
// of one. Pointing <video><source> at a file that does not exist still fires a
// request, so the old version 404'd twice for every visitor on every load —
// invisible, because the placeholder covered it, but real.

import { useEffect, useRef } from 'react'

type Card = { src: string | null; kicker: string; title: string; blurb: string }

const CARDS: Card[] = [
  { src: null, kicker: 'Watch', title: 'The Roll', blurb: 'How the Hash Hole gets built — flower, rosin rope, wood tip.' },
  { src: null, kicker: 'Watch', title: 'The Smoke', blurb: 'One clean, even burn from spark to finish.' },
]

function VideoCard({ src, kicker, title, blurb }: Card) {
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
      { threshold: 0.25 }
    )
    io.observe(wrap)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrapRef} className="media-reveal overflow-hidden rounded-[1.5rem] border-4 border-white bg-white/85 shadow-[0_14px_40px_rgba(19,92,43,0.18)] backdrop-blur">
      <div className="relative aspect-video overflow-hidden bg-[var(--hh-ink)]">
        {src ? (
          <video ref={vidRef} className="absolute inset-0 h-full w-full object-cover" loop muted playsInline preload="metadata">
            <source src={src} type="video/mp4" />
          </video>
        ) : (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="rounded-full bg-white/15 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.3em] text-white/80" style={{ fontFamily: 'var(--font-brand)' }}>
              Video coming soon
            </span>
          </div>
        )}
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
