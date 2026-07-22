import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/storyblok/seo'
import HuntField from '@/components/phenos/hunt-field'
import PhenosHero from '@/components/phenos/phenos-hero'
import PhenosJoin from '@/components/phenos/phenos-join'
import { breadcrumbSchema } from '@/lib/schema'

// Pheno Hunt — a brand surface (forced dark). No character banner: the
// "PHENO HUNT WITH US!" logo is the hero, with jars floating behind it and
// nugs bursting out. A diagonal HUNT WITH US field textures the whole page
// under a top gradient; scroll into a yellow pill that pitches the hunt and
// launches a question-by-question sign-up form.

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('phenos', {
    title: 'Pheno Hunt — Hunt With Us',
    description:
      'Hunt with us. Small-batch drops of unnamed, unreleased Jungle Boys genetics straight from our cultivation rooms — first look, first taste, and a say in what becomes the next strain. Join the pheno hunt.',
  })
}

export default async function PhenosPage() {
  const consentText = (
    await readFile(path.join(process.cwd(), 'content/legal/tcpa-consent.txt'), 'utf-8')
  ).trim()

  return (
    <main
      data-nav-theme="dark"
      className="relative min-h-screen overflow-hidden bg-[#0A0B0D] text-white"
      style={
        {
          '--color-background': '#0A0B0D',
          '--color-surface': '#111114',
          '--color-foreground': '#ffffff',
          '--color-muted': '#9a9aa0',
          '--color-border': '#231f20',
        } as React.CSSProperties
      }
    >
      {/* brand surface: identical in light + dark. Solid black body + full-bleed
          black footer (no light gutter) regardless of the site theme toggle. */}
      <style>{`
        body { background: #0A0B0D; }
        footer { padding: 0; }
        footer > div { border-radius: 0; background: #0A0B0D; }
      `}</style>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Pheno Hunt', path: '/phenos' },
            ])
          ),
        }}
      />

      <h1 className="sr-only">Pheno Hunt — Hunt With Us</h1>

      {/* full-page diagonal HUNT WITH US texture (no gradient — just the scroll) */}
      <HuntField />

      <div className="relative z-10">
        <PhenosHero />
        <PhenosJoin consentText={consentText} />
      </div>
    </main>
  )
}
