import type { Metadata } from 'next'
import AppShowcase from '@/components/rewards/app-showcase'
import ConnoisseurClub from '@/components/rewards/connoisseur-club'
import EarnMore from '@/components/rewards/earn-more'
import FinePrint from '@/components/rewards/fine-print'
import HowItWorks from '@/components/rewards/how-it-works'
import RewardsFaq from '@/components/rewards/rewards-faq'
import RewardsHero from '@/components/rewards/rewards-hero'
import RewardsIntro from '@/components/rewards/rewards-intro'
import TierCards from '@/components/rewards/tier-cards'
import ValueProps from '@/components/rewards/value-props'
import WaysToEarn from '@/components/rewards/ways-to-earn'
import { REWARDS_FAQ } from '@/lib/rewards-content'
import { breadcrumbSchema, faqSchema } from '@/lib/schema'

// PWF Rewards landing — /rewards (supersedes /loyalty; /app + /pwf-reward 301
// here). DARK IN BOTH THEMES (Avanti: light version was hard to read) — the
// page pins the theme tokens to their dark values so the toggle is a no-op here.

export const metadata: Metadata = {
  title: 'PWF Rewards — Jungle Boys Loyalty Program',
  description:
    'Playing With Fire Rewards: earn points on every Jungle Boys purchase, climb tiers from Trimmer to Pheno Hunter, and unlock exclusive drops, discounts and perks. Download the app to start earning.',
}

export default function RewardsPage() {
  return (
    <main
      data-nav-theme="dark"
      className="bg-[var(--color-background)] pb-10 text-[var(--color-foreground)]"
      style={
        {
          '--color-background': '#040303',
          '--color-surface': '#111111',
          '--color-foreground': '#ffffff',
          '--color-foreground-soft': '#f5f5f5',
          '--color-muted': '#9a9aa0',
          '--color-border': '#231f20',
          '--color-accent-ink': '#fecf0e',
        } as React.CSSProperties
      }
    >
      {/* brand surface: dark page + dark footer gutter regardless of theme.
          Footer loses its inset-card look here — full-bleed black, no seams. */}
      <style>{`
        body { background: #040303; }
        .rw-watermark { filter: none; }
        .rw-badge { background: transparent; }
        footer { padding: 0; }
        footer > div { border-radius: 0; background: #040303; }
      `}</style>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            faqSchema([...REWARDS_FAQ]),
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'PWF Rewards', path: '/rewards' },
            ]),
          ]),
        }}
      />
      <RewardsIntro />
      <RewardsHero />
      <ValueProps />
      <HowItWorks />
      <EarnMore />
      <WaysToEarn />
      <TierCards />
      <ConnoisseurClub />
      <AppShowcase />
      <RewardsFaq />
      <FinePrint />
    </main>
  )
}
