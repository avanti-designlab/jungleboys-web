import Reveal from '@/components/reveal'

// Product beat — a normal-flow section (no pin) so scrolling stays smooth. The
// tube + joint sit large with a gentle float; copy beside them. Kept simple
// and reliable; richer motion comes as its own careful pass.

export default function HhProduct() {
  return (
    <section className="relative px-6 py-20 md:py-28">
      <div className="mx-auto grid max-w-[1100px] items-center gap-10 md:grid-cols-2">
        <Reveal className="order-2 text-center md:order-1 md:text-left">
          <h2 className="font-display uppercase leading-[0.88] text-[var(--hh-green-deep)]" style={{ fontSize: 'min(13vw, 6rem)' }}>
            Built to <span className="hh-gold-head">Hit</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base font-bold uppercase leading-relaxed tracking-wide text-[var(--hh-ink)]/80 md:mx-0 md:text-lg" style={{ fontFamily: 'var(--font-brand)' }}>
            2g of premium indoor flower, a .5g rope of live hash rosin, an
            organic wood tip, all-natural paper. One clean burn, start to finish.
          </p>
        </Reveal>

        <Reveal className="order-1 flex justify-center md:order-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- product art */}
          <img
            src="/products/hash-hole/product.webp"
            alt="Jungle Boys Hash Hole tube and infused joint"
            className="hh-float w-[min(78vw,440px)] drop-shadow-[0_30px_60px_rgba(0,0,0,0.35)]"
          />
        </Reveal>
      </div>
    </section>
  )
}
