import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/storyblok/seo'
import ProductsCollection from '@/components/products/products-collection'
import { PRODUCT_LINES, isPlaceholderLine } from '@/lib/products'
import { jsonLdHtml, breadcrumbSchema, itemListSchema } from '@/lib/schema'

// Products — the curated Jungle Boys collection (JB-only lines), separate from
// the Dutchie-powered Shop. Static: no API. Each line links to /products/<slug>.

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('products', {
    title: 'Products — The Jungle Boys Collection',
    description:
      'Every Jungle Boys product line in one place — Hash Holes, premium indoor flower, pre-rolls, 10-packs, Twins and Pops. Playing with fire, in every format.',
  })
}

export default function ProductsPage() {
  // via the generator, never hand-rolled — the inline version here hardcoded
  // the preview domain while the breadcrumb beside it used the real one
  // Same exclusion the sitemap applies. Rosin and ORC render the generic
  // placeholder and are noindex, so listing them here contradicted both.
  const itemList = itemListSchema(
    'Jungle Boys Products',
    PRODUCT_LINES.filter((l) => !isPlaceholderLine(l.slug))
      .map((l) => ({ name: l.name, path: `/products/${l.slug}` }))
  )

  return (
    <main className="bg-[var(--color-background)] pb-16 text-[var(--color-foreground)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml([
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Products', path: '/products' },
            ]),
            itemList,
          ]),
        }}
      />
      <ProductsCollection />
    </main>
  )
}
