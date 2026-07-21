'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { PRODUCT_LINES } from '@/lib/products'

// The Products collection: an immersive product-collage hero (Figma art) over a
// grid of the JB product lines. Each card links to that line's page under
// /products/<slug>. Reveal via the shared .media-reveal / .is-in scroll toggle.

export default function ProductsCollection() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const els = Array.from(root.querySelectorAll<HTMLElement>('.media-reveal'))
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
      {/* ===== immersive collage hero ===== */}
      <section className="px-2 pt-2 md:px-3">
        <div
          data-nav-theme="dark"
          className="media-hero-in relative flex min-h-[78vh] items-center justify-center overflow-hidden rounded-[1.75rem] bg-[#0A0B0D] px-6 md:rounded-[2.5rem]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- full-bleed collage art */}
          <img
            src="/products/collage.jpg"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-105 object-cover object-center"
          />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/85" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <span className="text-xs font-bold uppercase tracking-[0.5em] text-white/70 md:text-sm" style={{ fontFamily: 'var(--font-brand)' }}>
              The Collection
            </span>
            <h1 className="font-display mt-4 text-[clamp(4rem,17vw,16rem)] uppercase leading-[0.82] text-white drop-shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
              Products
            </h1>
            <p className="mt-5 max-w-xl text-sm uppercase leading-relaxed tracking-wide text-white/70 md:text-base" style={{ fontFamily: 'var(--font-brand)' }}>
              Every Jungle Boys line in one place — from Hash Holes to top-shelf flower. Playing with fire, in every format.
            </p>
          </div>
        </div>
      </section>

      {/* ===== category grid ===== */}
      <section className="px-4 pt-16 md:px-8 md:pt-24 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-14">
            <h2 className="font-display text-5xl uppercase leading-[0.9] text-[var(--color-foreground)] md:text-7xl">
              Shop the lineup
            </h2>
            <p className="max-w-sm text-sm uppercase tracking-wide text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
              Six signature lines. Pick your format — full menus live at each store.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCT_LINES.map((line, i) => (
              <Link
                key={line.slug}
                href={`/products/${line.slug}`}
                className="media-reveal group relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--color-accent)] hover:shadow-[0_40px_100px_-40px_rgba(254,207,14,0.55)]"
              >
                {/* hover glow */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: 'radial-gradient(circle at 50% 30%, rgba(254,207,14,0.14), transparent 62%)' }}
                />
                {/* oversized number watermark */}
                <span aria-hidden className="font-display pointer-events-none absolute -right-1 -top-9 select-none text-[9rem] leading-none text-[var(--color-foreground)] opacity-[0.05]">
                  {String(i + 1).padStart(2, '0')}
                </span>

                <span
                  className="relative w-fit rounded-full border border-[var(--color-border)] px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--color-muted)]"
                  style={{ fontFamily: 'var(--font-brand)' }}
                >
                  {line.tag}
                </span>

                <div className="relative mt-auto pt-10">
                  <h3 className="font-display text-4xl uppercase leading-[0.9] text-[var(--color-foreground)] md:text-5xl">
                    {line.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">{line.blurb}</p>
                  <span
                    className="mt-6 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[var(--color-foreground)] transition-colors group-hover:text-[var(--color-accent-ink)]"
                    style={{ fontFamily: 'var(--font-brand)' }}
                  >
                    View the line
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden>
                      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* shop CTA */}
          <div className="media-reveal mt-14 flex flex-col items-center gap-4 rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center md:mt-16">
            <h3 className="font-display text-4xl uppercase leading-none text-[var(--color-foreground)] md:text-5xl">
              Want to buy right now?
            </h3>
            <p className="max-w-md text-sm uppercase tracking-wide text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
              Browse live inventory and prices at your nearest Jungle Boys store.
            </p>
            <Link
              href="/locations"
              className="mt-2 inline-flex items-center gap-3 rounded-full bg-[var(--color-accent)] py-3.5 pl-7 pr-3 text-black transition-transform duration-200 hover:scale-[1.03]"
            >
              <span className="text-sm font-extrabold uppercase tracking-widest" style={{ fontFamily: 'var(--font-brand)' }}>
                Find a store
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-4 w-4" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
