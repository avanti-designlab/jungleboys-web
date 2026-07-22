'use client'

import { useEffect, useRef, useState } from 'react'

// Mailing-list popup. Collects name / phone / email + a preferred CA store, posts
// to /api/lead (Supabase consent ledger → Klaviyo, swappable to Dutchie later).
// The verbatim TCPA consent is shown at point of capture AND logged server-side
// with every opt-in (07 §4 cannabis compliance). Shown once per visitor, only
// after the age gate, and only after a scroll / delay (never an instant pop-up).

const SEEN_KEY = 'jb-newsletter'
const CA_LOCATIONS = ['Downtown LA', 'Orange County', 'Pomona', 'San Diego']

export default function NewsletterPopup({ consentText }: { consentText: string }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')
  const [location, setLocation] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)

  // ── trigger: once per visitor, after the age gate, on scroll or a delay ──
  useEffect(() => {
    try {
      if (localStorage.getItem(SEEN_KEY)) return
    } catch {}
    let fired = false
    let timer = 0
    const reveal = () => {
      if (fired) return
      fired = true
      window.removeEventListener('scroll', onScroll)
      window.clearTimeout(timer)
      setOpen(true)
      requestAnimationFrame(() => setMounted(true))
    }
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 0.6) reveal()
    }
    const arm = () => {
      timer = window.setTimeout(reveal, 15000)
      window.addEventListener('scroll', onScroll, { passive: true })
    }
    let gateVerified = false
    try {
      gateVerified = !!localStorage.getItem('jb-age-gate')
    } catch {}
    if (gateVerified) arm()
    else window.addEventListener('jb:gate-passed', arm, { once: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('jb:gate-passed', arm)
      window.clearTimeout(timer)
    }
  }, [])

  // ── explicit open (footer "Let's Stay In Touch") — ignores the once-per-visit rule ──
  useEffect(() => {
    const openNow = () => {
      setState('idle')
      setError('')
      setOpen(true)
      requestAnimationFrame(() => setMounted(true))
    }
    window.addEventListener('jb:open-newsletter', openNow)
    return () => window.removeEventListener('jb:open-newsletter', openNow)
  }, [])

  const dismiss = () => {
    try {
      localStorage.setItem(SEEN_KEY, '1')
    } catch {}
    setMounted(false)
    window.setTimeout(() => setOpen(false), 250)
  }

  // ESC to close
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && dismiss()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())
    setState('sending')
    setError('')
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone ? `+1${String(data.phone).replace(/\D/g, '')}` : '',
          company: data.company, // honeypot
          location,
          topic: 'Newsletter',
          sourcePage: `${window.location.pathname} (newsletter-popup)`,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Something went wrong — please try again.')
      }
      try {
        localStorage.setItem(SEEN_KEY, '1')
      } catch {}
      setState('done')
    } catch (err) {
      setState('error')
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[1300] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Join the Jungle Boys list"
    >
      {/* backdrop */}
      <button
        aria-label="Close"
        onClick={dismiss}
        className={`absolute inset-0 cursor-default bg-black/75 backdrop-blur-sm transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* modal */}
      <div
        ref={dialogRef}
        className={`relative w-full max-w-md overflow-hidden rounded-[1.75rem] bg-[#0b0b0d] text-[#F5F5F0] shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/10 transition-all duration-300 ${mounted ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-6 scale-95 opacity-0'}`}
      >
        {/* accent glow header */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40" style={{ background: 'radial-gradient(90% 100% at 50% 0%, rgba(254,207,14,0.28), transparent 70%)' }} />

        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 ring-1 ring-white/15 transition-colors hover:bg-white/20 hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-4 w-4"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
        </button>

        <div className="relative px-7 pb-7 pt-9">
          {state === 'done' ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)] text-2xl text-black">🌴</div>
              <h2 className="font-display text-4xl uppercase leading-none">You&apos;re in</h2>
              <p className="mx-auto mt-3 max-w-xs text-sm text-white/60">Welcome to the jungle. Watch your phone — the fire drops first here.</p>
              <button onClick={dismiss} className="mt-6 rounded-full bg-white/10 px-6 py-2.5 text-xs font-extrabold uppercase tracking-widest ring-1 ring-white/15 transition-colors hover:bg-white/20" style={{ fontFamily: 'var(--font-brand)' }}>
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-brand)' }}>
                  Join the list
                </p>
                <h2 className="font-display mt-1 text-4xl uppercase leading-[0.9] md:text-[2.75rem]">Never miss the fire</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  Sign up for the latest drops, deals, and announcements — and never miss out on the fire.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <input name="name" required autoComplete="name" placeholder="Full name" maxLength={80}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base placeholder:text-white/35 focus:border-[var(--color-accent)] focus:outline-none" />
                <div className="flex items-stretch overflow-hidden rounded-xl border border-white/15 bg-white/5 focus-within:border-[var(--color-accent)]">
                  <span className="flex items-center border-r border-white/15 px-3 text-sm font-bold text-white/60" style={{ fontFamily: 'var(--font-brand)' }}>+1</span>
                  <input name="phone" type="tel" required autoComplete="tel-national" inputMode="numeric" placeholder="Phone number" maxLength={14}
                    className="w-full bg-transparent px-4 py-3 text-base placeholder:text-white/35 focus:outline-none" />
                </div>
                <input name="email" type="email" required autoComplete="email" placeholder="Email address" maxLength={120}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base placeholder:text-white/35 focus:border-[var(--color-accent)] focus:outline-none" />
              </div>

              {/* preferred store */}
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50" style={{ fontFamily: 'var(--font-brand)' }}>
                  Your store (optional)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {CA_LOCATIONS.map((loc) => {
                    const active = location === loc
                    return (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setLocation(active ? '' : loc)}
                        className={`rounded-full px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${active ? 'bg-[var(--color-accent)] text-black' : 'bg-white/5 text-white/70 ring-1 ring-inset ring-white/15 hover:bg-white/10'}`}
                        style={{ fontFamily: 'var(--font-brand)' }}
                      >
                        {loc}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* honeypot */}
              <input name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

              {state === 'error' && <p className="text-sm text-red-400" role="alert">{error}</p>}

              <button
                type="submit"
                disabled={state === 'sending'}
                className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] py-3.5 text-sm font-extrabold uppercase tracking-widest text-black transition-transform duration-200 hover:scale-[1.02] disabled:opacity-60"
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                {state === 'sending' ? 'Signing up…' : 'Sign me up'}
                {state !== 'sending' && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" className="h-4 w-4"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )}
              </button>

              <p className="text-[10px] leading-relaxed text-white/35">{consentText}</p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
