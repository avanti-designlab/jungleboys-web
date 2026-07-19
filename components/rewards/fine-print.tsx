import { FINE_PRINT } from '@/lib/rewards-content'
import { Scrub, SplitHeading } from './motion'

// "The fine print" — letter-reveal heading, terms cards rising in sequence.

export default function FinePrint() {
  return (
    <section className="px-6 pb-24 pt-8 md:px-12 lg:px-20">
      <div className="mx-auto max-w-4xl">
        <SplitHeading
          mode="letters"
          className="text-center text-3xl font-extrabold uppercase tracking-tight text-white md:text-4xl xl:text-5xl"
          lines={[{ text: 'The' }, { text: 'Fine Print', accent: true }]}
        />
        <Scrub className="mt-12 grid gap-6" end="bottom 90%">
          {FINE_PRINT.map((s) => (
            <div
              key={s.title}
              data-reveal="rise"
              className="rounded-3xl border border-[var(--color-accent)]/80 px-7 py-7 md:px-10"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              <h3 className="text-base font-extrabold uppercase tracking-wide text-white">
                {s.title}
              </h3>
              <ul className="mt-4 space-y-1.5 text-xs font-bold uppercase leading-relaxed tracking-wide text-white/90">
                {s.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span aria-hidden className="text-[var(--color-accent)]">•</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Scrub>
      </div>
    </section>
  )
}
