import type { Metadata } from 'next'
import Link from 'next/link'
import LoginForm from '@/components/shop/login-form'
import Reveal from '@/components/reveal'

// /login — the REAL sign-in page (Avanti, 2026-08-04: "this actually needs to
// be a sign in page" — supersedes the CTA-only interim shell). The locked
// boundary still holds: Dutchie owns auth/credentials — this page is the
// branded front door to their account API. Until the live keys land, the
// form's submit transmits NOTHING (see LoginForm) and answers honestly that
// sign-in happens at checkout today. Auth/utility route: noindex, excluded
// from the sitemap.

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Jungle Boys account.',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
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
          <h1 className="font-display mt-4 uppercase leading-[0.85]" style={{ fontSize: 'min(14vw, 5.5rem)' }}>
            Sign in
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/70" style={{ fontFamily: 'var(--font-brand)' }}>
            Accounts, orders and PWF Rewards — all in one place.
          </p>

          <div className="mt-8">
            <LoginForm />
          </div>

          <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50" style={{ fontFamily: 'var(--font-brand)' }}>
            Earning points?{' '}
            <Link href="/rewards" className="text-[var(--color-accent)] underline-offset-4 hover:underline">
              PWF Rewards →
            </Link>
            <span className="mx-2 text-white/25">·</span>
            <Link href="/shop" className="text-[var(--color-accent)] underline-offset-4 hover:underline">
              Browse the shop →
            </Link>
          </p>
        </div>
      </div>
      </Reveal>
    </main>
  )
}
