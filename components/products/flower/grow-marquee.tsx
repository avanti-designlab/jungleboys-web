// Closing filmstrip — the real Cudahy grow (TLC shoot) scrolling past before
// the footer. Reuses the frozen .marquee-track keyframes (GPU transform only,
// pauses on hover). Track is duplicated for a seamless loop.

const SHOTS = [1, 2, 3, 4, 5, 6]

function Row() {
  return (
    <div className="flex shrink-0 items-center gap-4 pr-4 md:gap-6 md:pr-6">
      {SHOTS.map((n) => (
        // eslint-disable-next-line @next/next/no-img-element -- grow photography
        <img
          key={n}
          src={`/products/flower/grow/grow-${n}.webp`}
          alt=""
          aria-hidden
          loading="lazy"
          className="h-52 w-auto rounded-2xl object-cover md:h-72"
        />
      ))}
    </div>
  )
}

export default function GrowMarquee() {
  return (
    <section aria-label="Inside the Jungle Boys grow" className="overflow-hidden bg-black pb-20 pt-2 md:pb-28">
      <p className="pb-6 text-center text-xs font-bold uppercase tracking-[0.4em] text-white/60 md:pb-8" style={{ fontFamily: 'var(--font-brand)' }}>
        Inside the grow
      </p>
      <div className="marquee-pause flex" aria-hidden>
        <div className="marquee-track flex">
          <Row />
          <Row />
        </div>
      </div>
      <p className="sr-only">Photography from inside the Jungle Boys Cudahy grow rooms.</p>
    </section>
  )
}
