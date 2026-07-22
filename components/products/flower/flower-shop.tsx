import { getProducts } from '@/lib/dutchie'
import PillCta from '@/components/pill-cta'
import Reveal from '@/components/reveal'

// The shop — the journey lands in a familiar light pill panel with the flower
// lineup as elevated cards. Data comes ONLY through the frozen lib/dutchie
// interface (placeholder now; Phase 3 swaps the provider and these cards go
// live). Fields mirror what Dutchie feeds jungleboysflorida.com: art, name,
// strain type, THC, weight, price.

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`
}

const STRAIN_LABEL = { indica: 'Indica', sativa: 'Sativa', hybrid: 'Hybrid' } as const

export default async function FlowerShop() {
  const products = await getProducts({ category: 'flower', subcategory: 'premium-flower' })

  return (
    <section className="bg-black px-3 pb-3 md:px-4 md:pb-4">
      <div className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-16 text-[var(--color-foreground)] md:rounded-[3rem] md:px-10 md:py-24">
        <div className="mx-auto max-w-[1280px]">
          <Reveal className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
              The lineup
            </p>
            <h2 className="font-display mt-2 uppercase leading-[0.88]" style={{ fontSize: 'min(11vw, 6.5rem)' }}>
              Shop the gold
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm uppercase tracking-wide text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
              3.5g of top-shelf indoor, sealed fresh in the gold mylar.
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
            {products.map((p, i) => {
              const v = p.variants[0]
              const thc = p.labResult?.potency?.thc
              const terp = p.labResult?.terpenes?.[0]
              return (
                <Reveal key={p.id} delay={Math.min(i, 3) * 0.08}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-[#0b0b0d] text-white">
                    {/* stage */}
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_62%,rgba(233,193,90,0.22),transparent_70%)] transition-opacity duration-500 group-hover:opacity-100 md:opacity-70" />
                      {p.featured && (
                        <span className="absolute left-4 top-4 z-20 rounded-full bg-[var(--fl-gold,#e9c15a)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-black" style={{ fontFamily: 'var(--font-brand)' }}>
                          Featured
                        </span>
                      )}
                      {/* strain art hangs over the bag */}
                      {p.images[1] && (
                        // eslint-disable-next-line @next/next/no-img-element -- strain art
                        <img
                          src={p.images[1].url}
                          alt=""
                          aria-hidden
                          className="absolute left-1/2 top-[8%] z-10 w-[62%] -translate-x-1/2 drop-shadow-[0_16px_24px_rgba(0,0,0,0.55)] transition-transform duration-500 ease-out group-hover:-translate-y-1.5 group-hover:rotate-[-2deg]"
                        />
                      )}
                      {/* eslint-disable-next-line @next/next/no-img-element -- pack shot */}
                      <img
                        src={p.images[0].url}
                        alt={p.images[0].alt}
                        loading="lazy"
                        className="absolute bottom-[-4%] left-1/2 w-[78%] -translate-x-1/2 drop-shadow-[0_28px_40px_rgba(0,0,0,0.6)] transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-[1.03]"
                      />
                    </div>
                    {/* info */}
                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {p.strainType && (
                          <span className="rounded-full border border-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white/80" style={{ fontFamily: 'var(--font-brand)' }}>
                            {STRAIN_LABEL[p.strainType]}
                          </span>
                        )}
                        {thc && (
                          <span className="rounded-full border border-[var(--fl-gold,#e9c15a)]/45 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--fl-gold,#e9c15a)]" style={{ fontFamily: 'var(--font-brand)' }}>
                            {thc.value}% THC
                          </span>
                        )}
                        {terp && (
                          <span className="hidden rounded-full border border-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white/60 lg:inline-block" style={{ fontFamily: 'var(--font-brand)' }}>
                            {terp.name}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-[1.9rem] uppercase leading-[0.9]">{p.name}</h3>
                      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                        <p className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-brand)' }}>
                          {dollars(v.price)} <span className="text-white/50">· {v.option}</span>
                        </p>
                        <PillCta label="Shop" size="sm" icon="cart" href="/locations" />
                      </div>
                    </div>
                  </article>
                </Reveal>
              )
            })}
          </div>

          <Reveal className="mt-10 text-center">
            <p className="text-[11px] uppercase tracking-widest text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
              Availability varies by store — live menus connect at launch.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
