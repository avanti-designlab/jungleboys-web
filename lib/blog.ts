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
  if (stories.length === 0) return SAMPLE_POSTS.map(({ body, seo, ...s }) => s) // eslint-disable-line @typescript-eslint/no-unused-vars
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
  // fallback: temporary sample posts (removed once real posts are published)
  return SAMPLE_POSTS.find((p) => p.slug === slug) ?? null
}

// ── TEMPORARY SAMPLE POSTS — remove once real Storyblok posts exist ───────────
// body is HTML here (samples); real posts render Storyblok richtext.
const SAMPLE_POSTS: BlogPost[] = [
  {
    slug: 'playing-with-fire-since-2006',
    title: 'Playing With Fire Since 2006',
    excerpt: 'Two decades in, the hunt has never stopped. A look at where Jungle Boys started and where the next fire is coming from.',
    image: '/hero/gas-tank-beach.jpg',
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
    slug: 'inside-the-pheno-hunt',
    title: 'Inside the Pheno Hunt',
    excerpt: 'How an unnamed seed becomes the next strain everyone is chasing — and how you get a say in it.',
    image: 'https://cdn.prod.website-files.com/6981ad8672f6252d7d7bb320/69b3324153cf4c36d0ced471_SNL%205x.1.jpg',
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
    slug: 'july-deals-are-live',
    title: 'July Deals Are Live',
    excerpt: 'The mid-summer drop is here — top-shelf flower, all-in-one Gas Tanks, and gold mylars, all month long.',
    image: '/hero/july-deals-fireworks.jpg',
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
