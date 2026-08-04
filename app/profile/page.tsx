import type { Metadata } from 'next'
import Link from 'next/link'
import Reveal from '@/components/reveal'

// /profile — the account home, as a SIGNED-OUT styled shell (URL inventory:
// keep). Orders and account details render once Dutchie accounts are wired;
// until then the page says what lives here and routes to /login. noindex +
// robots disallow (unlinked utility route).

export const metadata: Metadata = {
  title: 'Your Account',
  description: 'Your Jungle Boys account — orders, details and rewards.',
  robots: { index: false, follow: false },
}

export default function ProfilePage() {
  return (
    <main data-nav-theme="dark" className="bg-[var(--color-background)] px-2 pb-24 pt-2 text-[var(--color-foreground)] md:px-3">
      <Reveal slide>
      <div className="relative overflow-hidden rounded-[1.75rem] bg-[#0b0b0b] px-6 pb-16 pt-24 text-white md:rounded-[2.5rem] md:pb-20 md:pt-32">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(70%_100%_at_50%_0%,rgba(254,207,14,0.16),transparent_70%)]"
        />
        <div className="relative mx-auto max-w-xl text-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- brand SVG */}
          <img src="/brand/jb-stacked-white.svg" alt="" aria-hidden className="mx-auto h-14 w-[4.5rem] object-contain" />
          <h1 className="font-display mt-4 uppercase leading-[0.85]" style={{ fontSize: 'min(12vw, 5.5rem)' }}>
            Your account
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/70" style={{ fontFamily: 'var(--font-brand)' }}>
            Orders, account details and PWF Rewards live here once you&rsquo;re signed in.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3" style={{ fontFamily: 'var(--font-brand)' }}>
            <Link
              href="/login"
              className="inline-flex w-full max-w-sm items-center justify-center rounded-full bg-[var(--color-accent)] px-8 py-4 text-sm font-extrabold uppercase tracking-widest text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
            >
              Sign in
            </Link>
            <Link
              href="/profile-reward"
              className="inline-flex w-full max-w-sm items-center justify-center rounded-full border border-white/25 px-8 py-4 text-sm font-extrabold uppercase tracking-widest text-white transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              Your PWF Rewards
            </Link>
          </div>
        </div>
      </div>
      </Reveal>
    </main>
  )
}
