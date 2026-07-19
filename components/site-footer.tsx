import Link from 'next/link'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import NewsletterForm from './newsletter-form'
import { FOOTER_LINKS, LICENSE_NUMBERS, NAV_LINKS, SOCIALS, BRAND } from '@/lib/site-config'

// Server component — reads the verbatim legal text at build/render time.
export default async function SiteFooter() {
  const legalDir = path.join(process.cwd(), 'content/legal')
  const [consentText, warningText] = await Promise.all([
    readFile(path.join(legalDir, 'tcpa-consent.txt'), 'utf-8'),
    readFile(path.join(legalDir, 'cannabis-warning.txt'), 'utf-8'),
  ])

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto w-full max-w-7xl px-6 py-16 flex flex-col gap-12">
        {/* newsletter */}
        <div className="flex flex-col gap-4 max-w-2xl">
          <h2
            className="text-4xl uppercase"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Join the jungle
          </h2>
          <p className="text-sm text-[var(--color-muted)]">
            Drops, deals, and news — straight from the source.
          </p>
          <NewsletterForm consentText={consentText.trim()} />
        </div>

        {/* links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-widest text-[var(--color-muted)]">Explore</p>
            {NAV_LINKS.slice(0, 4).map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-[var(--color-accent)]">
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-widest text-[var(--color-muted)]">More</p>
            {NAV_LINKS.slice(4).map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-[var(--color-accent)]">
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-widest text-[var(--color-muted)]">Social</p>
            {SOCIALS.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--color-accent)]"
              >
                {s.label}
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-widest text-[var(--color-muted)]">Legal</p>
            {FOOTER_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-[var(--color-accent)]">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* compliance */}
        <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-8 text-[11px] leading-relaxed text-[var(--color-muted)]">
          <p>{warningText.trim()}</p>
          <p>License numbers: {LICENSE_NUMBERS.join(', ')}</p>
          <p>
            © {new Date().getFullYear()} {BRAND.name}. {BRAND.tagline} · {BRAND.since}
          </p>
        </div>
      </div>
    </footer>
  )
}
