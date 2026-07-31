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
  /**
   * TRUE only on the hardcoded SAMPLE_POSTS below, which are code constants.
   * This is the provenance signal for the raw-HTML render path — it travels on
   * the OBJECT, so it cannot be spoofed by a URL.
   *
   * The slug could. `isSamplePost(slug)` tested the route param, and
   * getBlogPost() queries Storyblok BEFORE falling back, so a CMS story
   * published at `blog/july-deals-are-live` shadowed the sample: the slug check
   * stayed true while the body was the CMS's. That defeated the gate entirely.
   */
  trustedHtml?: true
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
  if (stories.length === 0) return SAMPLE_POSTS.map(({ body, seo, ...s }) => s) // eslint-disable-line @typescript-eslint/no-unused-vars
  return stories.map(summarize)
}

/**
 * Real CMS posts only — NEVER the samples. For the sitemap.
 *
 * `getBlogPosts()` falls back to SAMPLE_POSTS on zero rows, and zero rows is
 * indistinguishable from a Storyblok auth error or outage at build time. Since
 * the sitemap now lists individual posts, that fallback would submit three
 * fabricated articles to Google as canonical content — including promotional
 * copy for a deals period that never ran. Advertising invented promos on a
 * cannabis domain is a compliance problem (07 §7), not just an SEO one.
 *
 * Same principle the sitemap already applies to placeholder product lines:
 * advertising a soft-404 is the same mistake as advertising a 404.
 */
/**
 * True when a slug is one of the hardcoded samples rather than a real CMS post.
 *
 * Keeping the samples out of the sitemap was not enough: they are prerendered,
 * return 200, are self-canonical and are linked from /blog and from every
 * post's Keep Reading block, so Google reaches them by crawl regardless. One of
 * them advertises a deals period that never ran, on a cannabis domain — the
 * same 07 §7 argument that justified the sitemap split, with more force,
 * because this is the page itself rather than a hint about it.
 */
export function isSamplePost(slug: string): boolean {
  return SAMPLE_POSTS.some((p) => p.slug === slug)
}

export async function getPublishedBlogPosts(): Promise<BlogSummary[]> {
  const stories = (await getStories(
    'content_type=blog_post&sort_by=content.published_date:desc&per_page=100'
  )) as SB[]
  return stories.map(summarize)
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const story = (await getStory(`blog/${slug}`, 'published')) as SB | null
  if (story?.content && story.content.component === 'blog_post') {
    const seoField = story.content.seo
    return {
      ...summarize(story),
      body: story.content.body,
      seo: Array.isArray(seoField) ? (seoField[0] as Record<string, unknown>) : undefined,
    }
  }
  // fallback: temporary sample posts (removed once real posts are published).
  // The caller must treat these as NOINDEX — see isSamplePost.
  return SAMPLE_POSTS.find((p) => p.slug === slug) ?? null
}

// ── TEMPORARY SAMPLE POSTS — remove once real Storyblok posts exist ───────────
// body is HTML here (samples); real posts render Storyblok richtext.
const SAMPLE_POSTS: BlogPost[] = [
  {
    trustedHtml: true,
    slug: 'playing-with-fire-since-2006',
    title: 'Playing With Fire Since 2006',
    excerpt: 'Two decades in, the hunt has never stopped. A look at where Jungle Boys started and where the next fire is coming from.',
    image: '/hero/gas-tank-beach.webp',
    imageAlt: 'Jungle Boys Gas Tank vapes in the sand',
    date: '2026-07-18',
    category: 'Culture',
    body:
      "<p>It started in a backyard in LA and turned into a movement. Twenty years later, the standard hasn't moved — it's only gotten higher.</p>" +
      "<h2>The standard</h2>" +
      "<p>Every batch that carries the Jungle Boys name goes through the same question: is this the best version of itself? If the answer is anything but yes, it doesn't leave the room.</p>" +
      "<ul><li>Small-batch, indoor, hand-trimmed</li><li>Genetics hunted and proven in-house</li><li>Nothing rushed to market</li></ul>" +
      "<p>That's the whole game — and it's why we're still here, still <strong>playing with fire</strong>.</p>",
  },
  {
    trustedHtml: true,
    slug: 'inside-the-pheno-hunt',
    title: 'Inside the Pheno Hunt',
    excerpt: 'How an unnamed seed becomes the next strain everyone is chasing — and how you get a say in it.',
    image: '/home/card-snl.webp',
    imageAlt: 'Trichome macro of a Jungle Boys pheno',
    date: '2026-07-10',
    category: 'Genetics',
    body:
      "<p>A pheno hunt is part science, part obsession. We pop hundreds of seeds, watch them grow, and cut the few that show something special.</p>" +
      "<h2>From seed to shelf</h2>" +
      "<p>The survivors get grown out again, tested, and put in front of real people. The ones that earn it get a name. The rest go back to the drawing board.</p>" +
      "<blockquote>The best strains aren't made. They're found.</blockquote>" +
      "<p>Want first look and first taste? That's what the <a href=\"/phenos\">Pheno Hunt</a> is for.</p>",
  },
  {
    trustedHtml: true,
    slug: 'july-deals-are-live',
    title: 'July Deals Are Live',
    excerpt: 'The mid-summer drop is here — top-shelf flower, all-in-one Gas Tanks, and gold mylars, all month long.',
    image: '/hero/july-deals-fireworks.webp',
    imageAlt: 'Fireworks over the downtown LA skyline',
    date: '2026-07-13',
    category: 'Drops',
    body:
      "<p>July is stacked. From the 13th through the 31st we're running deals across the whole lineup — while supplies last.</p>" +
      "<h2>What's in it</h2>" +
      "<ul><li>Premium indoor flower in the gold mylars</li><li>All-In-One Gas Tanks</li><li>Infused pre-rolls and Hash Holes</li></ul>" +
      "<p>Find your nearest store on the <a href=\"/locations\">locations</a> page and come pull up.</p>",
  },
]
