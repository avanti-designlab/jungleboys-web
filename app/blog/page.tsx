import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getBlogPosts } from '@/lib/blog'
import { pageMetadata } from '@/lib/storyblok/seo'
import { breadcrumbSchema } from '@/lib/schema'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('blog', {
    title: 'Blog — Jungle Boys',
    description: 'Stories, drops, and culture straight from the jungle. Playing With Fire® since 2006.',
  })
}

function fmtDate(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default async function BlogIndex() {
  const posts = await getBlogPosts()

  return (
    <main className="bg-[var(--color-background)] pb-24 text-[var(--color-foreground)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
          ])),
        }}
      />

      {/* character banner — same treatment as /contact + /media: graffiti mural,
          a giant BLOG wordmark that drops in letter-by-letter behind the
          character, and the character bleeding out top + bottom. Dark both themes. */}
      <section data-blog-banner className="px-2 pt-2 md:px-3">
        <div
          data-nav-theme="dark"
          className="media-hero-in relative flex min-h-[400px] items-center justify-center overflow-hidden rounded-[1.75rem] bg-[#0b0b0d] px-6 md:h-[520px] md:rounded-[2.5rem]"
        >
          {/* graffiti mural background */}
          {/* eslint-disable-next-line @next/next/no-img-element -- bg art */}
          <img
            src="/contact/contact-bg.jpg"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-110 object-cover object-center will-change-transform"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 90% 100% at 50% 60%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0.72) 100%)' }}
          />
          {/* giant BLOG wordmark — drops in letter-by-letter, below the header */}
          <span
            aria-hidden
            className="font-display pointer-events-none absolute left-1/2 top-[86px] z-0 -translate-x-1/2 whitespace-nowrap uppercase leading-none text-white/90 md:top-[104px]"
            style={{ fontSize: 'min(37vw, 900px)' }}
          >
            {'BLOG'.split('').map((ch, i) => (
              <span key={i} className="contact-letter" style={{ animationDelay: `${0.2 + i * 0.075}s` }}>
                {ch}
              </span>
            ))}
          </span>
          {/* character */}
          {/* eslint-disable-next-line @next/next/no-img-element -- character art */}
          <img
            src="/blog/blog-header.svg"
            alt="Jungle Boys Blog"
            className="contact-alive relative z-10 h-[118%] w-auto max-w-none drop-shadow-[0_30px_70px_rgba(0,0,0,0.7)]"
          />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 pt-12 md:pt-16">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
          The Journal
        </p>
        <h1 className="font-display mt-3 text-5xl uppercase leading-[0.9] text-[var(--color-foreground)] md:text-7xl">
          Stories From the Jungle
        </h1>

        {posts.length === 0 ? (
          <div className="mt-16 rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
            <p className="font-display text-3xl uppercase text-[var(--color-foreground)]">Coming soon</p>
            <p className="mt-3 text-sm text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-body)' }}>
              New stories from the jungle are on the way.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-8 md:mt-16 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group flex flex-col overflow-hidden rounded-[1.4rem] border border-[var(--color-border)] bg-[var(--color-surface)] transition-shadow duration-300 hover:shadow-[0_40px_90px_-50px_rgba(0,0,0,0.6)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[var(--color-background)]">
                  {p.image ? (
                    <Image src={p.image} alt={p.imageAlt} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
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
                  <h2 className="font-display mt-2 text-2xl uppercase leading-[0.95] text-[var(--color-foreground)]">{p.title}</h2>
                  {p.excerpt && (
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-body)' }}>
                      {p.excerpt}
                    </p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[var(--color-foreground)]" style={{ fontFamily: 'var(--font-brand)' }}>
                    Read
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden>
                      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
