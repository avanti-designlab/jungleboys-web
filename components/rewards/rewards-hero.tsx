import Image from 'next/image'
import StoreBadges from './store-badges'

// App-download hero: headline left, phone mockup right over a faint glowing
// script-logo backdrop (baked into the phone art's glow).

export default function RewardsHero() {
  return (
    <section className="relative overflow-hidden px-6 pt-28 pb-10 md:px-12 md:pt-36 lg:px-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
        <div className="gate-in">
          <h1
            className="text-4xl font-extrabold uppercase leading-[1.05] tracking-tight text-white md:text-5xl xl:text-6xl"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Download the Jungle Boys App.{' '}
            <span className="text-[var(--color-accent)]">Unlock PWF Rewards.</span>
          </h1>
          <p
            className="mt-6 max-w-md text-sm uppercase leading-relaxed tracking-wide text-white/85 md:text-base"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Playing With Fire has its perks. Earn points, unlock exclusive
            drops, and get rewarded every time you shop.
          </p>
          <StoreBadges className="mt-8" />
          <p
            className="mt-4 text-[11px] uppercase tracking-widest text-white/70"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Get 100 bonus points just for downloading.
          </p>
        </div>
        <div className="relative mx-auto w-full max-w-[420px] lg:max-w-[480px]">
          <Image
            src="/rewards/phone-hero.png"
            alt="The Jungle Boys app on a phone"
            width={833}
            height={833}
            priority
            sizes="(max-width: 1024px) 420px, 480px"
            className="w-full"
          />
        </div>
      </div>
    </section>
  )
}
