// ─── JSON-LD SCHEMA SYSTEM (03 §7) ───────────────────────────────────────────
// Programmatic structured data from live data — the SEO + AEO backbone.
// Every generator returns a plain object; render with <JsonLd data={...} />.
// Owned by the SEO/Schema agent. Add generators here, never inline in pages.

import type { Location, Product } from '@/lib/dutchie'

const SITE_URL = 'https://www.jungleboys.com'
const BRAND = 'Jungle Boys'

// Serialize a schema object for a <script type="application/ld+json"> block.
// JSON.stringify does NOT escape `<`, so a CMS/SEO string containing `</script>`
// could break out of the block; escaping `<` closes that injection path.
export function jsonLdHtml(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      'https://www.instagram.com/jungleboys',
      'https://www.youtube.com/@jungleboys',
      'https://x.com/jungleboys',
      'https://www.tiktok.com/@jungleboys',
    ],
  }
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/products/?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function storeSchema(location: Location) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: location.name,
    url: `${SITE_URL}/menu/${location.state === 'CA' ? 'california' : 'florida'}/${location.slug}`,
    telephone: location.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: location.address,
      addressLocality: location.city,
      addressRegion: location.state,
      postalCode: location.zip,
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: location.lat,
      longitude: location.lng,
    },
    openingHoursSpecification: location.hours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.day,
      opens: h.opens,
      closes: h.closes,
    })),
  }
}

export function productSchema(product: Product) {
  const lowest = Math.min(...product.variants.map((v) => v.specialPrice ?? v.price))
  const available = product.variants.some((v) => (v.quantityAvailable ?? 0) > 0)
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    brand: { '@type': 'Brand', name: product.brand },
    description: product.description,
    image: product.images.map((i) => i.url),
    url: `${SITE_URL}/products/${product.slug}`,
    offers: {
      '@type': 'Offer',
      price: (lowest / 100).toFixed(2),
      priceCurrency: 'USD',
      availability: available
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  }
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}

export function articleSchema(post: {
  title: string
  slug: string
  description?: string
  image?: string
  publishedAt: string
  updatedAt?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.image,
    url: `${SITE_URL}/blog/${post.slug}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    publisher: { '@type': 'Organization', name: BRAND },
  }
}

export function videoSchema(video: {
  title: string
  description?: string
  thumbnailUrl?: string
  uploadDate?: string
  embedUrl?: string // YouTube embed or self-hosted
  contentUrl?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    embedUrl: video.embedUrl,
    contentUrl: video.contentUrl,
    publisher: { '@type': 'Organization', name: BRAND },
  }
}

export function itemListSchema(name: string, urls: string[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: urls.map((url, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}${url}`,
    })),
  }
}
