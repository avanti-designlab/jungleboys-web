import type { Metadata } from 'next'
import CallbackForward from '@/components/shop/callback-forward'

// /callback — the auth-return endpoint (URL inventory: keep). When Dutchie
// account sign-in goes live this is where its redirect lands; until then it
// forwards politely to the saved store's menu (or /shop). Never indexed,
// never in the sitemap, stays in robots.txt disallow.

export const metadata: Metadata = {
  title: 'Signing you in…',
  robots: { index: false, follow: false },
}

export default function CallbackPage() {
  return (
    <main data-nav-theme="dark" className="flex min-h-[60vh] items-center justify-center bg-[var(--color-background)] px-6 text-center text-[var(--color-foreground)]">
      <CallbackForward />
      <div>
        <h1 className="font-display text-4xl uppercase leading-none md:text-5xl">Signing you in…</h1>
        <p className="mt-3 text-sm text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
          One second — taking you back to the shop.
        </p>
      </div>
    </main>
  )
}
