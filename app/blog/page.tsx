import type { Metadata } from 'next'
import { getBlogPosts } from '@/lib/blog'
import { pageMetadata } from '@/lib/storyblok/seo'
import { breadcrumbSchema } from '@/lib/schema'
import BlogMarquee from '@/components/blog/blog-marquee'
import BlogIndexList from '@/components/blog/blog-index'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('blog', {
    title: 'Blog — Jungle Boys',
    description: 'Stories, drops, and culture straight from the jungle. Playing With Fire® since 2006.',
  })
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

      {/* scrolling editorial marquee */}
      <div className="mt-6 md:mt-8">
        <BlogMarquee />
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-12 md:pt-16">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
          The Journal
        </p>
        <h1 className="font-display mt-3 text-5xl uppercase leading-[0.9] text-[var(--color-foreground)] md:text-7xl">
          Stories From the Jungle
        </h1>

        <BlogIndexList posts={posts} />
      </div>
    </main>
  )
}
