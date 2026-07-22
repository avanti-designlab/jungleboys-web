import { getStory, getStories, assetUrl } from '@/lib/storyblok'

// Blog content from Storyblok. Posts live under a `blog/` folder (full_slug
// `blog/<slug>`, content type `blog_post`). Fallback-safe: with no space/posts
// the index shows an empty state and post pages 404 — nothing hardcoded.

export type BlogSummary = {
  slug: string
  title: string
  excerpt: string
  image: string
  imageAlt: string
  date: string // ISO or ''
  category: string
}

export type BlogPost = BlogSummary & {
  body: unknown // Storyblok richtext doc
  seo?: Record<string, unknown>
}

type SB = { slug: string; full_slug: string; content: Record<string, unknown> }

function summarize(story: SB): BlogSummary {
  const c = story.content ?? {}
  const img = c.hero_image as { filename?: string; alt?: string } | undefined
  return {
    slug: story.full_slug.replace(/^blog\//, ''),
    title: (c.title as string) || story.slug,
    excerpt: (c.excerpt as string) || '',
    image: assetUrl(img),
    imageAlt: (img?.alt as string) || (c.title as string) || 'Jungle Boys',
    date: (c.published_date as string) || '',
    category: (c.category as string) || '',
  }
}

export async function getBlogPosts(): Promise<BlogSummary[]> {
  const stories = (await getStories(
    'content_type=blog_post&sort_by=content.published_date:desc&per_page=100'
  )) as SB[]
  return stories.map(summarize)
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const story = (await getStory(`blog/${slug}`, 'published')) as SB | null
  if (!story?.content || story.content.component !== 'blog_post') return null
  const seoField = story.content.seo
  return {
    ...summarize(story),
    body: story.content.body,
    seo: Array.isArray(seoField) ? (seoField[0] as Record<string, unknown>) : undefined,
  }
}
