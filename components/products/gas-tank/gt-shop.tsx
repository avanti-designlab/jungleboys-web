import { getProducts } from '@/lib/dutchie'
import PillCta from '@/components/pill-cta'
import Reveal from '@/components/reveal'

// Shop Gas Tanks — the SAME card structure as the flower / hash-hole / pops
// shops on the frozen lib/dutchie interface, split into the three tiers
// (Flavors / Live Resin / Live Rosin) as their own rows. Phase 3 swaps the
// provider and all four pages light up together. Dark panel to match the fire
// surface; strain-type colours lifted for AA on near-black.

const TIERS = [
  { key: 'flavors', label: 'Flavors' },
  { key: 'live-resin', label: 'Live Resin' },
  { key: 'live-rosin', label: 'Live Rosin' },
] as const

const TYPE_COLOR: Record<string, string> = {
  indica: '#6f9bff',
  sativa: '#ff6b6b',
  hybrid: '#43d16f',
}

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`
}

export default async function GtShop() {
  const tiers = await Promise.all(
    TIERS.map(async (t) => ({
      ...t,
      items: await getProducts({ category: 'vape-pens', subcategory: `gas-tank-${t.key}` }),
    }))
  )

  return (
    <section id="gt-shop" className="relative z-10 scroll-mt-24 px-3 pb-16 md:px-4 md:pb-24">
      <div className="rounded-[2rem] border-4 border-[#151110] bg-[#0f0d0c] px-4 py-16 text-white shadow-[0_26px_70px_rgba(0,0,0,0.5)] md:rounded-[3rem] md:px-10 md:py-24">
        <div className="mx-auto max-w-[1240px]">
          <Reveal className="text-center">
            <h2 className="font-display uppercase leading-[0.82] text-white" style={{ fontSize: 'min(13vw, 6.5rem)' }}>
              Shop <span className="text-[var(--gt-yellow)]">Gas Tanks</span>
            </h2>
          </Reveal>

          {tiers.map((tier) => (
            <div key={tier.key} className="mt-14 md:mt-20">
              {/* tier header, cut by a hazard rule */}
              <Reveal className="flex items-center gap-4">
                <span aria-hidden className="h-[3px] flex-1 rounded-full bg-[var(--gt-yellow)]/35" />
                <h3 className="font-display whitespace-nowrap uppercase leading-none text-[var(--gt-yellow)]" style={{ fontSize: 'min(9vw, 3.2rem)' }}>
                  {tier.label}
                </h3>
                <span aria-hidden className="h-[3px] flex-1 rounded-full bg-[var(--gt-yellow)]/35" />
              </Reveal>

              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {tier.items.map((p, i) => {
                  const v = p.variants[0]
                  const thc = p.labResult?.potency?.thc
                  const deal = v.specialPrice
                  const pctOff = deal ? Math.round((1 - deal / v.price) * 100) : 0
                  return (
                    <Reveal key={p.id} delay={Math.min(i, 2) * 0.08}>
                      <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-[#171312] text-white shadow-[0_14px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
                        <div className="relative aspect-square overflow-hidden bg-[linear-gradient(180deg,#2a1a0c_0%,#140d08_100%)]">
                          {deal ? (
                            <span className="absolute left-4 top-4 z-20 rounded-full bg-[var(--gt-red)] px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-white" style={{ fontFamily: 'var(--font-brand)' }}>
                              {pctOff}% off
                            </span>
                          ) : null}
                          {p.featured && (
                            <span className="absolute right-4 top-4 z-20 rounded-full bg-[var(--gt-yellow)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[var(--gt-black)]" style={{ fontFamily: 'var(--font-brand)' }}>
                              Featured
                            </span>
                          )}
                          {/* eslint-disable-next-line @next/next/no-img-element -- pack shot */}
                          <img
                            src={p.images[0].url}
                            alt={p.images[0].alt}
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-contain p-5 drop-shadow-[0_24px_36px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-[1.04]"
                          />
                        </div>
                        <div className="flex flex-1 flex-col gap-2 p-5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {p.strainType && (
                              <span
                                className="rounded-full border-2 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest"
                                style={{
                                  fontFamily: 'var(--font-brand)',
                                  color: TYPE_COLOR[p.strainType] || '#43d16f',
                                  borderColor: TYPE_COLOR[p.strainType] || '#43d16f',
                                }}
                              >
                                {p.strainType}
                              </span>
                            )}
                            {thc && (
                              <span className="rounded-full border border-white/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white/75" style={{ fontFamily: 'var(--font-brand)' }}>
                                THC {thc.value}%
                              </span>
                            )}
                          </div>
                          <h4 className="font-display text-[2.3rem] uppercase leading-[0.85]">{p.name}</h4>
                          <p className="text-xs font-bold uppercase tracking-wide text-[var(--gt-yellow)]" style={{ fontFamily: 'var(--font-brand)' }}>
                            {tier.label} · All-in-one
                          </p>
                          <div className="mt-auto flex items-end justify-between gap-3 pt-2">
                            <p className="leading-none">
                              {deal ? (
                                <>
                                  <span className="mb-1 block text-xs font-bold text-white/40 line-through" style={{ fontFamily: 'var(--font-brand)' }}>{dollars(v.price)}</span>
                                  <span className="whitespace-nowrap">
                                    <span className="font-display text-[2.1rem] leading-none text-[var(--gt-red)]">{dollars(deal)}</span>
                                    <span className="ml-1 text-xs font-bold uppercase text-white/45" style={{ fontFamily: 'var(--font-brand)' }}>· {v.option}</span>
                                  </span>
                                </>
                              ) : (
                                <span className="whitespace-nowrap">
                                  <span className="font-display text-[2.1rem] leading-none">{dollars(v.price)}</span>
                                  <span className="ml-1 text-xs font-bold uppercase text-white/45" style={{ fontFamily: 'var(--font-brand)' }}>· {v.option}</span>
                                </span>
                              )}
                            </p>
                            <PillCta label="Add to Cart" size="sm" icon="cart" hover="black" href="/locations" className="shrink-0 whitespace-nowrap" />
                          </div>
                        </div>
                      </article>
                    </Reveal>
                  )
                })}
              </div>
            </div>
          ))}

          <Reveal className="mt-12 text-center">
            <p className="text-[11px] uppercase tracking-widest text-white/45" style={{ fontFamily: 'var(--font-brand)' }}>
              Availability varies by store — live menus &amp; deals connect at launch.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
