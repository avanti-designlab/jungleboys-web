import type { Metadata } from 'next'
import { getBlogPosts, isSamplePost } from '@/lib/blog'
import { pageMetadata } from '@/lib/storyblok/seo'
import { jsonLdHtml, breadcrumbSchema } from '@/lib/schema'
import BlogMarquee from '@/components/blog/blog-marquee'
import BlogIndexList from '@/components/blog/blog-index'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  // While the CMS returns nothing, this page renders the hardcoded sample
  // posts — including "July Deals Are Live" and a described mid-summer drop
  // that never ran. The individual post pages were already noindex for exactly
  // that reason (07 §7: no invented promotions on a cannabis domain), but the
  // INDEX page was not, and it carries the same copy in its cards. /blog is a
  // net-new URL with no legacy traffic, so there is nothing to lose by holding
  // it back until real posts exist. Clears itself when the CMS returns posts.
  const showingSamples = (await getBlogPosts()).some((p) => isSamplePost(p.slug))
  const meta = await pageMetadata('blog', {
    title: 'Blog — Jungle Boys',
    description: 'Stories, drops, and culture straight from the jungle. Playing With Fire® since 2006.',
  })
  // Applied to the RESULT, not passed into pageMetadata: that helper only reads
  // title/description off its defaults and silently drops anything else, so the
  // noindex looked correct in source and never reached the page.
  return showingSamples ? { ...meta, robots: { index: false, follow: false } } : meta
}

export default async function BlogIndex() {
  const posts = await getBlogPosts()

  return (
    <main className="bg-[var(--color-background)] pb-24 text-[var(--color-foreground)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(breadcrumbSchema([
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
          className="media-hero-in relative flex h-[400px] items-end justify-center overflow-hidden rounded-[1.75rem] bg-[var(--color-ink)] px-6 md:h-[540px] md:rounded-[2.5rem]"
        >
          {/* graffiti mural background */}
          {/* eslint-disable-next-line @next/next/no-img-element -- bg art */}
          <img
            src="/contact/contact-bg.webp"
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
            className="font-display pointer-events-none absolute left-1/2 top-[86px] z-0 -translate-x-1/2 whitespace-nowrap text-[65vw] uppercase leading-none text-white/90 md:top-[104px] md:text-[min(37vw,900px)]"
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
            className="hero-alive relative z-10 drop-shadow-[0_30px_70px_rgba(0,0,0,0.7)]"
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
