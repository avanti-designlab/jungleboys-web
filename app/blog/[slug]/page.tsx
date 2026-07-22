import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { renderRichText } from '@storyblok/react/rsc'
import { getBlogPost, getBlogPosts } from '@/lib/blog'
import { assetUrl } from '@/lib/storyblok'
import { breadcrumbSchema } from '@/lib/schema'

export const revalidate = 60

export async function generateStaticParams() {
  const posts = await getBlogPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

const SITE = 'https://jungleboys-web.vercel.app'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post) return {}
  const seo = post.seo
  const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined)
  const title = str(seo?.title) ?? post.title
  const description = str(seo?.description) ?? post.excerpt
  const image = assetUrl(seo?.og_image) || post.image || undefined
  return {
    title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: { title, description, type: 'article', ...(image ? { images: [image] } : {}) },
  }
}

function fmtDate(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post) notFound()

  const html = post.body ? renderRichText(post.body as never) : ''

  return (
    <main className="bg-[var(--color-background)] pb-24 pt-28 text-[var(--color-foreground)] md:pt-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt || undefined,
            image: post.image ? [post.image] : undefined,
            datePublished: post.date || undefined,
            author: { '@type': 'Organization', name: 'Jungle Boys' },
            publisher: { '@type': 'Organization', name: 'Jungle Boys' },
            mainEntityOfPage: `${SITE}/blog/${slug}`,
          }),
        }}
      />
      <article className="mx-auto max-w-3xl px-6">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-brand)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-3.5 w-3.5" aria-hidden><path d="M19 12H5M11 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          All posts
        </Link>

        <div className="mt-6 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
          {post.category && <span className="text-[var(--color-accent)]">{post.category}</span>}
          {post.category && post.date && <span>·</span>}
          {post.date && <span>{fmtDate(post.date)}</span>}
        </div>
        <h1 className="font-display mt-3 text-5xl uppercase leading-[0.92] text-[var(--color-foreground)] md:text-7xl">{post.title}</h1>
        {post.excerpt && (
          <p className="mt-5 text-lg leading-relaxed text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-body)' }}>{post.excerpt}</p>
        )}

        {post.image && (
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-[1.5rem]">
            <Image src={post.image} alt={post.imageAlt} fill sizes="(max-width:768px) 100vw, 768px" className="object-cover" priority />
          </div>
        )}

        <div className="blog-prose mt-10" style={{ fontFamily: 'var(--font-body)' }} dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </main>
  )
}
