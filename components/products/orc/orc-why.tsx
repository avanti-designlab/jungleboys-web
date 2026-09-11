import Reveal from '@/components/reveal'

// Why ORC — three yellow pillars, black type, tiny inline SVG marks (no
// external icon set; drawn to read at chip size).
const PILLARS: { title: string; copy: string; icon: React.ReactNode }[] = [
  {
    title: 'Elite Genetics',
    copy: 'Every extract begins with Jungle Boys’ award-winning cultivars.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-7 w-7" aria-hidden>
        <path d="M12 3v18M12 7c-2.5 0-4.5-2-4.5-4M12 7c2.5 0 4.5-2 4.5-4M12 12c-3 0-5.5-2-6.5-4.5M12 12c3 0 5.5-2 6.5-4.5M12 17c-3.4 0-6.2-2.2-7.5-5M12 17c3.4 0 6.2-2.2 7.5-5" />
      </svg>
    ),
  },
  {
    title: 'Loud Terps',
    copy: 'Built to preserve the flavors and aromas that make every strain unique.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-7 w-7" aria-hidden>
        <path d="M12 21c-4 0-6.5-2.6-6.5-6C5.5 10 12 3 12 3s6.5 7 6.5 12c0 3.4-2.5 6-6.5 6Z" />
        <path d="M9.5 14.5c0 1.6 1.1 2.8 2.5 3" />
      </svg>
    ),
  },
  {
    title: 'Fire Extracts',
    copy: 'Precision extraction that lets the genetics do the talking.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-7 w-7" aria-hidden>
        <path d="M12 21c-3.6 0-6-2.3-6-5.6 0-2.5 1.6-4.2 3-5.9 1.2-1.5 2.4-3 3-5.5.8 2.7 2 4.2 3.1 5.7 1.3 1.7 2.9 3.3 2.9 5.7 0 3.3-2.4 5.6-6 5.6Z" />
        <path d="M12 21c-1.7 0-2.8-1.2-2.8-2.9 0-1.6 1.2-2.6 2.8-4.1 1.6 1.5 2.8 2.5 2.8 4.1 0 1.7-1.1 2.9-2.8 2.9Z" />
      </svg>
    ),
  },
]

export default function OrcWhy() {
  return (
    <section className="relative px-6 py-24 md:px-12 md:py-28 lg:px-20">
      <div className="mx-auto max-w-[1240px]">
        <Reveal className="text-center">
          <h2 className="font-display uppercase leading-[0.86]" style={{ fontSize: 'min(12vw, 5.5rem)' }}>
            Why <span className="text-[var(--orc-yellow)]">ORC?</span>
          </h2>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={0.08 * i}>
              <div className="flex h-full flex-col items-center gap-4 rounded-[1.75rem] bg-[var(--orc-yellow)] px-7 py-10 text-center text-[var(--orc-ink)]">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--orc-ink)] text-[var(--orc-yellow)]">
                  {p.icon}
                </span>
                <h3 className="font-display text-3xl uppercase leading-none">{p.title}</h3>
                <p className="text-[13px] font-bold leading-relaxed" style={{ fontFamily: 'var(--font-brand)' }}>
                  {p.copy}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
