import Link from 'next/link'
import { PRODUCT_LINES } from '@/lib/products'

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

const PLACEHOLDER_LINES = ['rosin', 'orc']

export default function MoreLines({ current }: { current: string }) {
  const lines = PRODUCT_LINES.filter(
    (l) => l.slug !== current && !PLACEHOLDER_LINES.includes(l.slug)
  )

  return (
    <section className="relative z-10 bg-[#0b0b0b] px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p
              className="text-[10px] font-extrabold uppercase tracking-[0.42em] text-[var(--color-accent)] md:text-xs"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              Keep going
            </p>
            <h2
              className="font-display mt-2 uppercase leading-[0.86] text-white"
              style={{ fontSize: 'min(11vw, 4rem)', letterSpacing: '-0.03em' }}
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

        <ul className="mt-8 grid grid-cols-2 gap-2.5 md:mt-10 md:grid-cols-3 md:gap-4">
          {lines.map((l) => (
            <li key={l.slug}>
              <Link
                href={`/products/${l.slug}`}
                className="group flex h-full items-center justify-between gap-3 rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-4 transition-colors duration-200 hover:border-[var(--color-accent)]/50 hover:bg-white/[0.08] md:rounded-full md:px-6 md:py-5"
              >
                <span className="font-display text-[1.35rem] uppercase leading-[0.95] text-white md:text-[1.7rem]">
                  {l.name}
                </span>
                <span
                  aria-hidden
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-200 group-hover:bg-[var(--color-accent)] group-hover:text-black md:h-8 md:w-8"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
