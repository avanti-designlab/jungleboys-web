import Link from 'next/link'
import type { Location } from '@/lib/dutchie'

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

export default function StoreHeader({
  location,
  children,
}: {
  location: Location
  children?: React.ReactNode
}) {
  const hours = summarise(location.hours)

  return (
    <header className="border-b border-[var(--color-border)] px-6 pb-10 pt-28 md:px-12 md:pt-32 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/locations"
          className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-accent-ink)] transition hover:opacity-80"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          ← All locations
        </Link>

        <h1 className="font-display mt-4 text-5xl uppercase leading-[0.9] md:text-7xl">
          {location.name}
        </h1>

        <div
          className="mt-6 grid gap-x-10 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-3"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">Address</p>
            <p className="mt-1 leading-snug">
              {location.address}
              <br />
              {location.city}, {location.state} {location.zip}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">Hours</p>
            <ul className="mt-1 space-y-0.5 leading-snug">
              {hours.map((h) => (
                <li key={h.days}>
                  <span className="text-[var(--color-muted)]">{h.days}</span> {h.time}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">Contact</p>
            <p className="mt-1">
              <a className="underline-offset-4 hover:underline" href={`tel:${location.phone.replace(/[^\d+]/g, '')}`}>
                {location.phone}
              </a>
            </p>
            {/* Rendered ONLY when a real number exists. The placeholder provider
                leaves this empty on purpose — a plausible-looking licence number
                on a cannabis site is fabricated regulatory data, and an empty
                field is the honest state until Dutchie supplies the real one. */}
            {location.licenseNumber && (
              <p className="mt-1 text-xs text-[var(--color-muted)]">Lic. {location.licenseNumber}</p>
            )}
          </div>
        </div>

        {children}
      </div>
    </header>
  )
}
