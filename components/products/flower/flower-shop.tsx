import { getProducts } from '@/lib/dutchie'
import PillCta from '@/components/pill-cta'
import Reveal from '@/components/reveal'

// The shop — the journey lands in a familiar light pill panel with the flower
// lineup as white Dutchie-style cards. Data comes ONLY through the frozen
// lib/dutchie interface (placeholder now; Phase 3 swaps the provider and these
// go live): pack shot (Dutchie art ships with strain logos on it), strain type,
// THC %, total terps %, price + specialPrice deals.

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`
}

// scoped card accents per strain type (Avanti: blue / red / green outlines)
const STRAIN_STYLE = {
  indica: { label: 'Indica', cls: 'border-[#2f6bff] text-[#2f6bff]' },
  sativa: { label: 'Sativa', cls: 'border-[#e03131] text-[#e03131]' },
  hybrid: { label: 'Hybrid', cls: 'border-[#199a43] text-[#199a43]' },
} as const

export default async function FlowerShop() {
  const products = await getProducts({ category: 'flower', subcategory: 'premium-flower' })

  return (
    <section className="bg-black px-3 pb-16 md:px-4 md:pb-24">
      <div className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-16 text-[var(--color-foreground)] md:rounded-[3rem] md:px-10 md:py-24">
        <div className="mx-auto max-w-[1280px]">
          <Reveal className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
              The lineup
            </p>
            <h2 className="font-display mt-2 uppercase leading-[0.88]" style={{ fontSize: 'min(9.5vw, 6.5rem)' }}>
              Shop 3.5G Gold Mylars
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
            {products.map((p, i) => {
              const v = p.variants[0]
              const thc = p.labResult?.potency?.thc
              const terps = p.labResult?.terpenes?.reduce((sum, t) => sum + t.percentage, 0)
              const deal = v.specialPrice
              const pctOff = deal ? Math.round((1 - deal / v.price) * 100) : 0
              const strain = p.strainType ? STRAIN_STYLE[p.strainType] : null
              return (
                <Reveal key={p.id} delay={Math.min(i, 3) * 0.08}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white text-[#0b0b0d] shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
                    {/* stage */}
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_50%_68%,rgba(233,193,90,0.28),transparent_72%)]" />
                      {deal ? (
                        <span className="absolute left-4 top-4 z-20 rounded-full bg-[var(--color-accent)] px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-black" style={{ fontFamily: 'var(--font-brand)' }}>
                          {pctOff}% off
                        </span>
                      ) : null}
                      {p.featured && (
                        <span className="absolute right-4 top-4 z-20 rounded-full bg-[#0b0b0d] px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white" style={{ fontFamily: 'var(--font-brand)' }}>
                          Featured
                        </span>
                      )}
                      {/* pack shot — Dutchie art carries the strain logo itself */}
                      {/* eslint-disable-next-line @next/next/no-img-element -- pack shot */}
                      <img
                        src={p.images[0].url}
                        alt={p.images[0].alt}
                        loading="lazy"
                        className="absolute bottom-[-3%] left-1/2 w-[94%] -translate-x-1/2 drop-shadow-[0_24px_36px_rgba(0,0,0,0.28)] transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:scale-[1.03]"
                      />
                    </div>
                    {/* info */}
                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {strain && (
                          <span className={`rounded-full border-2 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest ${strain.cls}`} style={{ fontFamily: 'var(--font-brand)' }}>
                            {strain.label}
                          </span>
                        )}
                        {thc && (
                          <span className="rounded-full border border-[#0b0b0d]/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#0b0b0d]/75" style={{ fontFamily: 'var(--font-brand)' }}>
                            THC {thc.value}%
                          </span>
                        )}
                        {terps ? (
                          <span className="rounded-full border border-[#0b0b0d]/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#0b0b0d]/75" style={{ fontFamily: 'var(--font-brand)' }}>
                            Terps {terps.toFixed(1)}%
                          </span>
                        ) : null}
                      </div>
                      <h3 className="font-display text-[2.5rem] uppercase leading-[0.9]">{p.name}</h3>
                      <div className="mt-auto flex items-end justify-between gap-3 pt-1">
                        {/* struck price sits on its own line so deal cards keep
                            the same row shape as the rest */}
                        <p className="leading-none">
                          {deal && (
                            <span className="mb-1 block text-xs font-bold text-[#0b0b0d]/40 line-through" style={{ fontFamily: 'var(--font-brand)' }}>
                              {dollars(v.price)}
                            </span>
                          )}
                          <span className="whitespace-nowrap">
                            <span className={`font-display text-[2.1rem] leading-none ${deal ? 'text-[#c21f1f]' : ''}`}>{dollars(deal ?? v.price)}</span>
                            <span className="ml-1 text-xs font-bold uppercase text-[#0b0b0d]/45" style={{ fontFamily: 'var(--font-brand)' }}>· {v.option}</span>
                          </span>
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
            <p className="text-[11px] uppercase tracking-widest text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
              Availability varies by store — live menus &amp; deals connect at launch.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
