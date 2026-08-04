'use client'

import { type ReactNode, useRef, useState } from 'react'

// One-line brand shelf (Avanti, 2026-08-04): each brand section shows a
// single scrollable ROW of its products with arrow controls, plus a
// "View all products" pill that expands the row into the full grid in place.
// The cards are server-rendered children — this wrapper only changes how
// they flow, so every product stays in the crawlable HTML either way.

export default function BrandShelf({
  children,
  count,
}: {
  children: ReactNode
  count: number
}) {
  const row = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)

  const nudge = (dir: 1 | -1) => {
    const el = row.current
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <div>
      {!expanded && count > 4 && (
        <div className="flex justify-end gap-2">
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              aria-label={dir === 1 ? 'Scroll to more products' : 'Scroll back'}
              onClick={() => nudge(dir)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-current/20 transition-colors duration-200 hover:bg-[var(--color-accent)] hover:text-black"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className={`h-4 w-4 ${dir === -1 ? 'rotate-180' : ''}`} aria-hidden>
                <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      )}

      <div
        ref={row}
        className={
          expanded
            ? 'mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'
            : 'mt-4 grid snap-x auto-cols-[minmax(230px,260px)] grid-flow-col gap-4 overflow-x-auto pb-2 [&>*]:snap-start'
        }
      >
        {children}
      </div>

      {count > 4 && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((e) => !e)}
          // gold, not black: sections rotate tints and the JB section is
          // near-black — a black pill vanished there; gold reads on all of them
          className="font-display mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-3 text-[15px] uppercase leading-none tracking-[0.06em] text-black transition-transform duration-200 hover:-translate-y-0.5"
        >
          {expanded ? 'Show less' : `View all ${count} products`}
        </button>
      )}
    </div>
  )
}
