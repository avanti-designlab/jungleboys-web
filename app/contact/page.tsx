import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Metadata } from 'next'
import ContactConsole from '@/components/contact/contact-console'
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

      {/* character banner — same treatment/size as the media page. Lit "stage":
          spotlight cone, warm glow, embers, vignette; the JB hunter stands in it. */}
      <section data-contact-banner className="px-2 pt-2 md:px-3">
        <div
          data-nav-theme="dark"
          className="media-hero-in relative flex items-end justify-center overflow-hidden rounded-[1.75rem] bg-[#0b0b0d] px-6 pb-6 pt-24 md:min-h-[460px] md:rounded-[2.5rem] md:pt-24"
        >
          {/* spotlight cone */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-1/3 left-1/2 h-[150%] w-[70%] -translate-x-1/2"
            style={{
              background:
                'conic-gradient(from 180deg at 50% 0%, transparent 158deg, rgba(254,207,14,0.16) 174deg, rgba(255,238,190,0.22) 180deg, rgba(254,207,14,0.16) 186deg, transparent 202deg)',
            }}
          />
          {/* warm floor glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-[-30%] left-1/2 h-[95%] w-[92%] -translate-x-1/2 rounded-[100%] opacity-70 blur-3xl"
            style={{ background: 'radial-gradient(ellipse at center, rgba(254,207,14,0.30), rgba(254,207,14,0.06) 55%, transparent 72%)' }}
          />
          {/* drifting embers */}
          {[
            { l: '15%', b: '24%', s: 6, d: '0s' },
            { l: '27%', b: '48%', s: 4, d: '1.1s' },
            { l: '71%', b: '30%', s: 7, d: '0.5s' },
            { l: '83%', b: '54%', s: 4, d: '1.7s' },
            { l: '61%', b: '66%', s: 5, d: '2.3s' },
            { l: '39%', b: '72%', s: 3, d: '0.9s' },
          ].map((e, i) => (
            <span
              key={i}
              aria-hidden
              className="rw-float pointer-events-none absolute rounded-full"
              style={{
                left: e.l,
                bottom: e.b,
                width: e.s,
                height: e.s,
                animationDelay: e.d,
                background: 'rgba(254,207,14,0.9)',
                boxShadow: '0 0 10px 2px rgba(254,207,14,0.7)',
              }}
            />
          ))}
          {/* vignette */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 82% 92% at 50% 60%, transparent 44%, rgba(0,0,0,0.55) 100%)' }}
          />
          {/* JB hunter mascot */}
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
          <img
            src="/contact/contact-character.svg"
            alt="Jungle Boys"
            className="rw-breathe relative w-[min(58vw,300px)] drop-shadow-[0_28px_70px_rgba(0,0,0,0.7)]"
          />
        </div>
      </section>

      <div className="pt-12 md:pt-16">
        <ContactConsole consentText={consentText} />
      </div>
    </main>
  )
}
