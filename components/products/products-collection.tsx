'use client'

import Image from 'next/image'
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
      {/* ===== character banner — same treatment as /contact /media /wholesale /phenos ===== */}
      <section className="px-2 pt-2 md:px-3">
        <div
          data-nav-theme="dark"
          className="media-hero-in relative flex min-h-[400px] items-center justify-center overflow-hidden rounded-[1.75rem] bg-[#0b0b0d] px-6 md:h-[520px] md:rounded-[2.5rem]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- graffiti bg */}
          <img
            src="/contact/contact-bg.jpg"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-110 object-cover object-center"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 90% 100% at 50% 60%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0.72) 100%)' }}
          />
          {/* giant PRODUCTS wordmark — drops in letter-by-letter, below the header */}
          <span
            aria-hidden
            className="font-display pointer-events-none absolute left-1/2 top-[92px] z-0 -translate-x-1/2 whitespace-nowrap uppercase leading-none text-white/90 md:top-[112px]"
            style={{ fontSize: 'min(26vw, 560px)' }}
          >
            {'PRODUCTS'.split('').map((ch, i) => (
              <span key={i} className="contact-letter" style={{ animationDelay: `${0.18 + i * 0.06}s` }}>
                {ch}
              </span>
            ))}
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element -- character art */}
          <img
            src="/products/products-header.svg"
            alt="Jungle Boys Products"
            className="contact-alive relative z-10 h-[108%] w-auto max-w-none translate-y-[4%] drop-shadow-[0_30px_70px_rgba(0,0,0,0.7)]"
          />
        </div>
      </section>

      {/* sr-only intro (the banner is decorative) */}
      <h1 className="sr-only">Products — The Jungle Boys Collection</h1>
      <p className="mx-auto max-w-2xl px-6 pt-14 text-center text-sm uppercase leading-relaxed tracking-wide text-[var(--color-muted)] md:pt-20 md:text-base" style={{ fontFamily: 'var(--font-brand)' }}>
        Every Jungle Boys line in one place — from Hash Holes to top-shelf flower. Playing with fire, in every format.
      </p>

      {/* ===== category grid ===== */}
      <section className="px-4 pt-16 md:px-8 md:pt-24 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-14">
            <h2 className="font-display text-5xl uppercase leading-[0.9] text-[var(--color-foreground)] md:text-7xl">
              Shop the lineup
            </h2>
            <p className="max-w-sm text-sm uppercase tracking-wide text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
              Every Jungle Boys line — pick your format. Full menus live at each store.
            </p>
          </div>

          {/* product grid — shorter cards, big product shots, pill tag + button.
              Hover: product lifts, gold glow blooms, and (where set) two nugs pop
              out each side of the product. */}
          <div className="grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-3">
            {PRODUCT_LINES.map((line) => (
              <Link
                key={line.slug}
                href={`/products/${line.slug}`}
                className="media-reveal group relative flex flex-col overflow-hidden rounded-[1.5rem] shadow-[0_30px_70px_-42px_rgba(0,0,0,0.55)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_48px_110px_-40px_rgba(254,207,14,0.55)]"
                style={{ background: 'linear-gradient(180deg, #ffffff 0%, #e7e7ea 100%)' }}
              >
                {line.isNew && (
                  <span
                    className="absolute left-1/2 top-3.5 z-20 -translate-x-1/2 rounded-full bg-[var(--color-accent)] px-5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-black shadow-md"
                    style={{ fontFamily: 'var(--font-brand)' }}
                  >
                    New!
                  </span>
                )}

                {/* image stage (shorter; bigger product) */}
                <div className="relative aspect-[7/6] w-full">
                  {/* gold glow blooms on hover */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: 'radial-gradient(circle at 50% 46%, rgba(254,207,14,0.28), transparent 60%)' }}
                  />
                  {/* nugs pop out each side of the product on hover */}
                  {line.nugs && (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element -- transparent bud */}
                      <img src={line.nugs[0]} alt="" aria-hidden className="prod-nug prod-nug--l" />
                      {/* eslint-disable-next-line @next/next/no-img-element -- transparent bud */}
                      <img src={line.nugs[1]} alt="" aria-hidden className="prod-nug prod-nug--r" />
                    </>
                  )}
                  <Image
                    src={line.image}
                    alt={`Jungle Boys ${line.name}`}
                    fill
                    sizes="(max-width:640px) 50vw, (max-width:1024px) 50vw, 33vw"
                    className="relative z-10 object-contain p-3.5 drop-shadow-[0_18px_26px_rgba(0,0,0,0.18)] transition-transform duration-500 group-hover:scale-[1.07] md:p-5"
                  />
                </div>

                {/* footer: tag pill + name + SHOP NOW pill */}
                <div className="relative z-10 flex flex-col items-center px-4 pb-5 text-center md:px-5">
                  <span
                    className="rounded-full border border-black/15 px-3.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.2em] text-black/55 md:text-[10px]"
                    style={{ fontFamily: 'var(--font-brand)' }}
                  >
                    {line.tag}
                  </span>
                  <h3 className="font-display mt-2.5 text-2xl uppercase leading-none text-black md:text-3xl">{line.name}</h3>
                  <span
                    className="mt-3.5 inline-flex items-center gap-2 rounded-full bg-black px-7 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-white transition-colors duration-200 group-hover:bg-[var(--color-accent)] group-hover:text-black md:text-xs"
                    style={{ fontFamily: 'var(--font-brand)' }}
                  >
                    Shop Now
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>
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
