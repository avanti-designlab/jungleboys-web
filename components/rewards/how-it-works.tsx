import Image from 'next/image'
import Reveal from '@/components/reveal'
import { STEPS } from '@/lib/rewards-content'

// "How Playing With Fire Rewards works" banner (art from Figma) + the
// 4-step in-store rewards strip.

export default function HowItWorks() {
  return (
    <section className="px-6 py-10 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="grid items-center gap-8 rounded-[2rem] bg-[#161616] p-8 md:grid-cols-2 md:p-12">
            <div>
              <h2 className="sr-only">How Playing With Fire Rewards works</h2>
              <Image
                src="/rewards/pwf-works.png"
                alt="How Playing With Fire Rewards works"
                width={609}
                height={364}
                sizes="(max-width: 768px) 90vw, 540px"
                className="mx-auto w-full max-w-[540px]"
              />
            </div>
            <div className="text-center">
              <Image
                src="/rewards/mascots-coins.png"
                alt="Jungle Boys mascots collecting reward coins"
                width={562}
                height={424}
                sizes="(max-width: 768px) 80vw, 480px"
                className="mx-auto w-full max-w-[480px]"
              />
              <p
                className="mt-4 text-sm font-extrabold uppercase tracking-wide text-white md:text-base"
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                Earn points. Unlock rewards. It&apos;s that simple.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-14">
          <p
            className="mx-auto w-fit rounded-full bg-[#1c1c1c] px-6 py-2.5 text-xs font-extrabold uppercase tracking-widest text-white"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            In-Store Rewards Points
          </p>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className="relative rounded-2xl border border-white/25 px-6 py-8 text-center"
              >
                <img src={s.icon} alt="" aria-hidden className="mx-auto h-14 w-14" />
                <h3
                  className="mt-4 text-sm font-extrabold uppercase tracking-wide text-white"
                  style={{ fontFamily: 'var(--font-brand)' }}
                >
                  {s.title}
                </h3>
                <p
                  className="mt-2 text-[11px] font-semibold uppercase leading-relaxed tracking-wide text-[var(--color-accent)]"
                  style={{ fontFamily: 'var(--font-brand)' }}
                >
                  {s.body}
                </p>
                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute -right-3.5 top-1/2 hidden -translate-y-1/2 text-2xl text-white/50 lg:block"
                  >
                    ›
                  </span>
                )}
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  )
}
