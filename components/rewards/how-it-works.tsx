import Image from 'next/image'
import { Scrub } from './motion'
import StepsRail from './steps-rail'

// "How Playing With Fire Rewards works" banner (dark brand card in both
// themes) + the scroll-stepped in-store rewards rail.

export default function HowItWorks() {
  return (
    <section className="px-6 py-10 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <Scrub>
          <div className="grid items-center gap-8 rounded-[2rem] bg-[#141414] p-8 md:grid-cols-2 md:p-12">
            <div data-reveal="up">
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
              <div data-reveal="up">
                <Image
                  src="/rewards/mascots-coins.png"
                  alt="Jungle Boys mascots collecting reward coins"
                  width={562}
                  height={424}
                  sizes="(max-width: 768px) 80vw, 480px"
                  className="mx-auto w-full max-w-[480px]"
                />
              </div>
              <p
                data-reveal="rise"
                className="mt-4 text-sm font-extrabold uppercase tracking-wide text-white md:text-base"
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                Earn points. Unlock rewards. It&apos;s that simple.
              </p>
            </div>
          </div>
        </Scrub>

        <div className="mt-20">
          <StepsRail />
        </div>
      </div>
    </section>
  )
}
