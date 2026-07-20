import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Metadata } from 'next'
import ContactConsole from '@/components/contact/contact-console'
import LocationsMap from '@/components/contact/locations-map'
import { breadcrumbSchema } from '@/lib/schema'

// Contact — "GET IN TOUCH" (preserves the live /contact URL + copy intent).
// Media-style character banner up top, then a dark "console": a colored topic
// pill grid + modern form posting to the lead pipeline (consent ledger + forward).

export const metadata: Metadata = {
  title: 'Contact — Get in Touch',
  description:
    'Questions, collabs, wholesale, press or feedback? Get in touch with Jungle Boys — pick a lane and send a message. Playing With Fire® since 2006.',
}

const SITE_URL = 'https://www.jungleboys.com'

export default async function ContactPage() {
  const consentText = (
    await readFile(path.join(process.cwd(), 'content/legal/tcpa-consent.txt'), 'utf-8')
  ).trim()

  return (
    <main className="bg-[var(--color-background)] pb-16 text-[var(--color-foreground)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Contact', path: '/contact' },
            ]),
            {
              '@context': 'https://schema.org',
              '@type': 'ContactPage',
              name: 'Contact Jungle Boys',
              url: `${SITE_URL}/contact`,
            },
          ]),
        }}
      />

      {/* character banner — matches the live design: JB hunter with a phone +
          CONTACT plate on the graffiti mural. Media-style rounded banner, size
          + load zoom to match. */}
      <section data-contact-banner className="px-2 pt-2 md:px-3">
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
            data-contact-bg
            className="absolute inset-0 h-full w-full scale-110 object-cover object-center will-change-transform"
          />
          {/* darken + edge vignette for character separation */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 90% 100% at 50% 60%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0.72) 100%)' }}
          />
          {/* giant CONTACT wordmark — drops in letter-by-letter with the page,
              centered + full-width behind the character; sits below the header */}
          <span
            aria-hidden
            className="font-display pointer-events-none absolute left-1/2 top-[86px] z-0 -translate-x-1/2 whitespace-nowrap uppercase leading-none text-white/90 md:top-[104px]"
            style={{ fontSize: 'min(37vw, 900px)' }}
          >
            {'CONTACT'.split('').map((ch, i) => (
              <span key={i} className="contact-letter" style={{ animationDelay: `${0.2 + i * 0.075}s` }}>
                {ch}
              </span>
            ))}
          </span>
          {/* character + CONTACT plate (art already includes the plate) */}
          {/* eslint-disable-next-line @next/next/no-img-element -- character art */}
          <img
            src="/contact/contact-header.svg"
            alt="Contact Jungle Boys"
            className="contact-alive relative z-10 h-[118%] w-auto max-w-none drop-shadow-[0_30px_70px_rgba(0,0,0,0.7)]"
          />
        </div>
      </section>

      <div className="pt-12 md:pt-16">
        <ContactConsole consentText={consentText} />
      </div>

      <LocationsMap />
    </main>
  )
}
