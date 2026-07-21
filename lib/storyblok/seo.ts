import type { Metadata } from 'next'
import { getStory, assetUrl } from '@/lib/storyblok'

// Per-page SEO, editable in Storyblok via the page story's `seo` block, over
// code defaults. Slug convention = page path without the leading slash
// ('home' for /, 'contact' for /contact). With no Storyblok override the result
// is IDENTICAL to the hardcoded defaults — so nothing changes until it's edited.

type SeoDefaults = { title: string; description: string }

export async function pageMetadata(slug: string, defaults: SeoDefaults): Promise<Metadata> {
  const story = await getStory(slug, 'published')
  const seoField = (story?.content as { seo?: unknown } | undefined)?.seo
  const seo = Array.isArray(seoField) ? (seoField[0] as Record<string, unknown> | undefined) : undefined

  const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined)

  const meta: Metadata = {
    title: str(seo?.title) ?? defaults.title,
    description: str(seo?.description) ?? defaults.description,
  }

  const ogTitle = str(seo?.og_title)
  const ogDescription = str(seo?.og_description)
  const ogImage = assetUrl(seo?.og_image) || undefined
  if (ogTitle || ogDescription || ogImage) {
    meta.openGraph = {
      ...(ogTitle ? { title: ogTitle } : {}),
      ...(ogDescription ? { description: ogDescription } : {}),
      ...(ogImage ? { images: [ogImage] } : {}),
    }
  }

  const canonical = str(seo?.canonical)
  if (canonical) meta.alternates = { canonical }
  if (seo?.noindex === true) meta.robots = { index: false, follow: false }

  return meta
}
