import { getProducts } from '@/lib/dutchie'
import PillCta from '@/components/pill-cta'
import Reveal from '@/components/reveal'

// Shop 5G Pops — the SAME card structure as the flower and hash-hole shops on
// the frozen lib/dutchie interface, so all three stay in sync when Phase 3
// swaps in live data. The panel runs DARK here: the rest of the page is white
// and red, so inverting makes the shop read as its own destination.

// shared strain-type colours (matches the flower shop)
// lifted from the light-panel values so they still pass on near-black
const TYPE_COLOR: Record<string, string> = {
  indica: '#6f9bff',
  sativa: '#ff6b6b',
  hybrid: '#43d16f',
}

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`
}

export default async function PopsShop() {
  const products = await getProducts({ category: 'pops', subcategory: '5g-pops' })

  return (
    <section className="px-3 pb-16 md:px-4 md:pb-24">
      <div className="rounded-[2rem] border-4 border-[#101012] bg-[#0b0b0d] px-4 py-16 text-white shadow-[0_26px_70px_rgba(0,0,0,0.4)] md:rounded-[3rem] md:px-10 md:py-24">
        <div className="mx-auto max-w-[1240px]">
          <Reveal className="text-center">
            <h2 className="font-display uppercase leading-[0.82] text-white" style={{ fontSize: 'min(13vw, 6.5rem)' }}>
              Shop <span className="text-[var(--pops-red)]">5G Pops</span>
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
                  <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-[#161618] text-white shadow-[0_14px_40px_rgba(0,0,0,0.45)] ring-1 ring-white/10">
                    <div className="relative aspect-square overflow-hidden bg-[linear-gradient(180deg,#241416_0%,#140c0d_100%)]">
                      {deal ? (
                        <span className="absolute left-4 top-4 z-20 rounded-full bg-[var(--pops-red)] px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-white" style={{ fontFamily: 'var(--font-brand)' }}>
                          {pctOff}% off
                        </span>
                      ) : null}
                      {p.featured && (
                        <span className="absolute right-4 top-4 z-20 rounded-full bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#0b0b0d]" style={{ fontFamily: 'var(--font-brand)' }}>
                          Featured
                        </span>
                      )}
                      {/* pack shot fills the stage — bigger, no dead space up top */}
                      {/* eslint-disable-next-line @next/next/no-img-element -- pack shot */}
                      <img
                        src={p.images[0].url}
                        alt={p.images[0].alt}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-contain p-3 drop-shadow-[0_24px_36px_rgba(0,0,0,0.25)] transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className="rounded-full border-2 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest"
                          style={{
                            fontFamily: 'var(--font-brand)',
                            color: (p.strainType && TYPE_COLOR[p.strainType]) || '#199a43',
                            borderColor: (p.strainType && TYPE_COLOR[p.strainType]) || '#199a43',
                          }}
                        >
                          {p.strainType}
                        </span>
                        {thc && (
                          <span className="rounded-full border border-white/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white/75" style={{ fontFamily: 'var(--font-brand)' }}>
                            THC {thc.value}%
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-[2.3rem] uppercase leading-[0.85]">{p.name}</h3>
                      <p className="text-xs font-bold uppercase tracking-wide text-[var(--pops-red)]" style={{ fontFamily: 'var(--font-brand)' }}>
                        Small nug indoor flower
                      </p>
                      <div className="mt-auto flex items-end justify-between gap-3 pt-2">
                        <p className="leading-none">
                          {deal ? (
                            <>
                              <span className="mb-1 block text-xs font-bold text-white/40 line-through" style={{ fontFamily: 'var(--font-brand)' }}>{dollars(v.price)}</span>
                              <span className="whitespace-nowrap">
                                <span className="font-display text-[2.1rem] leading-none text-[#c21f1f]">{dollars(deal)}</span>
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

          <Reveal className="mt-10 text-center">
            <p className="text-[11px] uppercase tracking-widest text-white/45" style={{ fontFamily: 'var(--font-brand)' }}>
              Availability varies by store — live menus &amp; deals connect at launch.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
