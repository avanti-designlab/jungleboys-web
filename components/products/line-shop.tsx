import { getProducts } from '@/lib/dutchie'
import type { ProductFilter } from '@/lib/dutchie'
import PillCta from '@/components/pill-cta'
import Reveal from '@/components/reveal'

// ONE shop section for the gradient-card product lines (Twins / 1G Pre-Rolls /
// 10-Pack). Those three were separate files that differed in ~45 of ~130 lines,
// and every one of those differences was a colour, a word, or the query — never
// the structure. Three copies of the same card meant three places to fix a bug
// and three chances for them to drift, which is exactly what happened to the
// strain colours and the card gradients.
//
// NOT used by gas-tank / pops (flat dark cards, outline pills, 2/3rem radius,
// py-16/24) or hash-hole / flower (white cards, no ring). Those are a genuinely
// different visual family — folding them in here would be a design change to
// pages that have already been signed off, not a refactor. If they should all
// converge, that is Avanti's call and a separate pass.
//
// Sits on the frozen lib/dutchie interface: Phase 3 swaps the provider and
// every line lights up together.

// Strain colour comes from the site-wide --strain-* tokens, never a local map.
const TYPE_COLOR: Record<string, string> = {
  indica: 'var(--strain-indica)',
  sativa: 'var(--strain-sativa)',
  hybrid: 'var(--strain-hybrid)',
}

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`
}

export type LineShopProps = {
  /** anchor id — the deep-link target for this line's shop, e.g.
      /products/twins#tw-shop. NOT wired to an on-page CTA: none of the seven
      line pages has one, and the previous wording here claimed otherwise. */
  id: string
  filter: ProductFilter
  kicker: string
  /** heading renders as `Shop <accent>titleAccent</accent>` */
  title: string
  titleAccent: string
  /** panel ground + its deep ink, both per line */
  panel: string
  ink: string
  /** the card's three-stop ramp, hot -> base -> deep */
  cardFrom: string
  cardMid: string
  cardTo: string
  /** kicker + heading accent */
  accent: string
  accentHot: string
  /** the pack-shot pill behind the product image */
  shotTo: string
  /** strain line under the product name */
  strainText: string
  /** card shadow, tuned to the card colour */
  shadow: string
  /** "Featured" flag colour */
  featuredBg: string
  cols?: 3 | 4
}

export default async function LineShop({
  id, filter, kicker, title, titleAccent,
  panel, ink, cardFrom, cardMid, cardTo,
  accent, accentHot, shotTo, strainText, shadow, featuredBg,
  cols = 3,
}: LineShopProps) {
  const items = await getProducts(filter)

  return (
    <section id={id} className="relative z-10 scroll-mt-24 px-2 pb-4 md:px-3">
      <div
        className="rounded-[1.75rem] px-4 py-14 md:rounded-[2.5rem] md:px-10 md:py-20"
        style={{ background: panel, color: ink }}
      >
        <div className="mx-auto max-w-[1240px]">
          <Reveal className="text-center">
            <p
              className="text-[10px] font-extrabold uppercase tracking-[0.42em] md:text-xs"
              style={{ fontFamily: 'var(--font-brand)', color: accent }}
            >
              {kicker}
            </p>
            <h2
              className="font-display mt-2 uppercase leading-[0.84]"
              style={{ fontSize: 'min(13vw, 6rem)', letterSpacing: '-0.03em', color: ink }}
            >
              {title} <span style={{ color: accentHot }}>{titleAccent}</span>
            </h2>
          </Reveal>

          <div
            className={`mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-14 ${
              cols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
            }`}
          >
            {items.map((p, i) => {
              const v = p.variants[0]
              const thc = p.labResult?.potency?.thc
              const deal = v.specialPrice
              const pctOff = deal ? Math.round((1 - deal / v.price) * 100) : 0
              return (
                <Reveal key={p.id} delay={Math.min(i, 2) * 0.08}>
                  <article
                    className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] text-white ring-1 ring-white/15"
                    style={{
                      background: `linear-gradient(180deg,${cardFrom} 0%,${cardMid} 52%,${cardTo} 100%)`,
                      boxShadow: shadow,
                    }}
                  >
                    <div
                      className="relative m-3 aspect-square overflow-hidden rounded-[1.35rem]"
                      style={{ background: `linear-gradient(180deg,#ffffff 0%,${shotTo} 100%)` }}
                    >
                      {deal ? (
                        <span className="absolute left-3 top-3 z-20 rounded-full bg-[var(--color-danger-solid)] px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-white" style={{ fontFamily: 'var(--font-brand)' }}>
                          {pctOff}% off
                        </span>
                      ) : null}
                      {p.featured && (
                        <span className="absolute right-3 top-3 z-20 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white" style={{ fontFamily: 'var(--font-brand)', background: featuredBg }}>
                          Featured
                        </span>
                      )}
                      {/* eslint-disable-next-line @next/next/no-img-element -- pack shot */}
                      <img
                        src={p.images[0].url}
                        alt={p.images[0].alt}
                        loading="lazy"
                        className="absolute inset-0 z-10 h-full w-full object-contain p-4 drop-shadow-[0_18px_26px_rgba(0,0,0,0.26)] transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-[1.04]"
                      />
                    </div>

                    <div className="flex flex-1 flex-col gap-2 px-5 pb-5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {p.strainType && (
                          <span
                            // the keyline is what keeps this readable on ANY card
                            // ground — the hybrid green used to vanish into the
                            // pre-rolls card, which is the same colour
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
                      <p className="text-xs font-bold uppercase tracking-wide" style={{ fontFamily: 'var(--font-brand)', color: strainText }}>
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
            <p className="text-[11px] uppercase tracking-widest opacity-80" style={{ fontFamily: 'var(--font-brand)', color: ink }}>
              Availability varies by store — live menus &amp; deals connect at launch.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
