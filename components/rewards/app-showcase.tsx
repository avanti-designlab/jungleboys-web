import Image from 'next/image'
import { APP_FEATURES } from '@/lib/rewards-content'
import StoreBadges from './store-badges'
import { Scrub, SplitHeading } from './motion'

// "Only on the app": letter-reveal headline, phone scales in, feature pills
// slide from their side. Download CTA repeats the pattern. All scrubbed.

export default function AppShowcase() {
  const left = APP_FEATURES.slice(0, 3)
  const right = APP_FEATURES.slice(3)

  const pill = (label: string, side: 'left' | 'right') => (
    <li
      key={label}
      data-reveal={side}
      className={`rounded-xl bg-[#3a3413]/90 px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-[#f4e9b0] ${
        side === 'left' ? 'lg:text-right' : ''
      }`}
      style={{ fontFamily: 'var(--font-brand)' }}
    >
      {label}
    </li>
  )

  return (
    <section className="px-6 py-16 md:px-12 md:py-24 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <SplitHeading
          mode="letters"
          start="top 60%"
          className="text-center text-3xl font-extrabold uppercase tracking-tight text-white md:text-4xl xl:text-5xl"
          lines={[{ text: 'Only on' }, { text: 'the App', accent: true }]}
        />

        <Scrub start="top 60%">
          <div className="mt-10 grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
            <ul className="grid gap-4">{left.map((f) => pill(f, 'left'))}</ul>
            <div data-reveal="scale" className="order-first mx-auto w-full max-w-[380px] lg:order-none lg:max-w-[460px]">
              <Image
                src="/rewards/phone-glow.png"
                alt="The Jungle Boys app glowing on a phone"
                width={1005}
                height={1004}
                sizes="(max-width: 1024px) 70vw, 460px"
                className="w-full"
              />
            </div>
            <ul className="grid gap-4">{right.map((f) => pill(f, 'right'))}</ul>
          </div>
        </Scrub>

        <div className="mt-20 text-center">
          <SplitHeading
            mode="letters"
            start="top 70%"
            className="text-3xl font-extrabold uppercase leading-[1.1] tracking-tight text-white md:text-4xl xl:text-5xl"
            lines={[
              { text: 'Download the Jungle Boys App.' },
              { text: 'Start Earning Today.', accent: true, block: true },
            ]}
          />
          <Scrub start="top 85%">
            <p
              data-reveal="rise"
              className="mt-4 text-sm font-bold uppercase tracking-wide text-white/90"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              Rewards, access, and exclusive perks are waiting.
            </p>
            <div data-reveal="up">
              <StoreBadges className="mt-8 justify-center" />
            </div>
            <p
              data-reveal="rise"
              className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-white/70"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              Get 100 bonus points just for downloading.
            </p>
          </Scrub>
        </div>
      </div>
    </section>
  )
}
