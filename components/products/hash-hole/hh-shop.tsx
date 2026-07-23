import { getProducts } from '@/lib/dutchie'
import PillCta from '@/components/pill-cta'
import Reveal from '@/components/reveal'

// Shop Hash Holes — elevated white cards on the same frozen lib/dutchie
// interface as the flower shop (placeholder now; Phase 3 swaps the provider).
// Each card pairs the flower strain (name) with its live hash rosin (strain).

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`
}

export default async function HhShop() {
  const products = await getProducts({ category: 'pre-rolls', subcategory: 'hash-hole' })

  return (
    <section className="px-3 pb-16 md:px-4 md:pb-24">
      <div className="rounded-[2rem] border-4 border-white bg-white/85 px-4 py-16 text-[var(--hh-ink)] shadow-[0_20px_60px_rgba(19,92,43,0.2)] backdrop-blur md:rounded-[3rem] md:px-10 md:py-24">
        <div className="mx-auto max-w-[1240px]">
          <Reveal className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element -- section wordmark */}
            <img src="/products/hash-hole/wm-strains.webp" alt="Available Strains" className="mx-auto w-[min(72vw,520px)]" />
            <h2 className="font-display mt-4 uppercase leading-[0.9] text-[var(--hh-green-deep)]" style={{ fontSize: 'min(9vw, 4.5rem)' }}>
              Shop Hash Holes
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
            {products.map((p, i) => {
              const v = p.variants[0]
              const thc = p.labResult?.potency?.thc
              const deal = v.specialPrice
              const pctOff = deal ? Math.round((1 - deal / v.price) * 100) : 0
              return (
                <Reveal key={p.id} delay={Math.min(i, 2) * 0.08}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white text-[#0b0b0d] shadow-[0_10px_40px_rgba(0,0,0,0.1)]">
                    <div className="relative aspect-[4/5] overflow-hidden bg-[linear-gradient(180deg,#8fd4f7_0%,#bfe8fb_100%)]">
                      {deal ? (
                        <span className="absolute left-4 top-4 z-20 rounded-full bg-[var(--hh-gold)] px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-[var(--hh-ink)]" style={{ fontFamily: 'var(--font-brand)' }}>
                          {pctOff}% off
                        </span>
                      ) : null}
                      {p.featured && (
                        <span className="absolute right-4 top-4 z-20 rounded-full bg-[var(--hh-green)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white" style={{ fontFamily: 'var(--font-brand)' }}>
                          Featured
                        </span>
                      )}
                      {/* eslint-disable-next-line @next/next/no-img-element -- pack shot */}
                      <img
                        src={p.images[0].url}
                        alt={p.images[0].alt}
                        loading="lazy"
                        className="absolute bottom-[-2%] left-1/2 w-[80%] -translate-x-1/2 drop-shadow-[0_24px_36px_rgba(0,0,0,0.25)] transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full border-2 border-[#199a43] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#199a43]" style={{ fontFamily: 'var(--font-brand)' }}>
                          Hybrid
                        </span>
                        {thc && (
                          <span className="rounded-full border border-[#0b0b0d]/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#0b0b0d]/75" style={{ fontFamily: 'var(--font-brand)' }}>
                            THC {thc.value}%
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-[2.3rem] uppercase leading-[0.85]">{p.name}</h3>
                      {p.strain && (
                        <p className="text-xs font-bold uppercase tracking-wide text-[var(--hh-green)]" style={{ fontFamily: 'var(--font-brand)' }}>
                          × {p.strain} live rosin
                        </p>
                      )}
                      <div className="mt-auto flex items-end justify-between gap-3 pt-2">
                        <p className="leading-none">
                          {deal ? (
                            <>
                              <span className="mb-1 block text-xs font-bold text-[#0b0b0d]/40 line-through" style={{ fontFamily: 'var(--font-brand)' }}>{dollars(v.price)}</span>
                              <span className="whitespace-nowrap">
                                <span className="font-display text-[2.1rem] leading-none text-[#c21f1f]">{dollars(deal)}</span>
                                <span className="ml-1 text-xs font-bold uppercase text-[#0b0b0d]/45" style={{ fontFamily: 'var(--font-brand)' }}>· {v.option}</span>
                              </span>
                            </>
                          ) : (
                            <span className="whitespace-nowrap">
                              <span className="font-display text-[2.1rem] leading-none">{dollars(v.price)}</span>
                              <span className="ml-1 text-xs font-bold uppercase text-[#0b0b0d]/45" style={{ fontFamily: 'var(--font-brand)' }}>· {v.option}</span>
                            </span>
                          )}
                        </p>
                        <PillCta label="Add to Cart" size="sm" icon="cart" href="/locations" className="shrink-0 whitespace-nowrap" />
                      </div>
                    </div>
                  </article>
                </Reveal>
              )
            })}
          </div>

          <Reveal className="mt-10 text-center">
            <p className="text-[11px] uppercase tracking-widest text-[var(--hh-ink)]/50" style={{ fontFamily: 'var(--font-brand)' }}>
              Availability varies by store — live menus &amp; deals connect at launch.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
