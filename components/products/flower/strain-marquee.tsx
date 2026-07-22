// Scrolling strain bands — an outlined text marquee and a counter-scrolling
// row of the strain logos from the Figma flower frame. Reuses the frozen
// .marquee-track keyframes (GPU transform only, pauses on hover).

const WORDS = ['Small Batch', 'Hand-Trimmed', 'Gold Standard', 'Exotic Genetics', 'Playing With Fire®']

const LOGOS = [
  'strain-motorbreath',
  'strain-06og',
  'strain-zudz',
  'strain-blam',
  'strain-bluzerdz',
  'strain-lagelato',
  'strain-rs1000',
  'strain-zangria',
]

function TextRow() {
  return (
    <div className="flex shrink-0 items-center">
      {WORDS.map((w) => (
        <span key={w} className="flex items-center">
          <span className="font-display whitespace-nowrap px-5 uppercase leading-none text-white" style={{ fontSize: 'min(9vw, 6rem)' }}>
            {w}
          </span>
          <span aria-hidden className="fl-stroke font-display leading-none" style={{ fontSize: 'min(9vw, 6rem)' }}>
            ✦
          </span>
        </span>
      ))}
    </div>
  )
}

function LogoRow() {
  return (
    <div className="flex shrink-0 items-center gap-14 pr-14 md:gap-20 md:pr-20">
      {LOGOS.map((l) => (
        // eslint-disable-next-line @next/next/no-img-element -- strain art
        <img key={l} src={`/products/flower/${l}.webp`} alt="" aria-hidden className="h-16 w-auto opacity-90 md:h-24" loading="lazy" />
      ))}
    </div>
  )
}

export default function StrainMarquee() {
  return (
    <section aria-label="Jungle Boys strains" className="overflow-hidden bg-black py-14 md:py-20">
      <div className="marquee-pause flex" aria-hidden>
        <div className="marquee-track flex">
          <TextRow />
          <TextRow />
        </div>
      </div>
      <div className="marquee-pause mt-10 flex md:mt-14" aria-hidden>
        <div className="marquee-track-reverse flex">
          <LogoRow />
          <LogoRow />
        </div>
      </div>
      <p className="sr-only">
        Small batch, hand-trimmed, gold standard, exotic genetics — Jungle Boys strains including Motorbreath, 06 OG,
        Zudz, Blam, Blu Zerdz, LA Gelato, RS1000 and Zangria.
      </p>
    </section>
  )
}
