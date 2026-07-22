import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Metadata } from 'next'
import LegalDoc from '@/components/legal/legal-doc'
import { jsonLdHtml, breadcrumbSchema } from '@/lib/schema'

// Terms of Service — ported verbatim from the live Webflow /terms (content/legal/terms.md).
// Legal copy is preserved word-for-word; counsel reviews before cutover.

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The Terms of Service governing your use of the Jungle Boys website and services.',
}

export default async function TermsPage() {
  const markdown = await readFile(path.join(process.cwd(), 'content/legal/terms.md'), 'utf-8')

  return (
    <main className="bg-[var(--color-background)] pb-24 pt-28 text-[var(--color-foreground)] md:pt-36">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Terms of Service', path: '/terms' },
            ])
          ),
        }}
      />
      <div className="mx-auto max-w-3xl px-6">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
          Legal
        </p>
        <h1 className="font-display mt-3 text-5xl uppercase leading-[0.9] text-[var(--color-foreground)] md:text-7xl">
          Terms of Service
        </h1>
        <div className="mt-10">
          <LegalDoc markdown={markdown} />
        </div>
      </div>
    </main>
  )
}
