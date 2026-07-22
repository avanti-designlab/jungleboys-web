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
    <footer className="bg-[var(--color-background)] px-2 pb-2 md:px-3 md:pb-3">
      <div className="overflow-hidden rounded-[1.75rem] bg-[#050505] text-white md:rounded-[2.5rem]">
      {/* top row: signup + nav pills */}
      <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-8 px-6 pt-12 md:px-8 md:pt-14 lg:flex-row lg:items-start lg:justify-between">
        <FooterSignup consentText={consentText.trim()} />
        <nav className="lg:pt-1">
          <ul className="flex flex-wrap gap-2.5">
            {FOOTER_NAV.map((l) => {
              const cls =
                'inline-flex items-center rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-medium uppercase tracking-wide text-white/85 transition-colors duration-200 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-black'
              return (
                <li key={l.label}>
                  {'external' in l && l.external ? (
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className={cls} style={{ fontFamily: 'var(--font-brand)' }}>
                      {l.label}
                    </a>
                  ) : (
                    <Link href={l.href} className={cls} style={{ fontFamily: 'var(--font-brand)' }}>
                      {l.label}
                    </Link>
                  )}
                </li>
              )
            })}
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
      <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-6 px-6 pb-24 md:px-8 lg:pb-10">
        {/* socials */}
        <div className="flex items-center justify-center gap-7 md:justify-start">
          {FOOTER_SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="transition-transform duration-200 hover:scale-110 hover:text-[var(--color-accent)] [&_svg]:h-8 [&_svg]:w-8"
            >
              {s.icon}
            </a>
          ))}
        </div>

        {/* compliance */}
        <div className="flex flex-col gap-3 text-center md:text-left">
          <p className="text-[11px] tracking-wide text-white/50" style={{ fontFamily: 'var(--font-brand)' }}>
            {LICENSE_NUMBERS.join(' | ')}
          </p>
          <p className="mx-auto max-w-4xl text-[10px] leading-relaxed text-white/30 md:mx-0">{warningText.trim()}</p>
        </div>

        {/* very bottom: legal + copyright */}
        <div
          className="mt-2 flex flex-col items-center gap-3 border-t border-white/10 pt-6 text-xs uppercase tracking-wider md:flex-row md:justify-between"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-white/85 transition-colors duration-200 hover:text-[var(--color-accent)]">
              Terms
            </Link>
            <Link href="/privacy" className="text-white/85 transition-colors duration-200 hover:text-[var(--color-accent)]">
              Privacy
            </Link>
          </div>
          <span className="text-white/50">© {new Date().getFullYear()} Jungle Boys. All rights reserved.</span>
        </div>
      </div>
      </div>
    </footer>
  )
}
