'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { JB_CHANNEL_URL, youtubeThumb, type Video } from '@/lib/media/youtube'

// Video gallery: a big featured hero, a row of vertical Shorts, and a grid of
// horizontal videos. Cards preview the actual clip (muted, looping) on hover;
// clicking opens a full lightbox player. Tiles cascade down as you scroll.

gsap.registerPlugin(ScrollTrigger)

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    </svg>
  )
}

function formatDate(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function previewSrc(v: Video) {
  return `${v.embedUrl}?autoplay=1&mute=1&controls=0&loop=1&playlist=${v.id}&modestbranding=1&playsinline=1&rel=0`
}

function VideoTile({
  v,
  onOpen,
  big = false,
  autoPreview = false,
}: {
  v: Video
  onOpen: () => void
  big?: boolean
  autoPreview?: boolean
}) {
  const [preview, setPreview] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!autoPreview) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setTimeout(() => setPreview(true), 700)
    return () => clearTimeout(t)
  }, [autoPreview])

  const enter = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    timer.current = setTimeout(() => setPreview(true), 180)
  }
  const leave = () => {
    if (timer.current) clearTimeout(timer.current)
    if (!autoPreview) setPreview(false)
  }

  return (
    <button
      data-tile
      onClick={onOpen}
      onMouseEnter={enter}
      onMouseLeave={leave}
      aria-label={`Play ${v.title}`}
      className="group relative block w-full overflow-hidden rounded-2xl text-left will-change-transform"
    >
      <div className={`relative w-full bg-[var(--color-surface)] ${v.vertical ? 'aspect-[9/16]' : 'aspect-video'}`}>
        <Image
          src={big ? youtubeThumb(v.id, 'maxres') : v.thumbnail}
          alt={v.title}
          fill
          priority={big}
          sizes={
            v.vertical
              ? '(max-width: 640px) 50vw, 25vw'
              : big
                ? '(max-width: 1024px) 100vw, 70vw'
                : '(max-width: 640px) 100vw, 33vw'
          }
          className={`object-cover transition-transform duration-700 group-hover:scale-105 ${preview ? 'opacity-0' : 'opacity-100'}`}
        />
        {preview && (
          <iframe
            src={previewSrc(v)}
            title={`${v.title} preview`}
            tabIndex={-1}
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full scale-[1.35]"
          />
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {!preview && (
          <span className="pointer-events-none absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-accent)] text-black opacity-0 shadow-[0_0_30px_rgba(254,207,14,0.5)] transition-all duration-300 group-hover:scale-110 group-hover:opacity-100">
            <PlayIcon className="ml-0.5 h-6 w-6" />
          </span>
        )}

        {big && (
          <span
            className="absolute left-4 top-4 rounded-full bg-[var(--color-accent)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-black"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Latest Episode
          </span>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 md:p-5" style={{ fontFamily: 'var(--font-brand)' }}>
          <h3
            className={`font-extrabold uppercase leading-tight tracking-wide text-white ${
              big ? 'line-clamp-2 text-lg md:text-2xl' : 'line-clamp-2 text-xs md:text-sm'
            }`}
          >
            {v.title}
          </h3>
          <p className="mt-1 text-[10px] uppercase tracking-wide text-white/60">{formatDate(v.publishedAt)}</p>
        </div>
      </div>
    </button>
  )
}

export default function MediaHub({ videos }: { videos: Video[] }) {
  const [active, setActive] = useState<Video | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setActive(null), [])

  const featured = videos.find((v) => !v.vertical) ?? videos[0]
  const shorts = videos.filter((v) => v.vertical)
  const horizontals = videos.filter((v) => !v.vertical && v.id !== featured?.id)

  // cascade: tiles slide down into place as they scroll into view
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tiles = root.querySelectorAll<HTMLElement>('[data-tile]')
      gsap.set(tiles, { y: -60, autoAlpha: 0 })
      ScrollTrigger.batch(tiles, {
        start: 'top 94%',
        onEnter: (batch) =>
          gsap.to(batch, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out', stagger: 0.1, overwrite: true }),
      })
    })
    return () => mm.revert()
  }, [videos])

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
    }
  }, [active, close])

  if (!videos.length) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-lg uppercase tracking-wide text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
          New episodes are on the way. Catch the latest on{' '}
          <a href={JB_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-ink)] underline">
            YouTube
          </a>
          .
        </p>
      </div>
    )
  }

  return (
    <div ref={rootRef}>
      {/* Featured */}
      {featured && (
        <section className="px-4 pt-4 md:px-8 lg:px-12">
          <div className="mx-auto max-w-5xl">
            <VideoTile v={featured} big autoPreview onOpen={() => setActive(featured)} />
          </div>
        </section>
      )}

      {/* Shorts row (vertical) */}
      {shorts.length > 0 && (
        <section className="px-4 pt-14 md:px-8 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <h2
              className="mb-5 text-lg font-extrabold uppercase tracking-widest text-[var(--color-foreground)] md:text-xl"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              Quick Clips
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {shorts.map((v) => (
                <VideoTile key={v.id} v={v} onOpen={() => setActive(v)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Horizontal grid */}
      {horizontals.length > 0 && (
        <section className="px-4 py-14 md:px-8 md:py-16 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <h2
              className="mb-5 text-lg font-extrabold uppercase tracking-widest text-[var(--color-foreground)] md:text-xl"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              Episodes & Drops
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {horizontals.map((v) => (
                <VideoTile key={v.id} v={v} onOpen={() => setActive(v)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox */}
      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          onClick={close}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
        >
          <div
            className={`relative w-full ${active.vertical ? 'max-w-sm' : 'max-w-5xl'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={close}
              aria-label="Close"
              className="absolute -top-11 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
            <div className={`w-full overflow-hidden rounded-2xl bg-black ${active.vertical ? 'aspect-[9/16]' : 'aspect-video'}`}>
              <iframe
                src={`${active.embedUrl}?autoplay=1&rel=0`}
                title={active.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
