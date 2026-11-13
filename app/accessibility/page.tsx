import type { Metadata } from 'next'
import { SITE_ORIGIN } from '@/lib/storyblok/seo'
import { jsonLdHtml, breadcrumbSchema } from '@/lib/schema'
import A11yOpenButton from '@/components/a11y/a11y-open-button'

// Accessibility statement (2026-11-12). A real conformance statement with a
// working feedback channel is itself legal protection: many ADA/Unruh suits
// begin because a blocked user had no one to contact. Keep the claims here
// honest and current; counsel reads this page.

export const metadata: Metadata = {
  title: 'Accessibility',
  description:
    'How the Jungle Boys website supports assistive technology, the standard we build to, and how to reach us if something is in your way.',
  alternates: { canonical: `${SITE_ORIGIN}/accessibility` },
}

const SECTIONS: { h: string; body: React.ReactNode }[] = [
  {
    h: 'Our commitment',
    body: (
      <>
        Jungle Boys wants every visitor to be able to browse strains, shop menus, and place
        orders, including visitors who use screen readers, keyboard navigation, magnification,
        or reduced motion. Accessibility is part of how this site is built and tested, not an
        add-on.
      </>
    ),
  },
  {
    h: 'The standard we build to',
    body: (
      <>
        We build to the Web Content Accessibility Guidelines (WCAG) 2.1, Level AA, the standard
        courts and the U.S. Department of Justice reference for website accessibility. Every
        template is scanned with automated tooling (axe-core) and the core shopping flows are
        tested by hand with keyboard-only navigation and screen readers.
      </>
    ),
  },
  {
    h: 'What that looks like here',
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>Every interactive control is reachable and operable by keyboard, with a visible focus indicator.</li>
        <li>Dialogs (the age gate, the location picker, the bag) trap focus correctly and close with the Escape key.</li>
        <li>Images, icons, and buttons carry text alternatives for screen readers.</li>
        <li>Text colors are checked against WCAG contrast thresholds in both light and dark themes.</li>
        <li>Animations respect your system&apos;s Reduce Motion setting automatically.</li>
        <li>An accessibility preferences panel (below) lets you enlarge text, turn off motion, and strengthen contrast on any page.</li>
      </ul>
    ),
  },
  {
    h: 'Known limitations',
    body: (
      <>
        Checkout is completed on our ordering partner Dutchie&apos;s hosted checkout pages, which
        we do not control; we have asked Dutchie for their accessibility conformance information
        and monitor that experience. Some decorative brand artwork uses stylized lettering that
        is reinforced with outlines for readability; the same information is always available as
        regular text. If you find anything else in your way, please tell us.
      </>
    ),
  },
  {
    h: 'Feedback and help',
    body: (
      <>
        If any part of this site is hard to use with assistive technology, or you need help
        placing an order, email{' '}
        <a href="mailto:seo@jungleboys.com" className="font-bold text-[var(--color-accent-ink)] underline-offset-4 hover:underline">
          seo@jungleboys.com
        </a>{' '}
        or use the{' '}
        <a href="/contact" className="font-bold text-[var(--color-accent-ink)] underline-offset-4 hover:underline">
          contact form
        </a>
        . Tell us the page and what happened; we read every report and barriers are prioritized
        for fixing.
      </>
    ),
  },
]

export default function AccessibilityPage() {
  return (
    <main className="bg-[var(--color-background)] pb-24 pt-28 text-[var(--color-foreground)] md:pt-36">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Accessibility', path: '/accessibility' },
            ])
          ),
        }}
      />
      <div className="mx-auto max-w-3xl px-6">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
          Accessibility
        </p>
        <h1 className="font-display mt-3 text-5xl uppercase leading-[0.9] md:text-7xl">
          Built for everyone
        </h1>
        <p className="mt-6 text-base leading-relaxed text-[var(--color-muted)]">
          Last reviewed November 12, 2026.
        </p>

        <div className="mt-10 space-y-10">
          {SECTIONS.map((s) => (
            <section key={s.h}>
              <h2 className="font-display text-3xl uppercase leading-none md:text-4xl">{s.h}</h2>
              <div className="mt-3 text-[15px] leading-relaxed text-[var(--color-foreground)]/85">{s.body}</div>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:p-8">
          <h2 className="font-display text-3xl uppercase leading-none md:text-4xl">Your preferences</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-foreground)]/85">
            Larger text, reduced motion, and higher contrast, applied site-wide and remembered on
            this device.
          </p>
          <A11yOpenButton />
        </div>
      </div>
    </main>
  )
}
