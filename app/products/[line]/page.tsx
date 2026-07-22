import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PRODUCT_LINES } from '@/lib/products'
import { jsonLdHtml, breadcrumbSchema } from '@/lib/schema'

// Per-line landing pages. These are the flagship, design-heavy Phase 2 pages
// (3D heroes, scroll-driven) — not built yet. For now a branded placeholder so
// the collection links (and the legacy /hash-hole etc. 301s) resolve instead of
// 404ing. Only known slugs render; anything else is a real 404.

export function generateStaticParams() {
  return PRODUCT_LINES.map((l) => ({ line: l.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ line: string }> }): Promise<Metadata> {
  const { line } = await params
  const item = PRODUCT_LINES.find((l) => l.slug === line)
  if (!item) return { title: 'Products — Jungle Boys' }
  return {
    title: `${item.name} — Jungle Boys`,
    description: item.blurb,
  }
}

export default async function ProductLinePage({ params }: { params: Promise<{ line: string }> }) {
  const { line } = await params
  const item = PRODUCT_LINES.find((l) => l.slug === line)
  if (!item) notFound()

  return (
    <main
      data-nav-theme="dark"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0A0B0D] px-6 py-32 text-center text-white"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Products', path: '/products' },
              { name: item.name, path: `/products/${item.slug}` },
            ])
          ),
        }}
      />
      <span className="text-xs font-bold uppercase tracking-[0.5em] text-white/60" style={{ fontFamily: 'var(--font-brand)' }}>
        {item.tag}
      </span>
      <h1 className="font-display mt-5 text-[clamp(3.5rem,13vw,11rem)] uppercase leading-[0.85] text-white">{item.name}</h1>
      <p className="mt-6 max-w-lg text-sm uppercase leading-relaxed tracking-wide text-white/70 md:text-base" style={{ fontFamily: 'var(--font-brand)' }}>
        {item.blurb}
      </p>
      <span className="mt-8 rounded-full border border-white/20 px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-brand)' }}>
        Full line page — coming soon
      </span>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link href="/products" className="rounded-full border border-white/20 px-7 py-3.5 text-xs font-extrabold uppercase tracking-widest text-white transition hover:border-[var(--color-accent)]" style={{ fontFamily: 'var(--font-brand)' }}>
          ← All products
        </Link>
        <Link href="/locations" className="rounded-full bg-[var(--color-accent)] px-7 py-3.5 text-xs font-extrabold uppercase tracking-widest text-black transition-transform hover:scale-[1.03]" style={{ fontFamily: 'var(--font-brand)' }}>
          Find a store
        </Link>
      </div>
    </main>
  )
}
