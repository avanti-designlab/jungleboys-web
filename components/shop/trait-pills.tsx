// Icon pills for terpenes + effects (Avanti, 2026-08-04, FL-reference style:
// outlined pills with pictograms). Icons are GENERIC pictograms for a known
// vocabulary — the established cannabis-retail mappings (myrcene→mango,
// limonene→citrus…) — not brand art; an unmapped name gets the neutral leaf,
// never nothing. Hover lifts the pill gold and reveals a one-line note
// (widely-known aroma/effect descriptions, the reference's "key to the smell
// and taste" education).

import type { ReactNode } from 'react'

const I = {
  pepper: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className="h-4 w-4">
      <path d="M8 4l3 3M13 3l-2.5 2.5M6 9c4-2 9-2 12 1-2 4-7 7-11 6-3-.8-3.5-4.5-1-7Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  citrus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className="h-4 w-4">
      <circle cx="12" cy="13" r="7" />
      <path d="M12 6V13m0 0 5 5m-5-5-5 5m5-5 7 0m-7 0-7 0M14 4c1 -1.5 4-1.5 5 0" strokeLinecap="round" />
    </svg>
  ),
  mango: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className="h-4 w-4">
      <path d="M7 6C3.5 9.5 4 15 7.5 18s9 3 12-1c2.5-3.5.5-8-3-10.5C13 4 9.5 3.5 7 6Z" strokeLinejoin="round" />
      <path d="M15 4c1.5-1 3-1 4.5-.5" strokeLinecap="round" />
    </svg>
  ),
  pine: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className="h-4 w-4">
      <path d="M12 3 7 10h3l-4 6h5v4h2v-4h5l-4-6h3L12 3Z" strokeLinejoin="round" />
    </svg>
  ),
  lavender: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className="h-4 w-4">
      <path d="M12 21V11m0 0c-2-1-3-3-3-6 2 0 3.5 1 3 3 .5-2 2-3 4-3 0 3-2 5-4 6Zm-4 4c1.5 0 3 .8 4 2 1-1.2 2.5-2 4-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  herb: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className="h-4 w-4">
      <path d="M12 21c0-6 2-10 7-13 0 7-2 11-7 13Zm0 0c0-5-1.5-8.5-6-11 0 6 1.5 9.5 6 11Z" strokeLinejoin="round" />
    </svg>
  ),
  moon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className="h-4 w-4">
      <path d="M20 14A8 8 0 1 1 10 4a6.5 6.5 0 0 0 10 10Z" strokeLinejoin="round" />
    </svg>
  ),
  smile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className="h-4 w-4">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 14c1 1.5 2.2 2.2 3.5 2.2s2.5-.7 3.5-2.2M9 9.5h.01M15 9.5h.01" strokeLinecap="round" />
    </svg>
  ),
  bolt: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className="h-4 w-4">
      <path d="M13 2 5 14h6l-1 8 8-12h-6l1-8Z" strokeLinejoin="round" />
    </svg>
  ),
  wave: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className="h-4 w-4">
      <path d="M3 9c2.5-2.5 5-2.5 7.5 0S16 11.5 18.5 9M3 15c2.5-2.5 5-2.5 7.5 0s5.5 2.5 8 0" strokeLinecap="round" />
    </svg>
  ),
  lotus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className="h-4 w-4">
      <path d="M12 20c-4 0-7-2-8-5 2-.5 4-.3 5.5.5C8.5 12 9 8.5 12 6c3 2.5 3.5 6 2.5 9.5 1.5-.8 3.5-1 5.5-.5-1 3-4 5-8 5Z" strokeLinejoin="round" />
    </svg>
  ),
}

const TERPENE_META: Record<string, { icon: ReactNode; note: string }> = {
  caryophyllene: { icon: I.pepper, note: 'Spicy, peppery — also found in black pepper and cloves' },
  limonene: { icon: I.citrus, note: 'Bright citrus — also found in lemon and orange peel' },
  myrcene: { icon: I.mango, note: 'Earthy, fruity — also found in mango and hops' },
  terpinolene: { icon: I.pine, note: 'Fresh and piney — also found in apples and conifers' },
  linalool: { icon: I.lavender, note: 'Floral — also found in lavender' },
  pinene: { icon: I.pine, note: 'Sharp pine — also found in rosemary and pine needles' },
  humulene: { icon: I.herb, note: 'Hoppy, woody — also found in hops and sage' },
}

const EFFECT_META: Record<string, { icon: ReactNode; note: string }> = {
  relaxed: { icon: I.wave, note: 'Ease off — settled body, quiet mind' },
  euphoric: { icon: I.smile, note: 'Mood lift — bright and elevated' },
  sleepy: { icon: I.moon, note: 'Winds down toward rest' },
  sedating: { icon: I.moon, note: 'Heavy, night-time weight' },
  energetic: { icon: I.bolt, note: 'Up and moving — daytime pace' },
  happy: { icon: I.smile, note: 'Easy smiles' },
  calm: { icon: I.lotus, note: 'Still and centered' },
  soothing: { icon: I.wave, note: 'Gentle on body and mind' },
  tranquility: { icon: I.lotus, note: 'Deep, settled quiet' },
  creative: { icon: I.bolt, note: 'Sparks ideas' },
  focused: { icon: I.pine, note: 'Clear-headed attention' },
}

function Pill({ label, meta }: { label: string; meta?: { icon: ReactNode; note: string } }) {
  return (
    <span className="group/trait relative inline-flex">
      <span
        className="inline-flex items-center gap-2.5 rounded-full border-2 border-[var(--color-ink)]/70 py-2 pl-3 pr-4 transition-all duration-200 group-hover/trait:-translate-y-0.5 group-hover/trait:border-[var(--color-accent)] group-hover/trait:bg-[var(--color-accent)]"
        style={{ fontFamily: 'var(--font-brand)' }}
      >
        <span className="text-[var(--color-ink)]">{meta?.icon ?? I.herb}</span>
        <span className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-[var(--color-ink)]">{label}</span>
      </span>
      {meta?.note && (
        <span
          role="tooltip"
          className="pointer-events-none absolute -top-2 left-1/2 z-20 w-max max-w-56 -translate-x-1/2 -translate-y-full rounded-xl bg-black px-3.5 py-2 text-center text-[11px] font-semibold leading-snug text-white opacity-0 shadow-xl transition-opacity duration-200 group-hover/trait:opacity-100"
        >
          {meta.note}
        </span>
      )}
    </span>
  )
}

export function TerpenePills({ names }: { names: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {names.map((n) => (
        <Pill key={n} label={n} meta={TERPENE_META[n.toLowerCase()]} />
      ))}
    </div>
  )
}

export function EffectPills({ effects }: { effects: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {effects.map((e) => (
        <Pill key={e} label={e} meta={EFFECT_META[e.toLowerCase()]} />
      ))}
    </div>
  )
}
