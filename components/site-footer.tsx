import Link from 'next/link'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import NewsletterForm from './newsletter-form'
import { FOOTER_LINKS, SOCIALS, BRAND_ASSETS } from '@/lib/site-config'

// Matches the live footer: "Stay up to date in the jungle." + phone-first
// signup, verbatim TCPA consent, socials, minimal © bar. Compliance warning
// text retained per 07 §1.

export default async function SiteFooter() {
  const legalDir = path.join(process.cwd(), 'content/legal')
  const [consentText, warningText] = await Promise.all([
    readFile(path.join(legalDir, 'tcpa-consent.txt'), 'utf-8'),
    readFile(path.join(legalDir, 'cannabis-warning.txt'), 'utf-8'),
  ])

  return (
    <footer className="bg-[#0b0b0b] text-white">
      <div className="mx-auto w-full max-w-[1500px] px-8 py-16 flex flex-col gap-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <div className="flex flex-col gap-6">
            <h2
              className="max-w-xl text-5xl md:text-6xl uppercase leading-[0.95]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Stay up to date in the jungle.
            </h2>
            <NewsletterForm consentText={consentText.trim()} />
          </div>

          <div className="flex flex-col items-start gap-6 lg:items-end">
            <div className="relative h-24 w-36">
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG asset */}
            <img src={BRAND_ASSETS.logoWhite} alt="Jungle Boys" className="h-full w-full object-contain" />
            </div>
            <ul className="flex flex-wrap gap-5 text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-brand)' }}>
              {SOCIALS.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors duration-200 hover:text-[var(--color-accent)]"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
            <ul className="flex flex-wrap gap-5 text-xs uppercase tracking-widest text-white/60" style={{ fontFamily: 'var(--font-brand)' }}>
              {FOOTER_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors duration-200 hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 pt-6 text-[11px] leading-relaxed text-white/40">
          <p>{warningText.trim()}</p>
          <p>© {new Date().getFullYear()} JUNGLE BOYS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
