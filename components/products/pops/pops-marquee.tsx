// Candy-stripe scrolling band. Reuses the frozen .marquee-track keyframes; the
// speed is scoped to .pops-band so the shared 40s footer marquee is untouched.

const WORDS: { t: string; mark?: boolean }[] = [
  { t: '5G Pops' },
  { t: 'Small Nug' },
  { t: 'Same Exotic Strains' },
  { t: 'Better Value' },
  { t: 'Playing With Fire', mark: true },
]

function Row() {
  return (
    <div className="flex shrink-0 items-center">
      {WORDS.map((w) => (
        <span key={w.t} className="flex items-center">
          <span className="font-display whitespace-nowrap px-6 uppercase leading-none text-white" style={{ fontSize: 'min(13vw, 5.5rem)' }}>
            {w.t}
            {w.mark && <span className="relative inline-block top-[0.16em] align-top text-[0.28em] leading-none">®</span>}
          </span>
          <span aria-hidden className="font-display leading-none text-white/70" style={{ fontSize: 'min(13vw, 5.5rem)' }}>
            ★
          </span>
        </span>
      ))}
    </div>
  )
}

export default function PopsMarquee({ reverse = false }: { reverse?: boolean }) {
  return (
    <section aria-hidden className="pops-band relative z-10 my-12 overflow-hidden bg-[var(--pops-red)] py-3 md:my-20 md:py-5">
      <div className="marquee-pause flex">
        <div className={`${reverse ? 'marquee-track-reverse' : 'marquee-track'} flex`}>
          <Row />
          <Row />
        </div>
      </div>
    </section>
  )
}
