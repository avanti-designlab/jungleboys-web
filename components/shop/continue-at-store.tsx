'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CA_OWNED } from '@/lib/owned-stores'
import { menuPathFor, readStore } from '@/lib/store-selection'

// Progressive enhancement on /shop: a visitor who already chose a store gets a
// one-tap "continue" straight into it. The LINK renders only after mount — the
// saved store lives in localStorage, so server HTML and first client paint must
// agree (the PDP buy box hydration lesson, applied in the other direction).
//
// CA only for now: a saved FL store points at /menu/florida/* shells that have
// not landed yet, and a continue button into a 404 is worse than no button.
export default function ContinueAtStore() {
  const [store, setStore] = useState<{ name: string; href: string } | null>(null)

  useEffect(() => {
    const saved = readStore()
    if (!saved || saved.state !== 'CA') return
    const owned = CA_OWNED.find((s) => s.slug === saved.slug)
    if (!owned) return
    setStore({ name: owned.name, href: menuPathFor(saved.slug, saved.state) })
  }, [])

  // The slot ALWAYS renders. It is display:none unless the pre-paint boot
  // script in app/layout.tsx saw a saved CA store (html.jb-has-store), in
  // which case CSS reserves the button's exact height BEFORE first paint and
  // this link fills space that already exists. Returning null and inserting
  // the block after mount shifted the store list 88px (CLS 0.089).
  return (
    <p className="shop-continue-slot" style={{ fontFamily: 'var(--font-brand)' }}>
      {store && (
        <Link
          href={store.href}
          className="inline-flex items-center rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-extrabold uppercase tracking-widest text-[var(--color-on-accent)] transition hover:opacity-90"
        >
          Continue at {store.name} →
        </Link>
      )}
    </p>
  )
}
