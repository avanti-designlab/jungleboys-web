'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { PRODUCT_LINES } from '@/lib/products'

// The Products collection: an immersive product-collage hero (Figma art) over a
// grid of the JB product lines. Each card links to that line's page under
// /products/<slug>. Reveal via the shared .media-reveal / .is-in scroll toggle.

// Popcorn burst for the Pops card: many mini-nug kernels shoot up from the bottom
// and arc back down, continuously while hovering — like a popcorn machine. Fixed
// pseudo-random params so the layout is stable across renders. img cycles the set.
const POPCORN_KERNELS = [
  { img: 0, left: 46, w: 13, x: -8, h: 200, r: 220, d: 0.0, dur: 1.25 },
  { img: 1, left: 52, w: 11, x: 40, h: 240, r: -180, d: 0.15, dur: 1.4 },
  { img: 2, left: 40, w: 12, x: -55, h: 175, r: 160, d: 0.32, dur: 1.15 },
  { img: 3, left: 55, w: 10, x: 70, h: 210, r: -240, d: 0.48, dur: 1.5 },
  { img: 4, left: 48, w: 12, x: 12, h: 265, r: 200, d: 0.62, dur: 1.35 },
  { img: 5, left: 44, w: 11, x: -80, h: 195, r: -150, d: 0.8, dur: 1.2 },
  { img: 1, left: 58, w: 12, x: 95, h: 180, r: 190, d: 0.95, dur: 1.45 },
  { img: 0, left: 50, w: 10, x: -30, h: 250, r: -210, d: 1.1, dur: 1.3 },
  { img: 3, left: 42, w: 13, x: -100, h: 165, r: 170, d: 1.25, dur: 1.1 },
  { img: 2, left: 54, w: 11, x: 58, h: 230, r: -190, d: 1.4, dur: 1.5 },
  { img: 5, left: 47, w: 12, x: 20, h: 275, r: 230, d: 1.55, dur: 1.35 },
  { img: 4, left: 38, w: 10, x: -68, h: 185, r: -160, d: 1.7, dur: 1.25 },
  { img: 0, left: 60, w: 11, x: 110, h: 205, r: 180, d: 1.85, dur: 1.4 },
  { img: 2, left: 51, w: 12, x: -18, h: 255, r: -220, d: 2.0, dur: 1.3 },
  { img: 3, left: 45, w: 10, x: 48, h: 190, r: 150, d: 2.15, dur: 1.2 },
  { img: 1, left: 49, w: 13, x: -45, h: 235, r: -200, d: 2.3, dur: 1.45 },
] as const

