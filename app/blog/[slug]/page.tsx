import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { renderRichText } from '@storyblok/react/rsc'
import { getBlogPost, getBlogPosts } from '@/lib/blog'
import { assetUrl } from '@/lib/storyblok'
import { breadcrumbSchema } from '@/lib/schema'
import ReadingProgress from '@/components/blog/reading-progress'
import { AnimatedHeading, ParallaxImage } from '@/components/blog/post-hero'
import BlogMarquee from '@/components/blog/blog-marquee'

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

  // Storyblok posts carry richtext; the temporary sample posts carry HTML strings.
  const html = typeof post.body === 'string' ? post.body : post.body ? renderRichText(post.body as never) : ''

  const related = (await getBlogPosts()).filter((p) => p.slug !== slug).slice(0, 3)

  return (
    <main className="bg-[var(--color-background)] pb-24 pt-28 text-[var(--color-foreground)] md:pt-32">
      <ReadingProgress />
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
        <AnimatedHeading text={post.title} />
        {post.excerpt && (
          <p className="mt-5 text-lg leading-relaxed text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-body)' }}>{post.excerpt}</p>
        )}

        {post.image && <ParallaxImage src={post.image} alt={post.imageAlt} />}

        <div className="blog-prose mt-10" style={{ fontFamily: 'var(--font-body)' }} dangerouslySetInnerHTML={{ __html: html }} />

        <div className="mt-14 flex items-center justify-between border-t border-[var(--color-border)] pt-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-foreground)] transition-colors hover:text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-brand)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-3.5 w-3.5" aria-hidden><path d="M19 12H5M11 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Back to all stories
          </Link>
          <span className="font-display text-sm uppercase tracking-wide text-[var(--color-muted)]">Playing With Fire®</span>
        </div>
      </article>

      {/* keep reading */}
      {related.length > 0 && (
        <section className="mt-20 md:mt-28">
          <BlogMarquee />
          <div className="mx-auto max-w-6xl px-6 pt-14 md:pt-20">
            <h2 className="font-display text-4xl uppercase leading-[0.9] text-[var(--color-foreground)] md:text-6xl">Keep Reading</h2>
            <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group flex flex-col overflow-hidden rounded-[1.4rem] border border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--color-accent)] hover:shadow-[0_40px_90px_-50px_rgba(0,0,0,0.6)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[var(--color-background)]">
                    {p.image ? (
                      <Image src={p.image} alt={p.imageAlt} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.08]" />
                    ) : (
                      <div className="absolute inset-0" style={{ background: 'radial-gradient(90% 90% at 30% 10%, rgba(254,207,14,0.25), transparent 60%), #121216' }} />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
                      {p.category && <span className="text-[var(--color-accent)]">{p.category}</span>}
                      {p.category && p.date && <span>·</span>}
                      {p.date && <span>{fmtDate(p.date)}</span>}
                    </div>
                    <h3 className="font-display mt-2 text-2xl uppercase leading-[0.95] text-[var(--color-foreground)]">{p.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
