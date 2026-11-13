'use client'

// Opens the site-wide accessibility preferences dialog (a11y-prefs.tsx,
// mounted in the root layout) from server-rendered surfaces.

export default function A11yOpenButton({ variant = 'solid' }: { variant?: 'solid' | 'footer' }) {
  const open = () => window.dispatchEvent(new CustomEvent('jb:a11y-open'))
  if (variant === 'footer') {
    return (
      <button
        type="button"
        onClick={open}
        className="text-white/85 transition-colors duration-200 hover:text-[var(--color-accent)]"
      >
        Accessibility Settings
      </button>
    )
  }
  return (
    <button
      type="button"
      onClick={open}
      className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-7 py-3.5 text-sm font-extrabold uppercase tracking-widest text-black transition hover:-translate-y-0.5"
      style={{ fontFamily: 'var(--font-brand)' }}
    >
      Open accessibility preferences
    </button>
  )
}
