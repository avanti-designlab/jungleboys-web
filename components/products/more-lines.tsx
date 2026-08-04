import Link from 'next/link'
import { PRODUCT_LINES, isPlaceholderLine } from '@/lib/products'

// MORE FROM JUNGLE BOYS — the other line pages, at the end of a line page.
//
// The submenu in the overlay solves "get me to a line from anywhere". This
// solves the other half: someone who has just read the Twins page is at the
// moment they are most likely to want another line, and they are at the BOTTOM
// of the page — the furthest possible point from the menu button. Without this
// the journey is scroll all the way back up, open the menu, pick another. So
// the exits go where the intent actually is.
//
// Excludes the page you are on, and excludes Rosin/ORC while they are still the
// generic placeholder (same reasoning as the submenu — see lib/site-config.ts).

export default function MoreLines({ current }: { current: string }) {
  const lines = PRODUCT_LINES.filter(
    (l) => l.slug !== current && !isPlaceholderLine(l.slug)
  )

  return (
    // A floating pill card, not a full-bleed band (Avanti, 2026-08-03: the
    // black strip read as attached to the footer). Same gutter + radius
    // language as the footer card below it, with the page ground showing in
    // the gap so the two read as separate cards.
    <section className="relative z-10 px-2 pb-2 md:px-3 md:pb-3">
      <div className="mx-auto w-full overflow-hidden rounded-[1.75rem] bg-[#0b0b0b] px-6 py-10 md:rounded-[2.5rem] md:px-10 md:py-12">
        <div className="mx-auto w-full max-w-[1240px]">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div>
            <p
              className="text-[10px] font-extrabold uppercase tracking-[0.42em] text-[var(--color-accent)]"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              Keep going
            </p>
            <h2
              className="font-display mt-1.5 uppercase leading-[0.9] text-white"
              style={{ fontSize: 'min(7vw, 1.9rem)', letterSpacing: '-0.02em' }}
            >
              More from <span className="text-[var(--color-accent)]">Jungle Boys</span>
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-white/80 transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            All products
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-3.5 w-3.5" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Wrapping row of content-width pills, not a grid of stretched bars.
            The old grid forced every cell to the column width, which is what
            made six short words occupy two full-bleed rows. */}
        <ul className="mt-5 flex flex-wrap gap-2 md:mt-6 md:gap-2.5">
          {lines.map((l) => (
            <li key={l.slug}>
              <Link
                href={`/products/${l.slug}`}
                className="group inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] py-2 pl-4 pr-3 transition-colors duration-200 hover:border-[var(--color-accent)]/50 hover:bg-white/[0.08] md:py-2.5 md:pl-5 md:pr-3.5"
              >
                <span className="font-display whitespace-nowrap text-[1.05rem] uppercase leading-none text-white md:text-[1.15rem]">
                  {l.name}
                </span>
                <svg
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden
                  className="h-3.5 w-3.5 shrink-0 text-white/45 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--color-accent)]"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
        </div>
      </div>
    </section>
  )
}
