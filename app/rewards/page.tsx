import type { Metadata } from 'next'
import AppShowcase from '@/components/rewards/app-showcase'
import ConnoisseurClub from '@/components/rewards/connoisseur-club'
import EarnMore from '@/components/rewards/earn-more'
import FinePrint from '@/components/rewards/fine-print'
import HowItWorks from '@/components/rewards/how-it-works'
import RewardsFaq from '@/components/rewards/rewards-faq'
import RewardsHero from '@/components/rewards/rewards-hero'
import TierCards from '@/components/rewards/tier-cards'
import ValueProps from '@/components/rewards/value-props'
import WaysToEarn from '@/components/rewards/ways-to-earn'
import { REWARDS_FAQ } from '@/lib/rewards-content'
import { breadcrumbSchema, faqSchema } from '@/lib/schema'

// PWF Rewards landing — /rewards (supersedes /loyalty; /app + /pwf-reward 301
// here). Dark brand surface in both themes, like the footer and menu overlay.

export const metadata: Metadata = {
  title: 'PWF Rewards — Jungle Boys Loyalty Program',
  description:
    'Playing With Fire Rewards: earn points on every Jungle Boys purchase, climb tiers from Trimmer to Pheno Hunter, and unlock exclusive drops, discounts and perks. Download the app to start earning.',
}

export default function RewardsPage() {
  return (
    <main className="bg-[#060606] pb-10 text-white">
      {/* brand surface: page stays dark in both themes, incl. the footer gutter */}
      <style>{`body { background: #060606; }`}</style>
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
