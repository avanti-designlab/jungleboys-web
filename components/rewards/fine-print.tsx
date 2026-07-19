import Reveal from '@/components/reveal'
import { FINE_PRINT } from '@/lib/rewards-content'

// "The fine print" — program terms in outlined cards.

export default function FinePrint() {
  return (
    <section className="px-6 pb-24 pt-8 md:px-12 lg:px-20">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <h2
            className="text-center text-3xl font-extrabold uppercase tracking-tight text-white md:text-4xl xl:text-5xl"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            The <span className="text-[var(--color-accent)]">Fine Print</span>
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-6" style={{ fontFamily: 'var(--font-brand)' }}>
          {FINE_PRINT.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06}>
              <div className="rounded-3xl border border-[var(--color-accent)]/80 px-7 py-7 md:px-10">
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
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
