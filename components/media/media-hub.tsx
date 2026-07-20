'use client'

import Image from 'next/image'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { JB_CHANNEL_URL, youtubeThumb, type Video } from '@/lib/media/youtube'

// Media gallery. The latest upload sits in its own yellow "pill" so it stands
// out; the rest fill a mosaic where every tile is 16:9 but some span 2×2 for
// rhythm. All rows share one computed height (--row-h = a 1-col slot's 16:9
// height) so big tiles are exactly 2 rows tall and everything stays aligned —
// no ragged edges, no dead space. Tiles slide in on entry (scroll handler, not
// IntersectionObserver). Static thumbnails (age-restricted uploads won't embed).
// Click = lightbox; verticals open 9:16 there.

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
  fill,
  revealed,
  onOpen,
}: {
  v: Video
  big?: boolean
  fill?: boolean // stretch to fill a grid cell (mosaic) instead of imposing 16:9
  revealed: boolean
  onOpen: () => void
}) {
  return (
    <button
      data-tile
      data-vid={v.id}
      onClick={onOpen}
      aria-label={`Play ${v.title}`}
      className={`group block overflow-hidden rounded-2xl text-left ${fill ? 'absolute inset-0 h-full w-full' : 'relative w-full'}`}
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'translateY(0)' : 'translateY(-24px)',
        transition: 'opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      <div className={`relative w-full bg-[var(--color-surface)] ${fill ? 'h-full' : 'aspect-video'}`}>
        <Image
          src={youtubeThumb(v.id, big ? 'maxres' : 'hq')}
          alt={v.title}
          fill
          priority={big}
          sizes={big ? '(max-width:1024px) 100vw, 760px' : '(max-width:640px) 50vw, (max-width:1024px) 33vw, 380px'}
          className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <span className={`pointer-events-none absolute right-3 top-3 flex items-center justify-center rounded-full bg-black/45 text-white opacity-70 backdrop-blur-sm transition-all duration-300 group-hover:bg-[var(--color-accent)] group-hover:text-black group-hover:opacity-100 ${big ? 'h-11 w-11' : 'h-9 w-9'}`}>
          <PlayIcon className={`ml-0.5 ${big ? 'h-5 w-5' : 'h-4 w-4'}`} />
        </span>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 md:p-4" style={{ fontFamily: 'var(--font-brand)' }}>
          <h3 className={`line-clamp-2 font-extrabold uppercase leading-tight tracking-wide text-white ${big ? 'text-base md:text-xl' : 'text-xs md:text-sm'}`}>
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
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set())
  const rootRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setActive(null), [])

  // featured = latest horizontal upload (goes in the yellow pill); rest → mosaic
  const featured = videos.find((v) => !v.vertical) ?? videos[0]
  const rest = videos.filter((v) => v.id !== featured?.id)

  // Keep every mosaic row the height of a 1-col 16:9 slot, so a 2×2 tile is
  // exactly two rows tall and the grid stays perfectly aligned.
  useLayoutEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const setRowHeight = () => {
      const slot = grid.querySelector<HTMLElement>('[data-span="1"]')
      const w = slot?.getBoundingClientRect().width ?? 0
      if (w) grid.style.setProperty('--row-h', `${(w * 9) / 16}px`)
    }
    setRowHeight()
    const ro = new ResizeObserver(setRowHeight)
    ro.observe(grid)
    window.addEventListener('resize', setRowHeight)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', setRowHeight)
    }
  }, [videos])

  // Reveal: each tile slides in once its top crosses 92% of the viewport.
  // Reduced motion: reveal everything up front.
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
      <div ref={rootRef} className="mx-auto max-w-[1500px] px-4 pb-4 pt-10 md:px-8 md:pt-14 lg:px-12">
        {/* Latest video — its own yellow pill so the section pops */}
        {featured && (
          <section className="mb-8 md:mb-10">
            <div className="rounded-[1.6rem] bg-[var(--color-accent)] p-2.5 shadow-[0_20px_60px_-20px_rgba(254,207,14,0.6)] md:rounded-[2rem] md:p-3.5">
              <div className="flex items-center justify-between px-2 pb-2.5 pt-1 md:px-3" style={{ fontFamily: 'var(--font-brand)' }}>
                <span className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-widest text-black md:text-base">
                  <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-black" />
                  Latest Episode
                </span>
                <span className="hidden text-xs font-bold uppercase tracking-widest text-black/70 sm:block">
                  {formatDate(featured.publishedAt)}
                </span>
              </div>
              <div className="relative overflow-hidden rounded-[1.1rem] md:rounded-[1.4rem]">
                <VideoTile v={featured} big {...tileProps(featured)} />
              </div>
            </div>
          </section>
        )}

        {/* Mosaic — all 16:9, some 2×2 for rhythm, all aligned */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 gap-4 [grid-auto-flow:row_dense] md:grid-cols-3 lg:grid-cols-4 lg:gap-5"
          style={{ gridAutoRows: 'var(--row-h, 200px)' }}
        >
          {rest.map((v, i) => {
            const big = i % 5 === 0 // every 5th tile is a 2×2 accent (1 big + 4 small tiles the 4-col band)
            return (
              <div key={v.id} data-span={big ? '2' : '1'} className={`relative ${big ? 'col-span-2 row-span-2' : ''}`}>
                <VideoTile v={v} big={big} fill {...tileProps(v)} />
              </div>
            )
          })}
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
