'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CA_OWNED } from '@/lib/owned-stores'
import { readStore } from '@/lib/store-selection'

// Empty-line escape hatch (Avanti, 2026-09-10: "add a button that says shop
// a similar item or category so it's not just empty"). Server HTML and first
// client paint point at the /shop door (works for everyone, opens the store
// picker); after mount, a visitor with a saved CA store gets upgraded to a
// deep link straight into that store's grid with the category pre-applied —
// the ContinueAtStore progressive-enhancement pattern.
export default function ShopSimilarCta({
  category,
  label,
}: {
  /** FIXED_CATEGORIES key, pre-applied via ?category= on the store grid */
  category: string
  /** human category name for the button, e.g. "Pre-Rolls" */
  label: string
}) {
  const [target, setTarget] = useState<{ href: string; store: string } | null>(null)

  useEffect(() => {
    const saved = readStore()
    if (!saved || saved.state !== 'CA') return
    const owned = CA_OWNED.find((s) => s.slug === saved.slug)
    if (!owned) return
    setTarget({
      href: `/menu/california/${saved.slug}?category=${category}#browse`,
      store: owned.name,
    })
  }, [category])

  return (
    <Link
      href={target?.href ?? '/shop'}
      className="inline-flex items-center rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-extrabold uppercase tracking-widest text-black transition hover:opacity-90"
      style={{ fontFamily: 'var(--font-brand)' }}
    >
      Shop {label}
      {target ? ` at ${target.store}` : ''} →
    </Link>
  )
}
