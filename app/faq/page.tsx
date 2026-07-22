import type { Metadata } from 'next'
import { getFaqItems } from '@/lib/faq'
import { pageMetadata } from '@/lib/storyblok/seo'
import { jsonLdHtml, breadcrumbSchema } from '@/lib/schema'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('faq', {
    title: 'FAQ — Jungle Boys',
    description: 'Answers to common questions about Jungle Boys — products, rewards, verification and more.',
  })
}

export default async function FaqPage() {
  const items = await getFaqItems()

  return (
    <main className="bg-[var(--color-background)] pb-24 pt-28 text-[var(--color-foreground)] md:pt-36">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'FAQ', path: '/faq' },
          ])),
        }}
      />
      {items.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdHtml({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: items.map((f) => ({
                '@type': 'Question',
                name: f.question,
                acceptedAnswer: { '@type': 'Answer', text: f.answerText },
              })),
            }),
          }}
        />
      )}

      <div className="mx-auto max-w-3xl px-6">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
          Help
        </p>
        <h1 className="font-display mt-3 text-6xl uppercase leading-[0.9] text-[var(--color-foreground)] md:text-8xl">FAQ</h1>

        {items.length === 0 ? (
          <div className="mt-16 rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
            <p className="font-display text-3xl uppercase text-[var(--color-foreground)]">Coming soon</p>
            <p className="mt-3 text-sm text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-body)' }}>
              We&apos;re putting the answers together.
            </p>
          </div>
        ) : (
          <div className="mt-10 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
            {items.map((f, i) => (
              <details key={i} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span className="font-display text-xl uppercase leading-tight text-[var(--color-foreground)] md:text-2xl">{f.question}</span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-muted)] transition-transform duration-200 group-open:rotate-45">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-4 w-4" aria-hidden><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
                  </span>
                </summary>
                <div className="blog-prose mt-3 text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-body)' }} dangerouslySetInnerHTML={{ __html: f.answerHtml }} />
              </details>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
