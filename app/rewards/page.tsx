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
// here). Theme-aware: light by default, dark via the site toggle. Brand
// stages (intro, how-it-works banner, Connoisseur Club) stay dark by design.

export const metadata: Metadata = {
  title: 'PWF Rewards — Jungle Boys Loyalty Program',
  description:
    'Playing With Fire Rewards: earn points on every Jungle Boys purchase, climb tiers from Trimmer to Pheno Hunter, and unlock exclusive drops, discounts and perks. Download the app to start earning.',
}

export default function RewardsPage() {
  return (
    <main className="bg-[var(--color-background)] pb-10 text-[var(--color-foreground)]">
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
