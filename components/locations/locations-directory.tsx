'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { CA_OWNED, FL_OWNED, type OwnedStore } from '@/lib/owned-stores'
import StateMiniMap from './state-mini-map'

// Locations directory — the hand-drawn store illustrations grouped under animated
// California / Florida postcard headers. Reveals via a scroll handler toggling
// the shared .media-reveal / .loc-postcard .is-in utilities. Each card links to
// that store's menu. SEPARATE from the Product Finder (two-map rule).

function StoreCard({ s }: { s: OwnedStore }) {
  const linkProps = s.external ? { target: '_blank', rel: 'noopener noreferrer' } : {}
  return (
    <div className="media-reveal group relative flex flex-col overflow-hidden rounded-[1.6rem] border border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--color-accent)] hover:shadow-[0_36px_90px_-32px_rgba(254,207,14,0.5)]">
      {/* neutral light canvas so the black line-art illustration reads */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#f5f5f5]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: 'radial-gradient(circle at 50% 45%, rgba(254,207,14,0.22), transparent 62%)' }}
        />
        <Image
          src={s.image}
          alt={`${s.name} — Jungle Boys`}
          fill
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
          className={`relative object-cover ${s.imageInset ? 'scale-[0.8]' : ''}`}
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-2xl uppercase leading-none text-[var(--color-foreground)] md:text-3xl">{s.name}</h3>
        <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-[var(--color-muted)]">
          <svg viewBox="0 0 24 24" className="loc-pin mt-0.5 h-4 w-4 shrink-0 text-[var(--color-foreground)]" fill="currentColor" aria-hidden>
            <path d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z" />
          </svg>
          {s.address}
        </p>
        <p className="mt-1.5 flex items-start gap-2 text-xs uppercase tracking-wide text-[var(--color-muted)]">
          <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-foreground)]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <line className="loc-clock-hand" x1="12" y1="12" x2="12" y2="7.5" strokeLinecap="round" />
            <line x1="12" y1="12" x2="15" y2="13.5" strokeLinecap="round" />
          </svg>
          {s.hours}
        </p>
        <div className="mt-auto flex items-center gap-3 pt-5">
          {/* stretched link: ::after covers the whole card so it's fully clickable */}
          <Link
            href={s.menuUrl}
            {...linkProps}
            className="flex-1 rounded-full bg-[var(--color-accent)] px-5 py-3 text-center text-xs font-extrabold uppercase tracking-widest text-black transition-transform duration-200 after:absolute after:inset-0 after:content-[''] group-hover:scale-[1.02]"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            {s.cta ?? 'Shop Menu →'}
          </Link>
          <a
            href={`tel:${s.phone.replace(/[^\d+]/g, '')}`}
            aria-label={`Call ${s.name}`}
            className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent-ink)]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
              <path d="M6.6 10.8a15.5 15.5 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 013 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.3 1l-2.1 2.2z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}

function StateSection({ postcard, alt, stores }: { postcard: string; alt: string; stores: OwnedStore[] }) {
  return (
    <section className="px-4 pt-16 md:px-8 md:pt-24 lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex justify-center md:mb-14">
          {/* eslint-disable-next-line @next/next/no-img-element -- illustrated postcard header */}
          <img src={postcard} alt={alt} className="loc-postcard h-auto w-[min(90vw,720px)]" />
        </div>
        <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((s) => (
            <StoreCard key={s.slug} s={s} />
          ))}
          {/* fills the empty grid slot + adds life: a mini map of this state's stores */}
          <div className="media-reveal">
            <StateMiniMap stores={stores} label={`${alt} Stores`} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default function LocationsDirectory() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const els = Array.from(root.querySelectorAll<HTMLElement>('.media-reveal, .loc-postcard'))
    let raf = 0
    const reveal = () => {
      raf = 0
      els.forEach((el) => {
        if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < window.innerHeight * 0.9) el.classList.add('is-in')
      })
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(reveal)
    }
    const t = setTimeout(reveal, 200)
    const fs = setTimeout(() => els.forEach((el) => el.classList.add('is-in')), 2600)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      clearTimeout(t)
      clearTimeout(fs)
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div ref={rootRef}>
      <StateSection postcard="/locations/california.png" alt="California" stores={CA_OWNED} />
      <StateSection postcard="/locations/florida.png" alt="Florida" stores={FL_OWNED} />
    </div>
  )
}
