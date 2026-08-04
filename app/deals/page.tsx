import type { Metadata } from 'next'
import Link from 'next/link'
import { CA_OWNED } from '@/lib/owned-stores'
import { FL_SITE_URL } from '@/lib/fl-shop-links'
import DealsForward from '@/components/shop/deals-forward'
import Reveal from '@/components/reveal'

// /deals — the GLOBAL deals door. Deals are per-store (each menu prices its
// own), so an evergreen link (the home hero's AUGUST DEALS slide) needs a
// stable target that routes people to THEIR store's deals. The flow (Avanti,
// 2026-08-04): landing here opens the store picker with a deals destination —
// picking a CA store routes to that store's deals page; a visitor with a
// saved CA store skips the modal (DealsForward fast-forwards); Florida goes
// to the FL team's site. This server HTML is the crawlable no-JS fallback,
// same pattern as the /shop door.

export const metadata: Metadata = {
  title: 'Deals',
  description:
    'Live Jungle Boys deals — pick your store to see every markdown running right now, straight from the menu.',
  alternates: { canonical: '/deals' },
}

export default function DealsDoorPage() {
  return (
    <main data-nav-theme="dark" className="bg-[var(--color-background)] px-2 pb-24 pt-2 text-[var(--color-foreground)] md:px-3">
      <DealsForward />
      <Reveal slide>
      <div className="relative overflow-hidden rounded-[1.75rem] bg-[#0b0b0b] px-6 pb-16 pt-28 text-white md:rounded-[2.5rem] md:pb-20 md:pt-36">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(70%_100%_at_50%_0%,rgba(254,207,14,0.18),transparent_70%)]"
        />
        <div className="relative mx-auto max-w-3xl">
          <div className="text-center">
            <h1 className="font-display uppercase leading-[0.85]" style={{ fontSize: 'min(16vw, 9rem)' }}>
              Deals
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/70" style={{ fontFamily: 'var(--font-brand)' }}>
              Every markdown, straight from the live menu. Deals differ by store —
              pick yours to see what&rsquo;s running right now.
            </p>
          </div>

          {/* no-JS / crawler fallback: the same choice the picker offers */}
          <section aria-labelledby="deals-ca" className="mt-10">
            <h2
              id="deals-ca"
              className="px-1 pb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent)]"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              California
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {CA_OWNED.filter((s) => !s.external).map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/menu/california/${s.slug}/deals`}
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

          <section aria-labelledby="deals-fl" className="mt-6">
            <h2
              id="deals-fl"
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
