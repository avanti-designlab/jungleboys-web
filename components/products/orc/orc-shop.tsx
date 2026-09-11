import PillCta from '@/components/pill-cta'
import Reveal from '@/components/reveal'
import { getLineProducts } from '@/lib/product-lines'
import { displayName } from '@/lib/product-name'
import ShopSimilarCta from '@/components/products/shop-similar-cta'

// Shop ORC — live inventory through the 'orc' page matcher (brand "Oil
// Refinery Co."). Dark-card family (gas-tank bones). The form pill is read
// from the live NAME — the POS subcategory enums are unreliable here
// (verified 2026-09-10: sugar trims arrive as SHATTER).
const TYPE_COLOR: Record<string, string> = {
  indica: 'var(--strain-indica-on-dark)',
  sativa: 'var(--strain-sativa-on-dark)',
  hybrid: 'var(--strain-hybrid-on-dark)',
}

function formOf(name: string): string | null {
  if (/live ?resin/i.test(name)) return 'Live Resin'
  if (/batter|badder/i.test(name)) return 'Batter'
  if (/budder/i.test(name)) return 'Budder'
  if (/sugar/i.test(name)) return 'Sugar Trim'
  return null
}

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`
}

export default async function OrcShop() {
  const products = await getLineProducts('orc')

  return (
    <section id="orc-shop" className="relative scroll-mt-24 px-6 pb-24 md:px-12 md:pb-32 lg:px-20">
      <div className="mx-auto max-w-[1240px]">
        <Reveal className="text-center">
          <p
            className="text-[10px] font-extrabold uppercase tracking-[0.42em] text-[var(--orc-gold)] md:text-xs"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            Live from the menus
          </p>
          <h2 className="font-display mt-3 uppercase leading-[0.86]" style={{ fontSize: 'min(12vw, 5.5rem)' }}>
            Experience <span className="text-[var(--orc-yellow)]">the full lineup</span>
          </h2>
        </Reveal>

        {products.length === 0 && (
          <Reveal className="mt-12 text-center">
            <p
              className="text-sm font-bold uppercase tracking-widest text-white/80"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              Sold out everywhere right now — fresh batch on the way.
            </p>
            <div className="mt-5 flex justify-center">
              <ShopSimilarCta category="concentrates" label="Concentrates" />
            </div>
          </Reveal>
        )}

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => {
            const v = p.variants.find((x) => (x.quantityAvailable ?? 0) > 0) ?? p.variants[0]
            const thc = p.labResult?.potency?.thc
            const deal = v.specialPrice
            const pctOff = deal ? Math.round((1 - deal / v.price) * 100) : 0
            const form = formOf(p.name)
            return (
              <Reveal key={p.id} delay={Math.min(i, 2) * 0.08}>
                <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-[var(--orc-card)] text-white shadow-[0_14px_40px_rgba(0,0,0,0.5)] ring-1 ring-[var(--orc-yellow)]/15">
                  <div className="relative aspect-square overflow-hidden bg-[radial-gradient(70%_90%_at_50%_100%,rgba(245,163,0,0.18),transparent_75%)]">
                    {deal ? (
                      <span className="absolute left-4 top-4 z-20 rounded-full bg-[var(--color-danger-solid)] px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-white" style={{ fontFamily: 'var(--font-brand)' }}>
                        {pctOff}% off
                      </span>
                    ) : null}
                    {form && (
                      <span className="absolute right-4 top-4 z-20 rounded-full bg-[var(--orc-yellow)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[var(--orc-ink)]" style={{ fontFamily: 'var(--font-brand)' }}>
                        {form}
                      </span>
                    )}
                    {p.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element -- pack shot
                      <img
                        src={p.images[0].url}
                        alt={p.images[0].alt}
                        loading="lazy"
                        className="absolute inset-0 z-10 h-full w-full object-contain p-6 drop-shadow-[0_24px_36px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-[1.04]"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2.5 p-5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {p.strainType && (
                        <span
                          className="rounded-full border-2 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest"
                          style={{
                            fontFamily: 'var(--font-brand)',
                            color: TYPE_COLOR[p.strainType] || 'var(--strain-hybrid-on-dark)',
                            borderColor: TYPE_COLOR[p.strainType] || 'var(--strain-hybrid-on-dark)',
                          }}
                        >
                          {p.strainType}
                        </span>
                      )}
                      {thc && (
                        <span className="rounded-full border border-white/35 bg-black/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white" style={{ fontFamily: 'var(--font-brand)' }}>
                          THC {thc.value}
                          {thc.unit}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display line-clamp-3 text-[1.6rem] uppercase leading-[0.92]">
                      {displayName(p)}
                    </h3>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
                      <p className="leading-none">
                        {deal ? (
                          <>
                            <span className="mb-1 block text-xs font-bold text-white/55 line-through" style={{ fontFamily: 'var(--font-brand)' }}>
                              {dollars(v.price)}
                            </span>
                            <span className="font-display whitespace-nowrap text-[1.8rem] leading-none text-[var(--orc-yellow)]">{dollars(deal)}</span>
                          </>
                        ) : (
                          <span className="font-display whitespace-nowrap text-[1.8rem] leading-none">{dollars(v.price)}</span>
                        )}
                        <span className="ml-1 inline-block whitespace-nowrap text-xs font-bold uppercase text-white/70" style={{ fontFamily: 'var(--font-brand)' }}>
                          · {v.option}
                        </span>
                      </p>
                      <PillCta label="Shop" size="sm" icon="cart" hover="black" href={`/shop/${p.slug}`} className="shrink-0 whitespace-nowrap" />
                    </div>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>

        {products.length > 0 && (
          <Reveal className="mt-12 text-center">
            <p className="text-[11px] uppercase tracking-widest text-white/60" style={{ fontFamily: 'var(--font-brand)' }}>
              Live from the menus — availability and pricing vary by store.
            </p>
          </Reveal>
        )}
      </div>
    </section>
  )
}
