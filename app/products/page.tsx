import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/storyblok/seo'
import ProductsCollection from '@/components/products/products-collection'
import { PRODUCT_LINES } from '@/lib/products'
import { jsonLdHtml, breadcrumbSchema } from '@/lib/schema'

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
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Jungle Boys Products',
    itemListElement: PRODUCT_LINES.map((l, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: l.name,
      url: `https://jungleboys-web.vercel.app/products/${l.slug}`,
    })),
  }

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
