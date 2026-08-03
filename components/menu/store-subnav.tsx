import Link from 'next/link'

// The commerce surfaces of ONE store: menu, deals, brands. All three nest under
// /menu/california/<store> (recorded decision, 2026-07-31 — location-scoped so
// each store ranks on its own local intent), so the tabs are the visible shape
// of that URL decision. Fresh Drops joins this row when it lands.
const TABS = [
  { key: 'menu', label: 'Menu', path: '' },
  { key: 'deals', label: 'Deals', path: '/deals' },
  { key: 'brands', label: 'Brands', path: '/brands' },
] as const

export type StoreTab = (typeof TABS)[number]['key']

export default function StoreSubnav({
  storeSlug,
  active,
}: {
  storeSlug: string
  active: StoreTab
}) {
  return (
    <nav
      aria-label="Store sections"
      className="mt-6 flex flex-wrap gap-2"
      style={{ fontFamily: 'var(--font-brand)' }}
    >
      {TABS.map((t) => {
        const on = t.key === active
        return (
          <Link
            key={t.key}
            href={`/menu/california/${storeSlug}${t.path}`}
            aria-current={on ? 'page' : undefined}
            className={`rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] transition ${
              on
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-on-accent)]'
                : 'border-[var(--color-border)] text-[var(--color-foreground)] hover:border-[var(--color-accent)]'
            }`}
          >
            {t.label}
          </Link>
        )
      })}
    </nav>
  )
}
