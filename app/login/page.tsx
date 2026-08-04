import type { Metadata } from 'next'
import Link from 'next/link'
import LoginActions from '@/components/shop/login-actions'
import Reveal from '@/components/reveal'

// /login — the styled AUTH SHELL (locked stack: Dutchie/Dovetail OWNS auth;
// we brand the doorway, never the credentials). Until the Dutchie account
// wiring lands with the live keys, sign-in happens inside the store menu
// flow — this page says so honestly and routes people there, instead of the
// interim /login→/rewards redirect (restored 2026-08-04, as the redirect
// map's note always planned). No credential form renders here before the
// real integration exists — a dead form is worse than none.
//
// Auth/utility route: noindex (URL mandate), and robots.ts already excludes
// /login from the sitemap.

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Jungle Boys account.',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <main data-nav-theme="dark" className="bg-[var(--color-background)] px-2 pb-24 pt-2 text-[var(--color-foreground)] md:px-3">
      <Reveal slide>
      <div className="relative overflow-hidden rounded-[1.75rem] bg-[#0b0b0b] px-6 pb-16 pt-28 text-white md:rounded-[2.5rem] md:pb-20 md:pt-36">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(70%_100%_at_50%_0%,rgba(254,207,14,0.16),transparent_70%)]"
        />
        <div className="relative mx-auto max-w-xl text-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- brand SVG */}
          <img src="/brand/jb-stacked-white.svg" alt="" aria-hidden className="mx-auto h-16 w-20 object-contain" />
          <h1 className="font-display mt-5 uppercase leading-[0.85]" style={{ fontSize: 'min(14vw, 6rem)' }}>
            Sign in
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/70" style={{ fontFamily: 'var(--font-brand)' }}>
            Accounts, orders and PWF Rewards run on our dispensary system. Sign in happens
            during checkout on your store&rsquo;s menu — pick up right where your bag is.
          </p>

          {/* client: saved store → its menu; otherwise the store picker */}
          <div className="mt-8">
            <LoginActions />
          </div>

          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50" style={{ fontFamily: 'var(--font-brand)' }}>
            Earning points?{' '}
            <Link href="/rewards" className="text-[var(--color-accent)] underline-offset-4 hover:underline">
              PWF Rewards →
            </Link>
          </p>
        </div>
      </div>
      </Reveal>
    </main>
  )
}
