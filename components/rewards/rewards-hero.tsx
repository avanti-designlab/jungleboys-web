import Image from 'next/image'
import { BRAND_ASSETS } from '@/lib/site-config'
import StoreBadges from './store-badges'
import { SplitHeading } from './motion'

// App-download section: 2-line headline, oversized phone, script-logo
// watermark fully contained (never cut off). Theme-aware.

export default function RewardsHero() {
  return (
    <section className="relative overflow-hidden px-6 py-16 md:px-12 md:py-24 lg:px-20">
      <img
        src={BRAND_ASSETS.logoWhite}
        alt=""
        aria-hidden
        className="rw-watermark pointer-events-none absolute right-[2%] top-1/2 w-[46%] max-w-[700px] -translate-y-1/2 opacity-[0.05]"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <SplitHeading
            as="h2"
            mode="words"
            className="text-[clamp(1.9rem,3.4vw,3.4rem)] font-extrabold uppercase leading-[1.12] tracking-tight text-[var(--color-foreground)]"
            lines={[
              { text: 'Download the Jungle Boys App.', block: true, nowrap: true },
              { text: 'Unlock PWF Rewards.', accent: true, block: true, nowrap: true },
            ]}
          />
          <p
            className="mt-6 max-w-md text-sm uppercase leading-relaxed tracking-wide text-[var(--color-muted)] md:text-base"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Playing With Fire has its perks. Earn points, unlock exclusive
            drops, and get rewarded every time you shop.
          </p>
          <StoreBadges className="mt-8" />
          <p
            className="mt-4 text-[11px] uppercase tracking-widest text-[var(--color-muted)]"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Get 100 bonus points just for downloading.
          </p>
        </div>
        <div className="relative mx-auto w-full max-w-[520px] lg:max-w-[640px]">
          <Image
            src="/rewards/phone-hero.png"
            alt="The Jungle Boys app on a phone"
            width={833}
            height={833}
            priority
            sizes="(max-width: 1024px) 520px, 640px"
            className="w-full"
          />
        </div>
      </div>
    </section>
  )
}
