import type { Metadata } from 'next'
import Link from 'next/link'
import Reveal from '@/components/reveal'

// /profile-reward — the logged-in PWF Rewards dashboard, as a SIGNED-OUT
// styled shell (URL inventory: keep — Designer-confirmed feature set:
// points, collectibles campaign, referrals). Real balances render only once
// Dutchie accounts are wired; until then each tile shows its signed-out
// state honestly and the page routes to /login. noindex + robots disallow
// (unlinked utility route).

export const metadata: Metadata = {
  title: 'Your Rewards',
  description: 'Your PWF Rewards — points, collectibles and referrals.',
  robots: { index: false, follow: false },
}

const TILES = [
  {
    title: 'Points',
    body: 'Your PWF balance and what it unlocks. Points land with every checkout.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l2.5 2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Collectibles',
    body: 'Campaign drops you have collected — and the ones still out there.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden>
        <path d="M12 3l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8L6.6 19.6l1-6L3.3 9.4l6-.9L12 3Z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Referrals',
    body: 'Bring a friend into the jungle — you both earn when they shop.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.5 19a5.5 5.5 0 0 1 11 0M16.5 11.5a3 3 0 1 0-2-5.2M15 19h5.5a4.6 4.6 0 0 0-3-4.2" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function ProfileRewardPage() {
  return (
    <main data-nav-theme="dark" className="bg-[var(--color-background)] px-2 pb-24 pt-2 text-[var(--color-foreground)] md:px-3">
      <Reveal slide>
      <div className="relative overflow-hidden rounded-[1.75rem] bg-[#0b0b0b] px-6 pb-16 pt-24 text-white md:rounded-[2.5rem] md:pb-20 md:pt-32">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(70%_100%_at_50%_0%,rgba(254,207,14,0.16),transparent_70%)]"
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-brand)' }}>
            PWF Rewards
          </p>
          <h1 className="font-display mt-3 uppercase leading-[0.85]" style={{ fontSize: 'min(12vw, 6rem)' }}>
            Your rewards
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/70" style={{ fontFamily: 'var(--font-brand)' }}>
            Points, collectibles and referrals — sign in to see where you stand.
          </p>

          <div className="mt-9 grid gap-3 sm:grid-cols-3" style={{ fontFamily: 'var(--font-brand)' }}>
            {TILES.map((t) => (
              <div key={t.title} className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-left">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent)] text-black">
                  {t.icon}
                </span>
                <p className="font-display mt-4 text-2xl uppercase leading-none text-white">{t.title}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-white/65">{t.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-col items-center gap-3">
            <Link
              href="/login"
              className="inline-flex w-full max-w-sm items-center justify-center rounded-full bg-[var(--color-accent)] px-8 py-4 text-sm font-extrabold uppercase tracking-widest text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              Sign in to see your points
            </Link>
            <Link
              href="/rewards"
              className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60 underline-offset-4 transition hover:text-[var(--color-accent)] hover:underline"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              How PWF Rewards works →
            </Link>
          </div>
        </div>
      </div>
      </Reveal>
    </main>
  )
}
