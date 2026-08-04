'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { menuPathFor, readStore } from '@/lib/store-selection'

// The /login shell's actions: with a saved store, the primary CTA goes
// straight into that store's menu (where the Dutchie sign-in lives during
// checkout); without one it opens the site's store picker. Client-only
// because the saved store is localStorage — SSR renders the neutral state.

export default function LoginActions() {
  const [store, setStore] = useState<{ slug: string; state: 'CA' | 'FL' } | null>(null)
  useEffect(() => {
    const s = readStore()
    if (s) setStore({ slug: s.slug, state: s.state })
  }, [])

  return (
    <div className="flex flex-col items-center gap-3" style={{ fontFamily: 'var(--font-brand)' }}>
      {store ? (
        <Link
          href={menuPathFor(store.slug, store.state)}
          className="inline-flex w-full max-w-sm items-center justify-center rounded-full bg-[var(--color-accent)] px-8 py-4 text-sm font-extrabold uppercase tracking-widest text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
        >
          Continue to your store menu
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('jb:pick-store'))}
          className="inline-flex w-full max-w-sm items-center justify-center rounded-full bg-[var(--color-accent)] px-8 py-4 text-sm font-extrabold uppercase tracking-widest text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
        >
          Choose your store to shop
        </button>
      )}
      <Link
        href="/shop"
        className="inline-flex w-full max-w-sm items-center justify-center rounded-full border border-white/25 px-8 py-4 text-sm font-extrabold uppercase tracking-widest text-white transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
      >
        Browse the shop
      </Link>
    </div>
  )
}
