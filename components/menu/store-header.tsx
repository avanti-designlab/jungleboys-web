import Image from 'next/image'
import Link from 'next/link'
import type { Location } from '@/lib/dutchie'

// Store masthead — a BRAND surface, dark in both themes like the footer and
// menu overlay (recorded design-system rule), redesigned per Avanti
// (2026-08-03): the old three-grey-columns header read "a lot of white and
// very generic". Now: yellow glow accents over brand black, the store name in
// the two-tier Bebas treatment, the facts as tappable chips (directions /
// hours / phone), and the store's illustration framed on the right.

const DAY_LABEL: Record<string, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
}

/** "09:00" -> "9AM", "21:45" -> "9:45PM" — matches the voice used on /locations. */
function clock(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return m ? `${hour}:${String(m).padStart(2, '0')}${suffix}` : `${hour}${suffix}`
}

/** Collapse consecutive days sharing hours: Mon–Thu 8AM–8PM · Fri–Sat 8AM–9PM */
function summarise(hours: Location['hours']): { days: string; time: string }[] {
  const out: { days: string; time: string }[] = []
  for (const h of hours) {
    const time = `${clock(h.opens)}–${clock(h.closes)}`
    const last = out[out.length - 1]
    if (last && last.time === time) last.days = `${last.days.split('–')[0]}–${DAY_LABEL[h.day]}`
    else out.push({ days: DAY_LABEL[h.day], time })
  }
  return out
}

const CHIP =
  'inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-bold text-white'

function ChipIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" className="h-3.5 w-3.5 shrink-0" aria-hidden>
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function StoreHeader({
  location,
  children,
}: {
  location: Location
  children?: React.ReactNode
}) {
  const hours = summarise(location.hours)
  // Two-tier name: "JUNGLE BOYS" rides small in yellow, the store rides huge.
  // Both stay inside the ONE h1 so the heading still reads "Jungle Boys
  // Downtown Los Angeles" to crawlers and screen readers.
  const place = location.name.replace(/^Jungle Boys\s+/i, '')
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `Jungle Boys ${place}, ${location.address}, ${location.city}, ${location.state} ${location.zip}`
  )}`

  return (
    <header className="relative overflow-hidden bg-[#0b0b0b] px-6 pb-12 pt-10 text-white md:px-12 md:pt-14 lg:px-20">
      {/* glow field — pure decoration, clipped by the header */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute -right-48 -top-56 h-[34rem] w-[34rem] rounded-full opacity-[0.16] blur-3xl"
          style={{ background: 'var(--color-accent)' }}
        />
        <div
          className="absolute -bottom-64 -left-40 h-[28rem] w-[28rem] rounded-full opacity-[0.07] blur-3xl"
          style={{ background: 'var(--color-accent)' }}
        />
        {/* oversized watermark, same device as the contact page letters */}
        <span className="font-display absolute -bottom-10 right-0 select-none text-[16rem] uppercase leading-none text-white/[0.03]">
          {location.state === 'CA' ? 'CALI' : 'FLA'}
        </span>
      </div>

      <div className="relative mx-auto grid max-w-[1400px] items-end gap-10 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <Link
            href="/locations"
            className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent)] transition hover:opacity-80"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            ← All locations
          </Link>

          <h1 className="font-display mt-5 uppercase">
            <span className="block text-2xl leading-none text-[var(--color-accent)] md:text-3xl">
              Jungle Boys
            </span>
            <span className="mt-1 block text-6xl leading-[0.85] md:text-8xl">{place}</span>
          </h1>

          <p
            className="mt-4 text-[11px] font-bold uppercase tracking-[0.24em] text-white/60"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            {location.city}, California · Adult use 21+ · Est. 2006 · Playing with Fire®
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5" style={{ fontFamily: 'var(--font-brand)' }}>
            <a
              href={directions}
              target="_blank"
              rel="noopener noreferrer"
              className={`${CHIP} transition hover:border-[var(--color-accent)]`}
            >
              <ChipIcon d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
              {location.address} · Directions
            </a>
            {hours.map((h) => (
              <span key={h.days} className={CHIP}>
                <ChipIcon d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2" />
                <span>
                  <span className="text-white/60">{h.days}</span> {h.time}
                </span>
              </span>
            ))}
            <a href={`tel:${location.phone.replace(/[^\d+]/g, '')}`} className={`${CHIP} transition hover:border-[var(--color-accent)]`}>
              <ChipIcon d="M6 3h4l2 5-2.5 1.5a12 12 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2Z" />
              {location.phone}
            </a>
            {/* Rendered ONLY when a real number exists — the placeholder
                provider leaves it empty on purpose; a plausible licence number
                on a cannabis site is fabricated regulatory data. */}
            {location.licenseNumber && (
              <span className={CHIP}>
                <span className="text-white/60">Lic.</span> {location.licenseNumber}
              </span>
            )}
          </div>

          {children}
        </div>

        {/* the store itself, framed. Line art ships on the white media well —
            same treatment as the product photography. */}
        <div className="relative hidden h-64 w-96 shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-[var(--color-media-well)] lg:block">
          <Image
            src={`/locations/stores/${location.slug}.webp`}
            alt={`${location.name} storefront`}
            fill
            sizes="384px"
            className="object-cover"
          />
        </div>
      </div>
    </header>
  )
}
