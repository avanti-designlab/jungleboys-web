'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import Reveal from '@/components/reveal'
import { JB_CHANNEL_URL, youtubeThumb, type Video } from '@/lib/media/youtube'

// Video-first gallery: a featured hero + responsive grid. Any card opens a
// lightbox with the privacy-enhanced YouTube embed (no cookies until play).

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

export default function MediaHub({ videos }: { videos: Video[] }) {
  const [active, setActive] = useState<Video | null>(null)
  const [featured, ...rest] = videos

  const close = useCallback(() => setActive(null), [])

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
        <p
          className="text-lg uppercase tracking-wide text-[var(--color-muted)]"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
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
    <>
      {/* Featured */}
      <section className="px-6 pt-6 md:px-12 lg:px-20">
        <Reveal>
          <button
            onClick={() => setActive(featured)}
            className="group relative block w-full overflow-hidden rounded-[2rem] text-left"
            aria-label={`Play ${featured.title}`}
          >
            <div className="relative aspect-video w-full">
              <Image
                src={youtubeThumb(featured.id, 'maxres')}
                alt={featured.title}
                fill
                priority
                sizes="100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />
            </div>
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between md:p-10">
              <div className="max-w-3xl" style={{ fontFamily: 'var(--font-brand)' }}>
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-accent)]">
                  Latest Episode
                </span>
                <h2 className="mt-2 text-2xl font-extrabold uppercase leading-tight tracking-tight text-white md:text-4xl">
                  {featured.title}
                </h2>
                <p className="mt-2 text-xs uppercase tracking-wide text-white/60">
                  {formatDate(featured.publishedAt)}
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-3 rounded-full bg-[var(--color-accent)] py-3 pl-5 pr-6 text-black transition-transform duration-200 group-hover:scale-105">
                <PlayIcon className="h-5 w-5" />
                <span className="text-sm font-extrabold uppercase tracking-widest" style={{ fontFamily: 'var(--font-brand)' }}>
                  Watch
                </span>
              </span>
            </div>
          </button>
        </Reveal>
      </section>

      {/* Grid */}
      <section className="px-6 py-14 md:px-12 md:py-20 lg:px-20">
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((v, i) => (
            <Reveal key={v.id} delay={(i % 3) * 0.08}>
              <button
                onClick={() => setActive(v)}
                className="group block w-full text-left"
                aria-label={`Play ${v.title}`}
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-[var(--color-surface)]">
                  <Image
                    src={v.thumbnail}
                    alt={v.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                    <PlayIcon className="ml-0.5 h-6 w-6" />
                  </span>
                </div>
                <h3
                  className="mt-3 line-clamp-2 text-sm font-extrabold uppercase leading-snug tracking-wide text-[var(--color-foreground)] transition-colors group-hover:text-[var(--color-accent-ink)]"
                  style={{ fontFamily: 'var(--font-brand)' }}
                >
                  {v.title}
                </h3>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-[var(--color-muted)]">
                  {formatDate(v.publishedAt)}
                </p>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          onClick={close}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={close}
              aria-label="Close"
              className="absolute -top-11 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
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
    </>
  )
}
