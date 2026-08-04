'use client'

import { type ReactNode, useEffect, useState } from 'react'

// The Deals page's interactive shell (Avanti, 2026-08-04): a SPLIT SELECTOR —
// Jungle Boys Deals vs Outsource Deals, the two groups set up in the Dutchie
// backend — over a sticky rail + the deal sections themselves.
//
// The SECTIONS are server-rendered and arrive here as props; default state
// shows BOTH groups, so the crawlable HTML always carries every deal. The
// split panels FILTER (click a side to focus it, click again for all) and the
// rail follows the scroll with an IO scrollspy. Everything here is
// enhancement over plain anchors and visible-by-default content.

export interface DealRailItem {
  slug: string
  name: string
  count: number
  group: 'jungle-boys' | 'outsource'
}

type GroupFilter = 'all' | 'jungle-boys' | 'outsource'

export default function DealsExperience({
  jb,
  outsource,
  jbCount,
  outsourceCount,
  rail,
}: {
  jb: ReactNode
  outsource: ReactNode
  jbCount: number
  outsourceCount: number
  rail: DealRailItem[]
}) {
  const [group, setGroup] = useState<GroupFilter>('all')
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const sections = rail
      .map((i) => document.getElementById(`deal-${i.slug}`))
      .filter((el): el is HTMLElement => !!el)
    if (!sections.length) return
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id.replace(/^deal-/, ''))
      },
      { rootMargin: '-15% 0px -60% 0px' }
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [rail, group])

  const pick = (g: 'jungle-boys' | 'outsource') => setGroup((cur) => (cur === g ? 'all' : g))
  const visibleRail = rail.filter((i) => group === 'all' || i.group === group)

  return (
    <>
      {/* ── the split: two doors into the deal list ── */}
      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => pick('jungle-boys')}
          aria-pressed={group === 'jungle-boys'}
          data-deals-door="jungle-boys"
          className={`group relative overflow-hidden rounded-[2rem] bg-[linear-gradient(120deg,#ffe27a_0%,#fecf0e_55%,#e7b30c_100%)] p-7 text-left text-black transition-all duration-300 md:p-9 ${
            group === 'outsource' ? 'opacity-50 saturate-50' : ''
          } ${group === 'jungle-boys' ? 'ring-4 ring-black/70' : 'hover:-translate-y-0.5'}`}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-black/60" style={{ fontFamily: 'var(--font-brand)' }}>
            House heat, marked down
          </p>
          <span className="font-display mt-1 block text-4xl uppercase leading-[0.9] md:text-6xl">
            Jungle Boys deals
          </span>
          <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white" style={{ fontFamily: 'var(--font-brand)' }}>
            {jbCount} {jbCount === 1 ? 'deal' : 'deals'} {group === 'jungle-boys' ? '· showing' : '→'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => pick('outsource')}
          aria-pressed={group === 'outsource'}
          data-deals-door="outsource"
          className={`group relative overflow-hidden rounded-[2rem] bg-[#0b0b0b] p-7 text-left text-white transition-all duration-300 md:p-9 ${
            group === 'jungle-boys' ? 'opacity-50 saturate-50' : ''
          } ${group === 'outsource' ? 'ring-4 ring-[var(--color-danger-solid)]' : 'hover:-translate-y-0.5'}`}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(70%_100%_at_50%_0%,color-mix(in_srgb,var(--color-danger-solid)_35%,transparent),transparent_70%)]"
          />
          <p className="relative text-[11px] font-bold uppercase tracking-[0.24em] text-white/60" style={{ fontFamily: 'var(--font-brand)' }}>
            Every other brand on the shelf
          </p>
          <span className="font-display relative mt-1 block text-4xl uppercase leading-[0.9] md:text-6xl">
            Outsource deals
          </span>
          <span className="relative mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-black" style={{ fontFamily: 'var(--font-brand)' }}>
            {outsourceCount} {outsourceCount === 1 ? 'deal' : 'deals'} {group === 'outsource' ? '· showing' : '→'}
          </span>
        </button>
      </div>

      {group !== 'all' && (
        <button
          type="button"
          onClick={() => setGroup('all')}
          className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-accent-ink)] underline-offset-4 hover:underline"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          ← Show all deals
        </button>
      )}

      {/* ── sticky rail + sections ── */}
      <div className="mt-10 grid gap-8 lg:grid-cols-[240px_1fr]">
        <nav
          aria-label="Deals running now"
          data-deals-rail
          className="sticky top-24 hidden max-h-[calc(100vh-8rem)] self-start overflow-y-auto rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 lg:block"
        >
          {(['jungle-boys', 'outsource'] as const).map((g) =>
            group !== 'all' && group !== g ? null : (
              <div key={g} className="mb-5">
                <p
                  className="px-1 pb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent-ink)]"
                  style={{ fontFamily: 'var(--font-brand)' }}
                >
                  {g === 'jungle-boys' ? 'Jungle Boys' : 'Outsource'}
                </p>
                <ul className="space-y-1">
                  {visibleRail
                    .filter((i) => i.group === g)
                    .map((i) => {
                      const current = active === i.slug
                      return (
                        <li key={i.slug}>
                          <a
                            href={`#deal-${i.slug}`}
                            aria-current={current ? 'true' : undefined}
                            className={`flex items-center justify-between gap-3 rounded-2xl py-2.5 pl-4 pr-3 transition-colors duration-200 ${
                              current
                                ? 'bg-[var(--color-accent)] text-black'
                                : 'text-[var(--color-foreground)]/80 hover:bg-[var(--color-background)] hover:text-[var(--color-foreground)]'
                            }`}
                          >
                            <span className="font-display text-[16px] uppercase leading-[0.95] tracking-[0.03em]">
                              {i.name}
                            </span>
                            <span
                              className={`text-[10px] font-bold ${current ? 'text-black/60' : 'text-[var(--color-muted)]'}`}
                              style={{ fontFamily: 'var(--font-brand)' }}
                            >
                              {i.count}
                            </span>
                          </a>
                        </li>
                      )
                    })}
                </ul>
              </div>
            )
          )}
        </nav>

        <div className="min-w-0">
          <div hidden={group === 'outsource'} className="space-y-8">
            {jb}
          </div>
          <div hidden={group === 'jungle-boys'} className={`space-y-8 ${group === 'all' ? 'mt-8' : ''}`}>
            {outsource}
          </div>
        </div>
      </div>
    </>
  )
}
