'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { BlogSummary } from '@/lib/blog'

gsap.registerPlugin(ScrollTrigger)

function fmtDate(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

const ArrowIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className={className} aria-hidden>
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function BlogIndex({ posts }: { posts: BlogSummary[] }) {
  const [featured, ...rest] = posts
  const categories = useMemo(
    () => Array.from(new Set(rest.map((p) => p.category).filter(Boolean))),
    [rest]
  )
  const [active, setActive] = useState<string>('All')
  const visible = active === 'All' ? rest : rest.filter((p) => p.category === active)

  const gridRef = useRef<HTMLDivElement>(null)
  const featRef = useRef<HTMLElement>(null)

  // featured card: reveal on mount
  useEffect(() => {
    const el = featRef.current
    if (!el) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(el, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.1 })
    })
    return () => mm.revert()
  }, [])

  // grid cards: staggered scroll-reveal. Re-runs when the filter changes.
  useEffect(() => {
    const box = gridRef.current
    if (!box) return
    const cards = Array.from(box.querySelectorAll<HTMLElement>('[data-card]'))
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 34 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.09,
          scrollTrigger: { trigger: box, start: 'top 88%', once: true },
        }
      )
      ScrollTrigger.refresh()
    })
    return () => mm.revert()
  }, [active])

  if (posts.length === 0) {
    return (
      <div className="mt-16 rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
        <p className="font-display text-3xl uppercase text-[var(--color-foreground)]">Coming soon</p>
        <p className="mt-3 text-sm text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-body)' }}>
          New stories from the jungle are on the way.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* ── Featured (latest) post — big editorial split card ─────────────── */}
      {featured && (
        <section ref={featRef} className="mt-10 md:mt-14">
          <Link
            href={`/blog/${featured.slug}`}
            className="group grid overflow-hidden rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-500 hover:border-[var(--color-accent)] hover:shadow-[0_50px_120px_-60px_rgba(0,0,0,0.7)] md:grid-cols-2"
          >
            <div className="relative aspect-[16/11] overflow-hidden md:aspect-auto">
              {featured.image ? (
                <Image
                  src={featured.image}
                  alt={featured.imageAlt}
                  fill
                  sizes="(max-width:768px) 100vw, 50vw"
                  priority
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                />
              ) : (
                <div className="absolute inset-0" style={{ background: 'radial-gradient(90% 90% at 30% 10%, rgba(254,207,14,0.25), transparent 60%), #121216' }} />
              )}
              <span className="absolute left-4 top-4 rounded-full bg-[var(--color-accent)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-black" style={{ fontFamily: 'var(--font-brand)' }}>
                Latest
              </span>
            </div>
            <div className="flex flex-col justify-center gap-4 p-7 md:p-11">
              <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
                {featured.category && <span className="text-[var(--color-accent)]">{featured.category}</span>}
                {featured.category && featured.date && <span>·</span>}
                {featured.date && <span>{fmtDate(featured.date)}</span>}
              </div>
              <h2 className="font-display text-4xl uppercase leading-[0.92] text-[var(--color-foreground)] md:text-6xl">
                {featured.title}
              </h2>
              {featured.excerpt && (
                <p className="max-w-prose text-base leading-relaxed text-[var(--color-muted)] md:text-lg" style={{ fontFamily: 'var(--font-body)' }}>
                  {featured.excerpt}
                </p>
              )}
              <span className="mt-1 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[var(--color-foreground)]" style={{ fontFamily: 'var(--font-brand)' }}>
                Read the story
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--color-foreground)] text-[var(--color-background)] transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowIcon className="h-4 w-4" />
                </span>
              </span>
            </div>
          </Link>
        </section>
      )}

      {/* ── Grid section — black "pill" (forced dark so pills + cards flip) ─ */}
      <section
        data-theme="dark"
        data-nav-theme="dark"
        className="mt-12 overflow-hidden rounded-[2rem] bg-[#0b0b0d] p-6 text-[var(--color-foreground)] md:mt-16 md:rounded-[2.75rem] md:p-10 lg:p-12"
      >
        {/* filter pills */}
        {categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5">
            {['All', ...categories].map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors duration-200 ${
                  active === c
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-black'
                    : 'border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-foreground)] hover:text-[var(--color-foreground)]'
                }`}
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* grid */}
        <div ref={gridRef} className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((p, i) => (
            <Link
              key={p.slug}
              data-card
              href={`/blog/${p.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-[1.4rem] border border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--color-accent)]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-black">
                {p.image ? (
                  <Image src={p.image} alt={p.imageAlt} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.08]" />
                ) : (
                  <div className="absolute inset-0" style={{ background: 'radial-gradient(90% 90% at 30% 10%, rgba(254,207,14,0.25), transparent 60%), #121216' }} />
                )}
                <span className="font-display absolute right-3 top-1 text-5xl leading-none text-white/20">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
                  {p.category && <span className="text-[var(--color-accent)]">{p.category}</span>}
                  {p.category && p.date && <span>·</span>}
                  {p.date && <span>{fmtDate(p.date)}</span>}
                </div>
                <h3 className="font-display mt-2 text-2xl uppercase leading-[0.95] text-[var(--color-foreground)]">{p.title}</h3>
                {p.excerpt && (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-body)' }}>
                    {p.excerpt}
                  </p>
                )}
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[var(--color-foreground)]" style={{ fontFamily: 'var(--font-brand)' }}>
                  Read
                  <ArrowIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
