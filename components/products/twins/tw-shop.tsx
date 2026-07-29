import { getProducts } from '@/lib/dutchie'
import PillCta from '@/components/pill-cta'
import Reveal from '@/components/reveal'

// Shop Twins — the SAME card structure as the flower / hash-hole / pops /
// gas-tank / 10-pack / 1G shops on the frozen lib/dutchie interface. Phase 3
// swaps the provider and every page lights up together.
//
// The opposite colour to the rest of the page: a light room against all that
// black, with the cards carrying the Twins red and the CTA the mark's navy.
// The tubes are dark and glossy and need a light ground to read against.

// Strain colour comes from the site-wide --strain-* tokens, not a local map.
// Six shop files each carried their own, in three different palettes, so the
// same label rendered in three different blues across the site — and two of
// those palettes failed AA. See app/globals.css :root.
const TYPE_COLOR: Record<string, string> = {
  indica: 'var(--strain-indica)',
  sativa: 'var(--strain-sativa)',
  hybrid: 'var(--strain-hybrid)',
}

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`
}

export default async function TwShop() {
  const items = await getProducts({ category: 'pre-rolls', subcategory: 'twins-2pack' })

  return (
    <section id="tw-shop" className="relative z-10 scroll-mt-24 px-2 pb-4 md:px-3">
      <div className="rounded-[1.75rem] bg-[#fdf3f3] px-4 py-14 text-[var(--tw-shop-ink)] md:rounded-[2.5rem] md:px-10 md:py-20">
        <div className="mx-auto max-w-[1240px]">
          <Reveal className="text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.42em] text-[#c1111a] md:text-xs"
              style={{ fontFamily: 'var(--font-brand)' }}>
              Two in every tube
            </p>
            <h2 className="font-display mt-2 uppercase leading-[0.84] text-[var(--tw-shop-ink)]" style={{ fontSize: 'min(13vw, 6rem)', letterSpacing: '-0.03em' }}>
              Shop <span className="text-[#e6242c]">Twins</span>
            </h2>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 md:mt-14">
            {items.map((p, i) => {
              const v = p.variants[0]
              const thc = p.labResult?.potency?.thc
              const deal = v.specialPrice
              const pctOff = deal ? Math.round((1 - deal / v.price) * 100) : 0
              return (
                <Reveal key={p.id} delay={Math.min(i, 2) * 0.08}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] text-white shadow-[0_16px_44px_rgba(100,10,16,0.28)] ring-1 ring-white/15"
                    style={{ background: 'linear-gradient(180deg,var(--tw-red-hot) 0%,var(--tw-red) 52%,var(--tw-red-deep) 100%)' }}>
                    <div className="relative m-3 aspect-square overflow-hidden rounded-[1.35rem] bg-[linear-gradient(180deg,#ffffff_0%,#faeced_100%)]">
                      {deal ? (
                        <span className="absolute left-3 top-3 z-20 rounded-full bg-[#d4232a] px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-white" style={{ fontFamily: 'var(--font-brand)' }}>
                          {pctOff}% off
                        </span>
                      ) : null}
                      {p.featured && (
                        <span className="absolute right-3 top-3 z-20 rounded-full bg-[#081d47] px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white" style={{ fontFamily: 'var(--font-brand)' }}>
                          Featured
                        </span>
                      )}
                      {/* eslint-disable-next-line @next/next/no-img-element -- pack shot */}
                      <img
                        src={p.images[0].url}
                        alt={p.images[0].alt}
                        loading="lazy"
                        className="absolute inset-0 z-10 h-full w-full object-contain p-4 drop-shadow-[0_18px_26px_rgba(70,8,12,0.26)] transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-[1.04]"
                      />
                    </div>

                    <div className="flex flex-1 flex-col gap-2 px-5 pb-5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {p.strainType && (
                          <span
                            className="rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white ring-1 ring-inset ring-white/70"
                            style={{ fontFamily: 'var(--font-brand)', background: TYPE_COLOR[p.strainType] || 'var(--strain-hybrid)' }}
                          >
                            {p.strainType}
                          </span>
                        )}
                        {thc && (
                          <span className="rounded-full border border-white/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white/85" style={{ fontFamily: 'var(--font-brand)' }}>
                            THC {thc.value}%
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-[2.1rem] uppercase leading-[0.85]">{p.name}</h3>
                      <p className="text-xs font-bold uppercase tracking-wide text-[#ffd2d4]" style={{ fontFamily: 'var(--font-brand)' }}>
                        {p.strain}
                      </p>
                      <div className="mt-auto flex items-end justify-between gap-3 pt-2">
                        <p className="leading-none">
                          {deal ? (
                            <>
                              <span className="mb-1 block text-xs font-bold text-white/55 line-through" style={{ fontFamily: 'var(--font-brand)' }}>{dollars(v.price)}</span>
                              <span className="whitespace-nowrap">
                                <span className="font-display text-[2rem] leading-none text-[#ffd166]">{dollars(deal)}</span>
                                <span className="ml-1 text-xs font-bold uppercase text-white/60" style={{ fontFamily: 'var(--font-brand)' }}>· {v.option}</span>
                              </span>
                            </>
                          ) : (
                            <span className="whitespace-nowrap">
                              <span className="font-display text-[2rem] leading-none">{dollars(v.price)}</span>
                              <span className="ml-1 text-xs font-bold uppercase text-white/60" style={{ fontFamily: 'var(--font-brand)' }}>· {v.option}</span>
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

          <Reveal className="mt-12 text-center">
            <p className="text-[11px] uppercase tracking-widest text-[var(--tw-shop-ink)]/80" style={{ fontFamily: 'var(--font-brand)' }}>
              Availability varies by store — live menus &amp; deals connect at launch.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
