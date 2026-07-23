import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/storyblok/seo'
import MediaHub from '@/components/media/media-hub'
import MediaLottie from '@/components/media/media-lottie'
import MediaScrollFx from '@/components/media/media-scroll-fx'
import { getMediaVideos } from '@/lib/media'
import { JB_CHANNEL_URL } from '@/lib/media/youtube'
import { jsonLdHtml, breadcrumbSchema, videoSchema } from '@/lib/schema'

// Media = video hub (Avanti, 2026-07-19). Documentaries + drops auto-pulled
// from youtube.com/@JungleBoysfilms (ISR, hourly) and merged with any curated
// Storyblok `media_video` entries. Preserved /media URL. Theme-aware.

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('media', {
    title: 'Media — Jungle Boys Films & Documentaries',
    description:
      'Watch Jungle Boys documentaries, pheno-hunt series, and drops — two decades of the hunt, straight from the jungle. New episodes from @JungleBoysfilms.',
  })
}

// Revalidate hourly at the route level too (belt + suspenders with the fetch).
export const revalidate = 3600

export default async function MediaPage() {
  const videos = await getMediaVideos()

  return (
    <main className="bg-[var(--color-background)] pb-16 text-[var(--color-foreground)]">
      {videos.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdHtml([
              breadcrumbSchema([
                { name: 'Home', path: '/' },
                { name: 'Media', path: '/media' },
              ]),
              ...videos.slice(0, 12).map((v) =>
                videoSchema({
                  title: v.title,
                  description: v.description,
                  thumbnailUrl: v.thumbnail,
                  uploadDate: v.publishedAt,
                  embedUrl: v.embedUrl,
                  contentUrl: v.watchUrl,
                })
              ),
            ]),
          }}
        />
      )}

      <h1 className="sr-only">Media — Jungle Boys Films</h1>

      {/* full-width character banner — same treatment as /contact: graffiti mural,
          a giant MEDIA wordmark that drops in letter-by-letter behind the character
          (below the header), and the character bleeding out top + bottom with a
          subtle sway. Dark in both themes. */}
      <section data-media-banner className="px-2 pt-2 md:px-3">
        <div
          data-nav-theme="dark"
          className="media-hero-in relative flex h-[400px] items-end justify-center overflow-hidden rounded-[1.75rem] bg-[#0b0b0d] px-6 md:h-[540px] md:rounded-[2.5rem]"
        >
          {/* graffiti mural background */}
          {/* eslint-disable-next-line @next/next/no-img-element -- bg art */}
          <img
            src="/contact/contact-bg.jpg"
            alt=""
            aria-hidden
            data-media-bg
            className="absolute inset-0 h-full w-full scale-110 object-cover object-center will-change-transform"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 90% 100% at 50% 60%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0.72) 100%)' }}
          />
          {/* giant MEDIA wordmark — drops in letter-by-letter, below the header */}
          <span
            aria-hidden
            className="font-display pointer-events-none absolute left-1/2 top-[86px] z-0 -translate-x-1/2 whitespace-nowrap uppercase leading-none text-white/90 md:top-[104px]"
            style={{ fontSize: 'min(37vw, 900px)' }}
          >
            {'MEDIA'.split('').map((ch, i) => (
              <span key={i} className="contact-letter" style={{ animationDelay: `${0.2 + i * 0.075}s` }}>
                {ch}
              </span>
            ))}
          </span>
          {/* character — designer's Lottie (embedded assets), static SVG until
              ready and for reduced motion */}
          <MediaLottie
            src="/media/jb-media-banner.lottie.json"
            fallback="/media/media-header.svg"
            alt="Jungle Boys Media"
            className="hero-alive relative z-10 drop-shadow-[0_30px_70px_rgba(0,0,0,0.7)]"
          />
        </div>
      </section>

      {/* headline row: big header left, subtext right */}
      <section className="px-4 pt-10 md:px-8 lg:px-12">
        <div data-media-headline className="mx-auto grid max-w-[1500px] items-center gap-4 md:grid-cols-[1.15fr_1fr] md:gap-10">
          <h2 className="media-reveal font-display text-5xl uppercase leading-[0.9] text-[var(--color-foreground)] md:text-7xl">
            The Culture Runs Deep
          </h2>
          <p
            className="media-reveal text-sm uppercase leading-relaxed tracking-wide text-[var(--color-muted)] md:text-base"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Documentaries, drops, and the hunt — straight from the jungle. New
            episodes land here automatically from{' '}
            <a
              href={JB_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent-ink)] underline underline-offset-2"
            >
              @JungleBoysfilms
            </a>
            .
          </p>
        </div>
      </section>

      <MediaHub videos={videos} />
      <MediaScrollFx />
    </main>
  )
}
