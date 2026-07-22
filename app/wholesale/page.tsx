import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/storyblok/seo'
import WholesaleBody from '@/components/wholesale/wholesale-body'
import WholesalePlane from '@/components/wholesale/wholesale-plane'
import { breadcrumbSchema } from '@/lib/schema'

// Wholesale — "Become a Retailer". Same banner treatment as /contact and /media
// (graffiti mural + giant wordmark that drops in + character bleeding out), then
// a JB × Nabis intro and a one-question-at-a-time clickthrough form in a yellow
// pill, ending in a Next Steps → Nabis portal handoff.

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('wholesale', {
    title: 'Wholesale — Carry Jungle Boys',
    description:
      'Carry Jungle Boys products at your dispensary. From exclusive genetics to top-shelf flower, our products move fast and speak for themselves. Become a retailer — order through Nabis.',
  })
}

export default async function WholesalePage() {
  const consentText = (
    await readFile(path.join(process.cwd(), 'content/legal/tcpa-consent.txt'), 'utf-8')
  ).trim()

  return (
    <main className="bg-[var(--color-background)] pb-16 text-[var(--color-foreground)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Wholesale', path: '/wholesale' },
            ])
          ),
        }}
      />

      <h1 className="sr-only">Wholesale — Carry Jungle Boys</h1>

      {/* character banner — same treatment as /contact + /media */}
      <section data-wholesale-banner className="px-2 pt-2 md:px-3">
        <div
          data-nav-theme="dark"
          className="media-hero-in relative flex min-h-[400px] items-center justify-center overflow-hidden rounded-[1.75rem] bg-[#0b0b0d] px-6 md:h-[520px] md:rounded-[2.5rem]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- bg art */}
          <img
            src="/contact/contact-bg.jpg"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-110 object-cover object-center"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 90% 100% at 50% 60%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0.72) 100%)' }}
          />
          {/* giant WHOLESALE wordmark — drops in letter-by-letter, below the header */}
          <span
            aria-hidden
            className="font-display pointer-events-none absolute left-1/2 top-[86px] z-0 -translate-x-1/2 whitespace-nowrap uppercase leading-none text-white/90 md:top-[104px]"
            style={{ fontSize: 'min(28vw, 660px)' }}
          >
            {'WHOLESALE'.split('').map((ch, i) => (
              <span key={i} className="contact-letter" style={{ animationDelay: `${0.18 + i * 0.06}s` }}>
                {ch}
              </span>
            ))}
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element -- character art */}
          <img
            src="/wholesale/wholesale-header.svg"
            alt="Jungle Boys Wholesale"
            className="contact-alive relative z-10 h-[116%] w-auto max-w-none drop-shadow-[0_30px_70px_rgba(0,0,0,0.7)]"
          />
          {/* plane flies across + parachutes drop on load */}
          <WholesalePlane />
        </div>
      </section>

      <WholesaleBody consentText={consentText} />
    </main>
  )
}
