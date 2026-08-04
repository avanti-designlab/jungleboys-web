'use client'

import { useEffect, useState } from 'react'
import { BRAND_LOGOS } from '@/lib/brands'

// The Brands page's sticky left rail (Avanti, 2026-08-04): the brand list —
// derived from the store's live menu, the same data the sections render — that
// follows the scroll and highlights the section in view. Enhancement only:
// the links are plain anchors and the SECTIONS are server HTML; with no JS
// this is still a working jump list.

export default function BrandSpyNav({
  items,
}: {
  items: { brand: string; anchor: string; count: number }[]
}) {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.anchor))
      .filter((el): el is HTMLElement => !!el)
    if (!sections.length) return
    const io = new IntersectionObserver(
      (entries) => {
        // the topmost intersecting section wins
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      // band across the upper third of the viewport — a section is "current"
      // while its content occupies where the reader is looking
      { rootMargin: '-15% 0px -60% 0px' }
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [items])

  return (
    <nav
      aria-label="Brands on the menu"
      data-brand-spy
      className="sticky top-24 hidden max-h-[calc(100vh-8rem)] self-start overflow-y-auto rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 lg:block"
    >
      <p
        className="px-1 pb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent-ink)]"
        style={{ fontFamily: 'var(--font-brand)' }}
      >
        Brands
      </p>
      <ul className="space-y-1">
        {items.map((i) => {
          const current = active === i.anchor
          return (
            <li key={i.anchor}>
              <a
                href={`#${i.anchor}`}
                aria-current={current ? 'true' : undefined}
                className={`flex items-center justify-between gap-3 rounded-full py-2.5 pl-4 pr-3 transition-colors duration-200 ${
                  current
                    ? 'bg-[var(--color-accent)] text-black'
                    : 'text-[var(--color-foreground)]/80 hover:bg-[var(--color-background)] hover:text-[var(--color-foreground)]'
                }`}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  {/* logo beside the name when one is wired (BRAND_LOGOS —
                      real logos flow from the Dutchie payload at cutover) */}
                  {BRAND_LOGOS[i.anchor] && (
                    // eslint-disable-next-line @next/next/no-img-element -- brand logo
                    <img src={BRAND_LOGOS[i.anchor]} alt="" className="h-6 w-6 shrink-0 rounded-md bg-white object-contain p-0.5" />
                  )}
                  <span className="font-display truncate text-[17px] uppercase leading-none tracking-[0.03em]">
                    {i.brand}
                  </span>
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
    </nav>
  )
}
