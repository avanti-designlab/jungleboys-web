import Link from 'next/link'

// The store-page back link as a PILL (Avanti, 2026-08-04: "make all these
// pills style too… with the arrow icon in a circle on left") — gold arrow
// circle, hover lift. Dark-ground styling: every current call site is a dark
// hero tile.
export default function BackPill({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group/back inline-flex w-fit items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.07] py-1.5 pl-1.5 pr-5 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
      style={{ fontFamily: 'var(--font-brand)' }}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-black">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4" aria-hidden>
          <path d="M19 12H5m6-6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {label}
    </Link>
  )
}