// Link cards under the product grid — image tiles that route to other surfaces.
// Drop a transparent/cover image at `image` (e.g. /products/links/deals.jpg) to
// swap the placeholder glow for artwork. Some targets are Phase-3 pages (they'll
// resolve once built); the links are wired now.
const LINK_CARDS: { title: string; sub: string; href: string; glow: string; image?: string }[] = [
  { title: 'Fresh Drops', sub: 'New this week', href: '/drops', glow: 'rgba(254,207,14,0.55)' },
  { title: 'Deals', sub: 'Save more', href: '/710-deals', glow: 'rgba(120,224,140,0.5)' },
  { title: 'Rewards', sub: 'PWF Rewards', href: '/rewards', glow: 'rgba(180,130,255,0.5)' },
  { title: 'Locations', sub: 'Find a store', href: '/locations', glow: 'rgba(110,180,255,0.5)' },
]

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

          {/* product grid — premium editorial cards: big product shot on a light
              studio stage, name left-aligned, an arrow disc for the shop action.
              Hover: product lifts, gold glow, and (where set) nugs pop out. */}
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
            {PRODUCT_LINES.map((line) => (
              <Link
                key={line.slug}
                href={`/products/${line.slug}`}
                className="media-reveal group relative flex flex-col overflow-hidden rounded-[1.6rem] shadow-[0_34px_80px_-46px_rgba(0,0,0,0.6)] ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-[0_52px_120px_-44px_rgba(254,207,14,0.6)]"
                style={{
                  background: line.hoverVideo
                    ? '#ffffff' // matches the video's white bg so it blends seamlessly
                    : 'radial-gradient(120% 90% at 50% 12%, #ffffff 0%, #f2f2f4 55%, #e6e6e9 100%)',
                }}
                onMouseEnter={(e) => {
                  const v = e.currentTarget.querySelector('video')
                  if (v) v.play().catch(() => {})
                }}
                onMouseLeave={(e) => {
                  const v = e.currentTarget.querySelector('video')
                  if (v) {
                    v.pause()
                    v.currentTime = 0
                  }
                }}
              >
                {line.isNew && (
                  <span
                    className="absolute left-4 top-4 z-20 rounded-full bg-[var(--color-accent)] px-4 py-1 text-[10px] font-extrabold uppercase tracking-[0.22em] text-black shadow-md"
                    style={{ fontFamily: 'var(--font-brand)' }}
                  >
                    New
                  </span>
                )}

                {/* big product stage */}
                <div className="relative flex-1" style={{ minHeight: '19rem' }}>
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: 'radial-gradient(circle at 50% 44%, rgba(254,207,14,0.32), transparent 58%)' }}
                  />
                  {line.popOut?.map((p, i) => (
                    /* eslint-disable-next-line @next/next/no-img-element -- transparent pop-out */
                    <img
                      key={i}
                      src={p.src}
                      alt=""
                      aria-hidden
                      className="prod-pop"
                      style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%`, ['--rot' as string]: `${p.rot}deg` }}
                    />
                  ))}
                  {line.fan && (
                    <div className="prod-fan" aria-hidden>
                      {line.fan.angles.map((a, i) => (
                        /* eslint-disable-next-line @next/next/no-img-element -- transparent mini joint */
                        <img
                          key={i}
                          src={line.fan!.src}
                          alt=""
                          className="prod-fan-joint"
                          style={{ top: `${line.fan!.pivotY}%`, width: `${line.fan!.w}%`, ['--a' as string]: `${a}deg`, ['--i' as string]: i }}
                        />
                      ))}
                    </div>
                  )}
                  {line.popcorn && (
                    <div className="prod-popcorn" aria-hidden>
                      {POPCORN_KERNELS.map((k, i) => (
                        /* eslint-disable-next-line @next/next/no-img-element -- transparent mini bud */
                        <img
                          key={i}
                          src={line.popcorn![k.img % line.popcorn!.length]}
                          alt=""
                          className="pops-kernel"
                          style={{
                            left: `${k.left}%`,
                            width: `${k.w}%`,
                            ['--x' as string]: `${k.x}px`,
                            ['--h' as string]: `${k.h}px`,
                            ['--r' as string]: `${k.r}deg`,
                            ['--d' as string]: `${k.d}s`,
                            ['--dur' as string]: `${k.dur}s`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                  {line.hoverVideo ? (
                    /* the video IS the product for this card — its first frame shows at
                       rest and it plays on hover, so there's no static/video mismatch */
                    <video
                      className="prod-hovervid"
                      poster={line.image}
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      aria-label={`Jungle Boys ${line.name}`}
                    >
                      <source src={line.hoverVideo} type="video/mp4" />
                    </video>
                  ) : (
                    <Image
                      src={line.image}
                      alt={`Jungle Boys ${line.name}`}
                      fill
                      sizes="(max-width:640px) 50vw, (max-width:1024px) 45vw, 30vw"
                      className="relative z-10 object-contain p-2 drop-shadow-[0_16px_24px_rgba(0,0,0,0.22)] transition-transform duration-500 group-hover:scale-[1.06] md:p-3"
                    />
                  )}
                  {line.splash && (
                    /* eslint-disable-next-line @next/next/no-img-element -- transparent liquid overlay */
                    <img src={line.splash} alt="" aria-hidden className="prod-splash" />
                  )}
                </div>

                {/* editorial footer: tag + big name (left), arrow disc (right) */}
                <div className="relative z-10 flex items-end justify-between gap-3 px-5 pb-5 pt-1 md:px-6 md:pb-6">
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.26em] text-black/40" style={{ fontFamily: 'var(--font-brand)' }}>
                      {line.tag}
                    </span>
                    <h3 className="font-display mt-1 text-[1.5rem] uppercase leading-[0.88] text-black md:text-[1.9rem]">{line.name}</h3>
                  </div>
                  <span
                    aria-hidden
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-white transition-all duration-200 group-hover:bg-[var(--color-accent)] group-hover:text-black md:h-12 md:w-12"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" className="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden>
                      <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* explore-more link cards — image tiles routing to other surfaces */}
          <div className="media-reveal mt-16 md:mt-24">
            <h3 className="font-display mb-6 text-4xl uppercase leading-none text-[var(--color-foreground)] md:mb-8 md:text-5xl">
              Explore more
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {LINK_CARDS.map((c) => (
                <Link
                  key={c.title}
                  href={c.href}
                  className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[1.4rem] shadow-[0_30px_70px_-46px_rgba(0,0,0,0.6)] ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-[0_46px_110px_-44px_rgba(254,207,14,0.6)]"
                >
                  {c.image ? (
                    <Image src={c.image} alt="" fill sizes="(max-width:640px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div aria-hidden className="absolute inset-0" style={{ background: `radial-gradient(120% 90% at 30% 12%, ${c.glow}, transparent 60%), #121216` }} />
                  )}
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="relative z-10 p-5">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.26em] text-white/60" style={{ fontFamily: 'var(--font-brand)' }}>
                      {c.sub}
                    </span>
                    <h4 className="font-display mt-1 text-2xl uppercase leading-[0.9] text-white md:text-[1.7rem]">{c.title}</h4>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-brand)' }}>
                      Explore
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>
                        <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
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
