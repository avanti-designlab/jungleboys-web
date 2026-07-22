import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Metadata } from 'next'
import LegalDoc from '@/components/legal/legal-doc'
import { jsonLdHtml, breadcrumbSchema } from '@/lib/schema'

// Privacy Policy — ported verbatim from the live Webflow /privacy (content/legal/privacy.md).
// NOTE: the live copy describes the old e-commerce flow (shopping cart, billing, order
// fulfilment). On the rebuild, Dutchie owns payments/orders and we store only leads —
// so this needs a reality pass + counsel review before cutover (07 §7).

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Jungle Boys collects, uses, and protects your personal information.',
}

export default async function PrivacyPage() {
  const markdown = await readFile(path.join(process.cwd(), 'content/legal/privacy.md'), 'utf-8')

  return (
    <main className="bg-[var(--color-background)] pb-24 pt-28 text-[var(--color-foreground)] md:pt-36">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Privacy Policy', path: '/privacy' },
            ])
          ),
        }}
      />
      <div className="mx-auto max-w-3xl px-6">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
          Legal
        </p>
        <h1 className="font-display mt-3 text-5xl uppercase leading-[0.9] text-[var(--color-foreground)] md:text-7xl">
          Privacy Policy
        </h1>
        <div className="mt-10">
          <LegalDoc markdown={markdown} />
        </div>
      </div>
    </main>
  )
}
