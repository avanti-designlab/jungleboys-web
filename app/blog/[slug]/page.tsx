import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { renderRichText } from '@storyblok/react/rsc'
import { getBlogPost, getBlogPosts } from '@/lib/blog'
import { assetUrl } from '@/lib/storyblok'
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
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

function readingTime(html: string) {
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post) notFound()

  // Storyblok posts carry richtext; the temporary sample posts carry HTML strings.
  const html = typeof post.body === 'string' ? post.body : post.body ? renderRichText(post.body as never) : ''
  const mins = readingTime(html)

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

      {/* ── Title section — centered editorial header ────────────────────── */}
      <div className="mx-auto max-w-3xl px-6">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-brand)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-3.5 w-3.5" aria-hidden><path d="M19 12H5M11 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          All posts
        </Link>
      </div>

      <header className="mx-auto mt-8 max-w-3xl px-6 text-center">
        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
          {post.category && (
            <span className="rounded-full bg-[var(--color-accent)] px-3 py-1 text-black">{post.category}</span>
          )}
          {post.date && <span>{fmtDate(post.date)}</span>}
          <span aria-hidden className="text-[var(--color-border)]">|</span>
          <span>{mins} min read</span>
        </div>
        <AnimatedHeading text={post.title} className="text-center" />
        {post.excerpt && (
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-body)' }}>{post.excerpt}</p>
        )}
      </header>

      {/* hero image — wider than the text column for impact */}
      {post.image && (
        <div className="mx-auto mt-10 max-w-5xl px-4 md:px-6">
          <ParallaxImage src={post.image} alt={post.imageAlt} />
        </div>
      )}

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <article className="mx-auto max-w-3xl px-6">
        <div className="blog-prose mt-12" style={{ fontFamily: 'var(--font-body)' }} dangerouslySetInnerHTML={{ __html: html }} />

        <div className="mt-14 flex items-center justify-between border-t border-[var(--color-border)] pt-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-foreground)] transition-colors hover:text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-brand)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-3.5 w-3.5" aria-hidden><path d="M19 12H5M11 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Back to all stories
          </Link>
          <span className="font-display text-sm uppercase tracking-wide text-[var(--color-muted)]">Playing With Fire®</span>
        </div>
      </article>

      {/* ── Keep reading — black "pill" band (forced dark so cards flip) ──── */}
      {related.length > 0 && (
        <section className="mt-16 px-2 md:mt-24 md:px-3">
          <div
            data-theme="dark"
            data-nav-theme="dark"
            className="overflow-hidden rounded-[1.75rem] bg-[#0b0b0d] px-6 py-14 text-[var(--color-foreground)] md:rounded-[2.75rem] md:px-12 md:py-20"
          >
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-4xl uppercase leading-[0.9] md:text-6xl">Keep Reading</h2>
              <Link href="/blog" className="hidden shrink-0 items-center gap-1.5 pb-1 text-xs font-bold uppercase tracking-widest text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)] sm:inline-flex" style={{ fontFamily: 'var(--font-brand)' }}>
                All posts
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-3.5 w-3.5" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group flex flex-col overflow-hidden rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--color-accent)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-black">
                    {p.image ? (
                      <Image src={p.image} alt={p.imageAlt} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.08]" />
                    ) : (
                      <div className="absolute inset-0" style={{ background: 'radial-gradient(90% 90% at 30% 10%, rgba(254,207,14,0.25), transparent 60%), #121216' }} />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
                      {p.category && <span className="text-[var(--color-accent)]">{p.category}</span>}
                      {p.category && p.date && <span>·</span>}
                      {p.date && <span>{fmtDate(p.date)}</span>}
                    </div>
                    <h3 className="font-display mt-2 text-xl uppercase leading-[0.95] text-[var(--color-foreground)]">{p.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* scrolling text — closes out the page */}
      <div className="mt-16 md:mt-24">
        <BlogMarquee />
      </div>
    </main>
  )
}
