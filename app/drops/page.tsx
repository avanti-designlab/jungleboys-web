import type { Metadata } from 'next'
import Link from 'next/link'
import { CA_OWNED } from '@/lib/owned-stores'
import { FL_SITE_URL } from '@/lib/fl-shop-links'
import StoreForward from '@/components/shop/store-forward'
import Reveal from '@/components/reveal'

// /drops — the GLOBAL drops door (Avanti, 2026-08-04: same treatment as
// /deals). Drops are per-store, so the evergreen URL routes people to THEIR
// store's Friday drop: landing here opens the store picker with a drops
// destination; a saved CA store skips the modal (StoreForward); Florida goes
// to the FL team's site. This server HTML is the crawlable no-JS fallback.
// Replaces the interim /drops → /products redirect.

export const metadata: Metadata = {
  title: 'Fresh Drops',
  description:
    'The weekly Jungle Boys drop — new heat lands every Friday. Pick your store to see this week’s list.',
  alternates: { canonical: '/drops' },
}

export default function DropsDoorPage() {
  return (
    <main data-nav-theme="dark" className="bg-[var(--color-background)] px-2 pb-24 pt-2 text-[var(--color-foreground)] md:px-3">
      <StoreForward surface="drops" />
      <Reveal slide>
      <div className="relative overflow-hidden rounded-[1.75rem] bg-[#0b0b0b] px-6 pb-16 pt-28 text-white md:rounded-[2.5rem] md:pb-20 md:pt-36">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(70%_100%_at_50%_0%,rgba(254,207,14,0.18),transparent_70%)]"
        />
        <div className="relative mx-auto max-w-3xl">
          <div className="text-center">
            <h1 className="font-display uppercase leading-[0.85]" style={{ fontSize: 'min(14vw, 9rem)' }}>
              Fresh Drops
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/70" style={{ fontFamily: 'var(--font-brand)' }}>
              New heat lands every Friday — small batches, gone when they&rsquo;re gone.
              Pick your store to see this week&rsquo;s drop.
            </p>
          </div>

          {/* no-JS / crawler fallback: the same choice the picker offers */}
          <section aria-labelledby="drops-ca" className="mt-10">
            <h2
              id="drops-ca"
              className="px-1 pb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent)]"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              California
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {CA_OWNED.filter((s) => !s.external).map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/menu/california/${s.slug}/drops`}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-[var(--color-accent)] hover:bg-white/[0.08]"
                  >
                    <span>
                      <span className="block text-base font-extrabold uppercase leading-tight text-white" style={{ fontFamily: 'var(--font-brand)' }}>
                        {s.name}
                      </span>
                      <span className="mt-0.5 block text-xs leading-snug text-white/60">
                        {s.city}, {s.state}
                      </span>
                    </span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-4 w-4 shrink-0 text-[var(--color-accent)] transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>
                      <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="drops-fl" className="mt-6">
            <h2
              id="drops-fl"
              className="px-1 pb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent)]"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              Florida
            </h2>
            <a
              href={FL_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-full items-center justify-between gap-4 rounded-2xl bg-[linear-gradient(120deg,#ffe27a_0%,#fecf0e_55%,#e7b30c_100%)] p-5 text-left text-black transition-transform duration-200 hover:-translate-y-0.5"
            >
              <span>
                <span className="font-display block text-2xl uppercase leading-[0.9] md:text-3xl">
                  Shop Jungle Boys Florida
                </span>
                <span className="mt-1 block text-xs font-bold uppercase tracking-[0.14em] text-black/60" style={{ fontFamily: 'var(--font-brand)' }}>
                  jungleboysflorida.com
                </span>
              </span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>
                <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </section>
        </div>
      </div>
      </Reveal>
    </main>
  )
}
