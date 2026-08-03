import type { MetadataRoute } from 'next'
import { PRODUCT_LINES, isPlaceholderLine } from '@/lib/products'
import { getPublishedBlogPosts } from '@/lib/blog'
import { getLocations } from '@/lib/dutchie'
import { SITE_ORIGIN } from '@/lib/storyblok/seo'

// Dynamic sitemap. Built from the same PRODUCT_LINES array the routes are
// generated from, so a new line cannot appear on the site without appearing
// here — the failure mode a hand-maintained list always eventually hits.
//
// Only routes that EXIST today are listed. Remaining Phase 3 surfaces (the
// auth suite, /drops, /710-deals) are deliberately absent until they resolve;
// a sitemap that advertises 404s is worse than a short sitemap.
//
// /shop/<slug> PDPs stay OUT for now, deliberately: their slugs come from the
// placeholder provider, and whether real Dutchie slugs match ours is exactly
// the open question recorded in the Phase 3 handoff (FL uses per-SKU slugs;
// ours are per-product). Advertising product URLs that may 404 after the
// GraphQL swap would burn crawl trust on the highest-value page type. Add them
// the moment slugs are verified against a real payload.
//
// Auth and utility routes stay out entirely — they are noindex by mandate.

const STATIC_ROUTES: Array<[path: string, priority: number, freq: MetadataRoute.Sitemap[number]['changeFrequency']]> = [
  ['', 1, 'weekly'],
  ['/products', 0.9, 'weekly'],
  ['/locations', 0.8, 'monthly'],
  ['/find-jb-products', 0.8, 'monthly'],
  ['/rewards', 0.8, 'monthly'],
  ['/media', 0.7, 'weekly'],
  ['/phenos', 0.6, 'monthly'],
  ['/wholesale', 0.6, 'monthly'],
  ['/contact', 0.6, 'monthly'],
  ['/blog', 0.6, 'weekly'],
  ['/faq', 0.5, 'monthly'],
  ['/terms', 0.3, 'yearly'],
  ['/privacy', 0.3, 'yearly'],
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // getPublishedBlogPosts() returns CMS posts only — never the samples — so an
  // empty result is exactly the condition under which /blog renders samples and
  // carries noindex.
  const blogShowsSamples = (await getPublishedBlogPosts()).length === 0

  // NO lastModified on static routes.
  //
  // It used to be `new Date()` at render, so all 20 entries carried one
  // identical timestamp that MOVED on every ISR revalidation — observed
  // shifting 03:20 -> 03:39 on an untouched build. Google discards lastmod it
  // judges unreliable, so a value that changes when the content did not costs
  // the crawl-scheduling signal the field exists to provide. Omitting it is
  // strictly better than lying: Google falls back to its own heuristics.
  // Restore it per-route only when something real backs it (a CMS
  // published_at, a content file mtime).
  const statics = STATIC_ROUTES
    // /blog is noindex while it renders sample posts, and a noindex URL in the
    // sitemap is a Search Console ERROR ("Submitted URL marked noindex"). The
    // earlier fix landed the noindex and missed this half — and my verification
    // counted /blog/<slug> post URLs, which said nothing about the index entry.
    .filter(([path]) => !(path === '/blog' && blogShowsSamples))
    .map(([path, priority, changeFrequency]) => ({
      url: `${SITE_ORIGIN}${path}`,
      changeFrequency,
      priority,
    }))

  // Rosin and ORC render the generic placeholder and are noindex — a sitemap
  // that advertises a soft-404 is the same mistake as one that advertises a 404.
  const lines = PRODUCT_LINES.filter((l) => !isPlaceholderLine(l.slug)).map((line) => ({
    url: `${SITE_ORIGIN}/products/${line.slug}`,
    // no lastModified — see the note above; a render timestamp is not a fact
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Individual posts — real CMS posts ONLY, never the sample fallback. A
  // published post appears here the moment it is live; a Storyblok outage
  // yields an empty list rather than three fabricated articles.
  const posts = (await getPublishedBlogPosts()).map((post) => ({
    url: `${SITE_ORIGIN}/blog/${post.slug}`,
    // Real publish date only. A post without one gets NO lastmod rather than
    // a render timestamp — the whole point is that this field is either true or
    // absent.
    ...(post.date ? { lastModified: new Date(post.date) } : {}),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  // Store commerce surfaces — the nested URLs the legacy /menu/jungle-boys-*
  // inventory 301s to. The legacy menus are the highest-traffic URLs on the
  // whole site (DTLA 21k clicks/yr), so their canonical targets carry menu
  // priority 0.9. Store slugs are OURS (lib/owned-stores), not Dutchie's, so
  // these URLs are stable regardless of what the GraphQL swap changes.
  const stores = (await getLocations()).flatMap((l) => [
    { url: `${SITE_ORIGIN}/menu/california/${l.slug}`, changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${SITE_ORIGIN}/menu/california/${l.slug}/deals`, changeFrequency: 'daily' as const, priority: 0.7 },
    { url: `${SITE_ORIGIN}/menu/california/${l.slug}/drops`, changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${SITE_ORIGIN}/menu/california/${l.slug}/brands`, changeFrequency: 'weekly' as const, priority: 0.6 },
  ])

  return [...statics, ...lines, ...stores, ...posts]
}
