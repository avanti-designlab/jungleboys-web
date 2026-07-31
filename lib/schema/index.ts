// ─── JSON-LD SCHEMA SYSTEM (03 §7) ───────────────────────────────────────────
// Programmatic structured data from live data — the SEO + AEO backbone.
// Every generator returns a plain object; render with <JsonLd data={...} />.
// Owned by the SEO/Schema agent. Add generators here, never inline in pages.

import type { Product } from '@/lib/dutchie'
import { SOCIALS } from '@/lib/site-config'

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
    // DERIVED, never retyped. The hand-written list here had @jungleboys for
    // YouTube and X — the real accounts are @JungleBoysfilms and
    // @jungleboysdrops — plus a TikTok that does not exist. sameAs is how
    // Google reconciles the site with the brand's other profiles, so a wrong
    // handle in it actively works against the entity match. Sourcing it from
    // the footer's own list means it cannot drift again.
    sameAs: SOCIALS.map((s) => s.href),
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

/**
 * Store node for an OWNED dispensary. One implementation — /locations calls
 * this instead of hand-rolling, so a fix cannot land in only one of two places.
 *
 * Typed against `OwnedStore`, which is what /locations actually renders. The
 * previous generator was typed against the Dutchie `Location` shape that
 * nothing in this repo supplies, which is why it looked complete while being
 * unusable.
 *
 * Emits the full set that reconciles a Store node with its Google Business
 * Profile: parsed PostalAddress, geo, telephone and openingHoursSpecification.
 * The structured address/hours come from STRUCTURED in lib/owned-stores.ts —
 * data, not a runtime parse of the display strings.
 *
 * `url` is still deliberately absent: every /menu/* target is Phase 3 and 404s
 * today, and advertising them here is the same mistake as advertising them in
 * the sitemap. Restore it when the menus exist.
 */
export function storeSchema(s: {
  name: string; phone: string; state: string
  street: string; city: string; zip: string
  lat: number; lng: number
  hoursSpec: Array<{ days: string[]; opens: string; closes: string }>
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: s.name.startsWith('Jungle Boys') ? s.name : `Jungle Boys ${s.name}`,
    telephone: s.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: s.street,
      addressLocality: s.city,
      addressRegion: s.state,
      postalCode: s.zip,
      addressCountry: 'US',
    },
    geo: { '@type': 'GeoCoordinates', latitude: s.lat, longitude: s.lng },
    openingHoursSpecification: s.hoursSpec.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
  }
}

// The PREVIOUS storeSchema() was deleted 2026-07-30. It was dead — /locations hand-rolls its
// own Store nodes — and it still carried the exact `url` bug that was fixed
// inline there, so the next person to "do it properly" would have reintroduced
// it. It was also typed against the Dutchie `Location` shape, which nothing
// supplies: /locations renders `OwnedStore`, whose hours are a display string
// ('8:30AM - 8:30PM Mon-Sat'), so its openingHoursSpecification could never
// have populated. Rebuilding it needs a DATA change first — structured hours
// and a parsed address on OwnedStore in lib/owned-stores.ts — not a schema one.

// NOT WIRED. Unlike the two generators above this is not a duplicate — no page
// emits Product structured data yet, so there is nothing for it to drift from.
// It is Phase 3 scaffolding against the frozen Dutchie contract; the commerce
// agent wires it when the shop templates land. Do not treat its existence as
// evidence that product schema is shipping.
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

// articleSchema() DELETED (2026-07-30). Dead, and strictly WORSE than the
// inline BlogPosting in app/blog/[slug]/page.tsx, which carries `author` and
// `mainEntityOfPage` that this one lacked. Adopting it would have been a
// downgrade dressed up as consolidation.

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

export function itemListSchema(name: string, items: Array<string | { name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: items.map((item, i) => {
      const path = typeof item === 'string' ? item : item.path
      return {
        '@type': 'ListItem',
        position: i + 1,
        ...(typeof item === 'string' ? {} : { name: item.name }),
        // ALWAYS SITE_URL — a hand-rolled list here once hardcoded the preview
        // domain, so one page emitted two different origins in a single script
        url: `${SITE_URL}${path}`,
      }
    }),
  }
}
