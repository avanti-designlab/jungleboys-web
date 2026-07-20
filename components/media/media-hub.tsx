'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { JB_CHANNEL_URL, youtubeThumb, type Video } from '@/lib/media/youtube'

// Bento video gallery: varied tile sizes (some big, some small) that cascade
// down into place as you scroll. Any card opens a youtube-nocookie lightbox.

gsap.registerPlugin(ScrollTrigger)

// 12-col spans that tile cleanly in row-groups summing to 12; the first
// (latest) tile is the big one. Cycles for longer feeds.
const SPANS = [8, 4, 4, 4, 4, 6, 6, 4, 4, 4, 6, 6, 4, 4, 4]
const spanClass: Record<number, string> = {
  8: 'lg:col-span-8',
  6: 'lg:col-span-6',
  4: 'lg:col-span-4',
}
function spanFor(i: number) {
  return spanClass[SPANS[i % SPANS.length]] ?? 'lg:col-span-4'
}

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
  const gridRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setActive(null), [])

  // cascade: tiles slide down from above as they scroll into view
  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tiles = grid.querySelectorAll<HTMLElement>('[data-tile]')
      gsap.set(tiles, { y: -70, autoAlpha: 0 })
      ScrollTrigger.batch(tiles, {
        start: 'top 92%',
        onEnter: (batch) =>
          gsap.to(batch, {
            y: 0,
            autoAlpha: 1,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.12,
            overwrite: true,
          }),
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
      <section className="px-4 py-10 md:px-8 md:py-14 lg:px-12">
        <div
          ref={gridRef}
          className="grid auto-rows-auto grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-5"
          style={{ gridAutoFlow: 'dense' }}
        >
          {videos.map((v, i) => {
            const big = i === 0
            return (
              <button
                key={v.id}
                data-tile
                onClick={() => setActive(v)}
                aria-label={`Play ${v.title}`}
                className={`group relative block overflow-hidden rounded-2xl text-left will-change-transform ${
                  big ? 'sm:col-span-2' : ''
                } ${spanFor(i)}`}
              >
                <div className="relative aspect-video w-full bg-[var(--color-surface)]">
                  <Image
                    src={big ? youtubeThumb(v.id, 'maxres') : v.thumbnail}
                    alt={v.title}
                    fill
                    priority={big}
                    sizes={big ? '(max-width: 1024px) 100vw, 66vw' : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* readability gradient — stronger on the big tile which carries a caption */}
                  <div
                    className={`absolute inset-0 ${
                      big
                        ? 'bg-gradient-to-t from-black/85 via-black/20 to-transparent'
                        : 'bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80'
                    }`}
                  />
                  <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-accent)] text-black opacity-0 shadow-[0_0_30px_rgba(254,207,14,0.5)] transition-all duration-300 group-hover:scale-110 group-hover:opacity-100">
                    <PlayIcon className="ml-0.5 h-6 w-6" />
                  </span>

                  {big && (
                    <span className="absolute left-4 top-4 rounded-full bg-[var(--color-accent)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-black" style={{ fontFamily: 'var(--font-brand)' }}>
                      Latest Episode
                    </span>
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-5" style={{ fontFamily: 'var(--font-brand)' }}>
                    <h3
                      className={`font-extrabold uppercase leading-tight tracking-wide text-white ${
                        big ? 'line-clamp-2 text-lg md:text-2xl' : 'line-clamp-2 text-sm'
                      }`}
                    >
                      {v.title}
                    </h3>
                    <p className="mt-1 text-[10px] uppercase tracking-wide text-white/60">
                      {formatDate(v.publishedAt)}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

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
