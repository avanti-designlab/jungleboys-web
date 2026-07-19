import Link from 'next/link'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import FooterSignup from './footer-signup'
import { SocialIcons } from './social-icons'
import { FOOTER_NAV, LICENSE_NUMBERS } from '@/lib/site-config'

// Live-footer design: signup button + nav row on top, double counter-scrolling
// brand marquee ("PLAYING WITH FIRE®" / "SINCE 2006"), © row with socials,
// license numbers + compliance warning.

const FOOTER_SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/jungleboys', icon: SocialIcons.instagram },
  { label: 'X', href: 'https://x.com/jungleboysdrops', icon: SocialIcons.x },
  { label: 'YouTube', href: 'https://www.youtube.com/@JungleBoysfilms', icon: SocialIcons.youtube },
  { label: 'Facebook', href: 'https://www.facebook.com/JungleBoysDrops/', icon: SocialIcons.facebook },
]

export default async function SiteFooter() {
  const legalDir = path.join(process.cwd(), 'content/legal')
  const [consentText, warningText] = await Promise.all([
    readFile(path.join(legalDir, 'tcpa-consent.txt'), 'utf-8'),
    readFile(path.join(legalDir, 'cannabis-warning.txt'), 'utf-8'),
  ])

  const fire = Array(6).fill('PLAYING WITH FIRE')
  const since = Array(8).fill('SINCE 2006')

  return (
    <footer className="overflow-hidden bg-[#050505] text-white">
      {/* top row: signup + nav */}
      <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-8 px-8 pt-14 lg:flex-row lg:items-center lg:justify-between">
        <FooterSignup consentText={consentText.trim()} />
        <nav>
          <ul
            className="flex flex-wrap gap-x-10 gap-y-3 text-sm font-bold uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            {FOOTER_NAV.map((l) => (
              <li key={l.label}>
                {'external' in l && l.external ? (
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors duration-200 hover:text-[var(--color-accent)]"
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link
                    href={l.href}
                    className="transition-colors duration-200 hover:text-[var(--color-accent)]"
                  >
                    {l.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* double counter-scrolling brand marquee */}
      <div aria-hidden className="flex flex-col gap-2 py-14 select-none">
        <div className="marquee-track flex w-max whitespace-nowrap">
          {[...fire, ...fire].map((t, i) => (
            <span key={i} className="font-display px-6 text-7xl uppercase md:text-9xl">
              {t}
              <span className="relative inline-block align-top top-[0.16em] text-[0.28em] leading-none">®</span>
            </span>
          ))}
        </div>
        <div className="marquee-track-reverse flex w-max whitespace-nowrap">
          {[...since, ...since].map((t, i) => (
            <span key={i} className="font-display px-6 text-7xl uppercase md:text-9xl">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* bottom rows */}
      <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-5 px-8 pb-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div
            className="flex flex-wrap items-center gap-x-8 gap-y-2 text-xs font-bold uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            <span>© {new Date().getFullYear()} Jungle Boys. All rights reserved.</span>
            <Link href="/terms" className="transition-colors duration-200 hover:text-[var(--color-accent)]">
              Terms
            </Link>
            <Link href="/privacy" className="transition-colors duration-200 hover:text-[var(--color-accent)]">
              Privacy
            </Link>
          </div>
          <div className="flex items-center gap-6">
            {FOOTER_SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="transition-transform duration-200 hover:scale-110 hover:text-[var(--color-accent)]"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <p className="text-[11px] tracking-wide text-white/50" style={{ fontFamily: 'var(--font-brand)' }}>
          {LICENSE_NUMBERS.join(' | ')}
        </p>
        <p className="max-w-4xl text-[10px] leading-relaxed text-white/30">{warningText.trim()}</p>
      </div>
    </footer>
  )
}
