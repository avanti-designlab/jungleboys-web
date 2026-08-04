import type { Metadata } from 'next'
import AuthStubForm from '@/components/shop/auth-stub-form'
import Reveal from '@/components/reveal'

// /signup — create-account door of the auth suite (URL inventory: keep).
// Same contract as /login: real form UI, nothing transmitted until the
// Dutchie account API is wired. Auth/utility route: noindex, not in sitemap.

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create your Jungle Boys account.',
  robots: { index: false, follow: false },
}

export default function SignupPage() {
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
          <h1 className="font-display mt-4 uppercase leading-[0.85]" style={{ fontSize: 'min(12vw, 5rem)' }}>
            Join the jungle
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/70" style={{ fontFamily: 'var(--font-brand)' }}>
            One account for orders and PWF Rewards, at every store.
          </p>
          <div className="mt-8">
            <AuthStubForm kind="signup" />
          </div>
        </div>
      </div>
      </Reveal>
    </main>
  )
}
