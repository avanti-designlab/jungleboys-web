import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/storyblok/seo'
import { jsonLdHtml, breadcrumbSchema } from '@/lib/schema'
import Reveal from '@/components/reveal'
import CareersForm from '@/components/careers/careers-form'

// /careers (Avanti, 2026-09-25: "lets build this, add to footer section, not
// main menu. like the questionnaire form for phenos and wholesale… upload
// resume option, and basic info. really design forward"). Black brand
// surface, two yellow pitch pills, the white application wizard. Closes the
// brief-audit /careers fork; linked from the FOOTER only.

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('careers', {
    title: 'Careers | Join the Jungle',
    description:
      'Work at Jungle Boys. Budtending, cultivation, processing, delivery, security, creative and corporate roles across Downtown LA, Pomona, Orange County and San Diego. Apply in two minutes.',
  })
}

function PitchPill({ num, tag, heading, children }: { num: string; tag: string; heading: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[2.25rem] bg-[var(--color-accent)] p-8 text-black shadow-[0_40px_120px_-50px_rgba(254,207,14,0.6)] md:p-10">
      <div className="flex items-baseline justify-between">
        <span className="font-display text-5xl leading-none opacity-30">{num}</span>
        <span className="text-[11px] font-extrabold uppercase tracking-[0.3em]" style={{ fontFamily: 'var(--font-brand)' }}>
          {tag}
        </span>
      </div>
      <h2 className="font-display mt-5 text-4xl uppercase leading-[0.9] md:text-5xl">{heading}</h2>
      <p className="mt-4 text-sm font-medium leading-relaxed md:text-[15px]" style={{ fontFamily: 'var(--font-brand)' }}>
        {children}
      </p>
    </div>
  )
}

export default function CareersPage() {
  return (
    <main data-nav-theme="dark" className="relative bg-[#0b0b0b] pb-20 text-white">
      <style>{`body{background:#0b0b0b} footer{padding:0} footer>div{border-radius:0;background:#0b0b0b}`}</style>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Careers', path: '/careers' },
            ])
          ),
        }}
      />

      {/* hero */}
      <header className="relative overflow-hidden px-6 pb-16 pt-28 text-center md:pb-20 md:pt-36">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(70%_100%_at_50%_0%,rgba(254,207,14,0.18),transparent_70%)]"
        />
        <Reveal slide>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.42em] text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-brand)' }}>
            Careers at Jungle Boys
          </p>
          <h1 className="font-display mt-4 uppercase leading-[0.84]" style={{ fontSize: 'min(15vw, 9rem)' }}>
            Join the jungle
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/70 md:text-base" style={{ fontFamily: 'var(--font-brand)' }}>
            Twenty years of playing with fire, grown by people who love this plant. Two minutes to
            apply, straight to the team that hires.
          </p>
        </Reveal>
      </header>

      <div className="px-4 md:px-8 lg:px-12">
        <div className="mx-auto max-w-[1280px]">
          {/* pitch pills */}
          <div className="grid gap-5 md:grid-cols-2 md:gap-6">
            <Reveal>
              <PitchPill num="01" tag="Grown Different" heading="Work where the fire gets made">
                From the cultivation rooms to the counter, every role here touches the plant or the
                people who love it. No corporate costume, no script. Bring the real you and a work
                ethic that matches the flower.
              </PitchPill>
            </Reveal>
            <Reveal delay={0.08}>
              <PitchPill num="02" tag="Room to Grow" heading="Start anywhere, grow everywhere">
                Budtenders become managers. Trimmers become cultivators. The people running our
                rooms started on the floor. Show up hungry and the jungle makes room for you, at
                four stores across California.
              </PitchPill>
            </Reveal>
          </div>

          {/* application wizard */}
          <div className="mt-6 md:mt-8">
            <CareersForm />
          </div>
        </div>
      </div>
    </main>
  )
}
