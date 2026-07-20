'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { JB_CHANNEL_URL, youtubeThumb, type Video } from '@/lib/media/youtube'

// Video gallery: one full-width featured hero, then a uniform 16:9 grid. Every
// tile is the same shape so rows always align — no ragged masonry bottoms, no
// dead space. Tiles slide in on entry (one scroll handler, getBoundingClientRect,
// not IntersectionObserver). Static thumbnails with a subtle hover zoom — autoplay
// previews were dropped because many uploads are age-restricted and won't embed.
// Verticals still open as 9:16 in the lightbox. Click = lightbox.

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

function VideoTile({
  v,
  big,
  revealed,
  onOpen,
}: {
  v: Video
  big?: boolean
  revealed: boolean
  onOpen: () => void
}) {
  return (
    <button
      data-tile
      data-vid={v.id}
      onClick={onOpen}
      aria-label={`Play ${v.title}`}
      className="group relative block w-full overflow-hidden rounded-2xl text-left"
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'translateY(0)' : 'translateY(-24px)',
        transition: 'opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      <div className="relative aspect-video w-full bg-[var(--color-surface)]">
        <Image
          src={youtubeThumb(v.id, big ? 'maxres' : 'hq')}
          alt={v.title}
          fill
          priority={big}
          sizes={big ? '(max-width:1024px) 100vw, 1152px' : '(max-width:640px) 50vw, (max-width:1024px) 33vw, 384px'}
          className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <span className={`pointer-events-none absolute right-3 top-3 flex items-center justify-center rounded-full bg-black/45 text-white opacity-70 backdrop-blur-sm transition-all duration-300 group-hover:bg-[var(--color-accent)] group-hover:text-black group-hover:opacity-100 ${big ? 'h-12 w-12' : 'h-9 w-9'}`}>
          <PlayIcon className={`ml-0.5 ${big ? 'h-5 w-5' : 'h-4 w-4'}`} />
        </span>
        {big && (
          <span className="absolute left-4 top-4 rounded-full bg-[var(--color-accent)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-black" style={{ fontFamily: 'var(--font-brand)' }}>
            Latest Episode
          </span>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 md:p-5" style={{ fontFamily: 'var(--font-brand)' }}>
          <h3 className={`line-clamp-2 font-extrabold uppercase leading-tight tracking-wide text-white ${big ? 'text-xl md:text-3xl' : 'text-xs md:text-sm'}`}>
            {v.title}
          </h3>
          <p className={`mt-1 uppercase tracking-wide text-white/60 ${big ? 'text-xs' : 'text-[10px]'}`}>{formatDate(v.publishedAt)}</p>
        </div>
      </div>
    </button>
  )
}

export default function MediaHub({ videos }: { videos: Video[] }) {
  const [active, setActive] = useState<Video | null>(null)
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set())
  const rootRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setActive(null), [])

  // featured = latest horizontal upload; the rest fill a uniform grid
  const featured = videos.find((v) => !v.vertical) ?? videos[0]
  const rest = videos.filter((v) => v.id !== featured?.id)

  // Reveal: each tile slides in once its top crosses 92% of the viewport
  // (sticky, scroll-driven via getBoundingClientRect). Reduced motion: reveal
  // everything up front.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const revealed = new Set<string>()

    if (reduce) {
      root.querySelectorAll<HTMLElement>('[data-tile]').forEach((el) => el.dataset.vid && revealed.add(el.dataset.vid))
      setRevealedIds(revealed)
      return
    }

    let raf = 0
    const reveal = () => {
      raf = 0
      let changed = false
      root.querySelectorAll<HTMLElement>('[data-tile]').forEach((el) => {
        const id = el.dataset.vid
        if (id && !revealed.has(id) && el.getBoundingClientRect().top < window.innerHeight * 0.92) {
          revealed.add(id)
          changed = true
        }
      })
      if (changed) setRevealedIds(new Set(revealed))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(reveal)
    }
    const t = setTimeout(reveal, 250)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      clearTimeout(t)
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
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

  const tileProps = (v: Video) => ({ revealed: revealedIds.has(v.id), onOpen: () => setActive(v) })

  return (
    <>
      <div ref={rootRef} className="mx-auto max-w-6xl px-4 pb-4 pt-10 md:px-8 md:pt-14 lg:px-12">
        {featured && (
          <div className="mb-4 md:mb-5">
            <VideoTile v={featured} big {...tileProps(featured)} />
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-5">
          {rest.map((v) => (
            <VideoTile key={v.id} v={v} {...tileProps(v)} />
          ))}
        </div>
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          onClick={close}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
        >
          <div className={`relative w-full ${active.vertical ? 'max-w-sm' : 'max-w-5xl'}`} onClick={(e) => e.stopPropagation()}>
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
    </>
  )
}
