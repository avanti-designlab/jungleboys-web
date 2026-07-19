import Image from 'next/image'
import Reveal from '@/components/reveal'
import { APP_FEATURES } from '@/lib/rewards-content'
import StoreBadges from './store-badges'

// "Only on the app" (glowing phone flanked by feature pills) + download CTA.

export default function AppShowcase() {
  const left = APP_FEATURES.slice(0, 3)
  const right = APP_FEATURES.slice(3)

  const pill = (label: string, align: 'left' | 'right') => (
    <li
      key={label}
      className={`rounded-xl bg-[#3a3413]/90 px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-[#f4e9b0] ${
        align === 'left' ? 'lg:text-right' : ''
      }`}
      style={{ fontFamily: 'var(--font-brand)' }}
    >
      {label}
    </li>
  )

  return (
    <section className="px-6 py-16 md:px-12 md:py-24 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2
            className="text-center text-3xl font-extrabold uppercase tracking-tight text-white md:text-4xl xl:text-5xl"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Only on <span className="text-[var(--color-accent)]">the App</span>
          </h2>
        </Reveal>

        <Reveal>
          <div className="mt-10 grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
            <ul className="grid gap-4">{left.map((f) => pill(f, 'left'))}</ul>
            <Image
              src="/rewards/phone-glow.png"
              alt="The Jungle Boys app glowing on a phone"
              width={1005}
              height={1004}
              sizes="(max-width: 1024px) 70vw, 460px"
              className="order-first mx-auto w-full max-w-[380px] lg:order-none lg:max-w-[460px]"
            />
            <ul className="grid gap-4">{right.map((f) => pill(f, 'right'))}</ul>
          </div>
        </Reveal>

        <Reveal className="mt-20 text-center">
          <h2
            className="text-3xl font-extrabold uppercase leading-[1.1] tracking-tight text-white md:text-4xl xl:text-5xl"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Download the Jungle Boys App.{' '}
            <span className="block text-[var(--color-accent)]">Start Earning Today.</span>
          </h2>
          <p
            className="mt-4 text-sm font-bold uppercase tracking-wide text-white/90"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Rewards, access, and exclusive perks are waiting.
          </p>
          <StoreBadges className="mt-8 justify-center" />
          <p
            className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-white/70"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Get 100 bonus points just for downloading.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
