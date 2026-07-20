'use client'

import { useEffect, useRef, useState } from 'react'
import { BRAND_ASSETS } from '@/lib/site-config'

// Everything below the wholesale banner: JB × Nabis intro, then a
// one-question-at-a-time clickthrough form in a yellow pill, ending in a
// Next Steps → Nabis portal handoff. Scroll reveals use the shared
// .media-reveal / .ws-logos + .is-in utilities toggled by one scroll handler.

// Placeholder Nabis wordmark — swap for the official Nabis asset when supplied.
const NABIS_PORTAL = 'https://nabis.com' // confirm exact "register" URL

type Q = { key: string; label: string; hint?: string; type: string; placeholder: string; required: boolean; phone?: boolean }

const QUESTIONS: Q[] = [
  { key: 'firstName', label: "What's your first name?", type: 'text', placeholder: 'First name', required: true },
  { key: 'lastName', label: 'And your last name?', type: 'text', placeholder: 'Last name', required: true },
  { key: 'email', label: 'Best email to reach you?', type: 'email', placeholder: 'you@store.com', required: true },
  { key: 'phone', label: "What's your phone number?", type: 'tel', placeholder: '(555) 555-5555', required: true, phone: true },
  { key: 'storeName', label: 'Which store are you with?', hint: 'Your dispensary or retail name', type: 'text', placeholder: 'Store name', required: true },
  { key: 'storeAddress', label: 'Where is the store located?', type: 'text', placeholder: '123 Main St, City, CA', required: true },
  { key: 'website', label: 'Got a website?', hint: 'Optional', type: 'url', placeholder: 'https://…', required: false },
  { key: 'license', label: "What's your CA license #?", type: 'text', placeholder: 'C10-0000000-LIC', required: true },
]

function NabisMark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 48 48" className="h-9 w-9 md:h-11 md:w-11" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
        <circle cx="24" cy="24" r="21" />
        <line x1="24" y1="3" x2="24" y2="45" />
        <line x1="24" y1="24" x2="9.6" y2="38.4" />
        <line x1="24" y1="24" x2="38.4" y2="38.4" />
      </svg>
      <span className="text-3xl font-light tracking-[0.18em] md:text-4xl">NABIS</span>
    </span>
  )
}

export default function WholesaleBody({ consentText }: { consentText: string }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  // scroll reveals (+ failsafe so nothing stays hidden)
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const els = Array.from(root.querySelectorAll<HTMLElement>('.media-reveal, .ws-logos'))
    let raf = 0
    const reveal = () => {
      raf = 0
      els.forEach((el) => {
        if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < window.innerHeight * 0.9) el.classList.add('is-in')
      })
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(reveal)
    }
    const t = setTimeout(reveal, 200)
    const fs = setTimeout(() => els.forEach((el) => el.classList.add('is-in')), 2600)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      clearTimeout(t)
      clearTimeout(fs)
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const q = QUESTIONS[step]
  const total = QUESTIONS.length
  const value = answers[q?.key] ?? ''

  function setValue(v: string) {
    setAnswers((a) => ({ ...a, [q.key]: v }))
  }

  function canAdvance() {
    if (!q.required) return true
    const v = value.trim()
    if (!v) return false
    if (q.type === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
    return true
  }

  function next() {
    if (!canAdvance()) return
    if (step < total - 1) setStep((s) => s + 1)
    else submit()
  }

  async function submit() {
    setState('sending')
    setError('')
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${answers.firstName ?? ''} ${answers.lastName ?? ''}`.trim(),
          email: answers.email,
          phone: answers.phone ? `+1${String(answers.phone).replace(/\D/g, '')}` : '',
          topic: 'Wholesale',
          message: [
            `Store: ${answers.storeName ?? ''}`,
            `Address: ${answers.storeAddress ?? ''}`,
            `Website: ${answers.website || '—'}`,
            `CA License: ${answers.license ?? ''}`,
          ].join('\n'),
          sourcePage: '/wholesale',
        }),
      })
      if (!res.ok) {
        const b = await res.json().catch(() => ({}))
        throw new Error(b.error ?? 'Something went wrong — please try again.')
      }
      setState('done')
    } catch (err) {
      setState('error')
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  return (
    <div ref={rootRef}>
      {/* intro: heading + JB × Nabis + paragraph */}
      <section className="px-4 pt-16 md:px-8 md:pt-24 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="media-reveal font-display text-4xl uppercase leading-[0.92] text-[var(--color-foreground)] md:text-6xl">
            Want to carry Jungle Boys products at your dispensary?
          </h2>

          <div className="ws-logos mt-10 flex items-center justify-center gap-6 text-[var(--color-foreground)] md:gap-10">
            <span className="ws-l inline-flex h-16 w-24 items-center justify-center md:h-20 md:w-32">
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG logo */}
              <img src={BRAND_ASSETS.logoBlack} alt="Jungle Boys" className="light-hide h-full w-full object-contain" />
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG logo */}
              <img src={BRAND_ASSETS.logoWhite} alt="" aria-hidden className="dark-only h-full w-full object-contain" />
            </span>
            <span className="ws-x font-display text-4xl text-[var(--color-muted)] md:text-5xl">×</span>
            <NabisMark className="ws-r text-[var(--color-foreground)]" />
          </div>

          <p className="media-reveal mx-auto mt-10 max-w-2xl text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
            From exclusive genetics to top-shelf flower, our products move fast and speak for themselves.{' '}
            <span className="font-semibold text-[var(--color-foreground)]">Let&apos;s get you playing with fire.</span>
          </p>
        </div>
      </section>

      {/* yellow pill: clickthrough form / next steps */}
      <section className="px-4 pt-14 md:px-8 md:pt-20 lg:px-12">
        <div className="media-reveal mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-[2.5rem] bg-[var(--color-accent)] p-6 shadow-[0_40px_120px_-40px_rgba(254,207,14,0.6)] md:p-12">
            {state === 'done' ? (
              <div className="text-center text-black">
                <h3 className="font-display text-5xl uppercase leading-none md:text-7xl">Next Steps</h3>
                <p className="mx-auto mt-6 max-w-md text-sm font-medium uppercase leading-relaxed tracking-wide md:text-base" style={{ fontFamily: 'var(--font-brand)' }}>
                  Thank you for submitting your information. A Jungle Boys team member will be in contact within 24 hours.
                </p>
                <p className="mx-auto mt-4 max-w-md text-sm font-medium uppercase leading-relaxed tracking-wide md:text-base" style={{ fontFamily: 'var(--font-brand)' }}>
                  Click below to register with Nabis Distribution to place your first order.
                </p>
                <a
                  href={NABIS_PORTAL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center justify-center rounded-full bg-black px-8 py-4 text-white transition-transform duration-200 hover:scale-[1.03]"
                >
                  <NabisMark />
                </a>
              </div>
            ) : (
              <div className="text-black">
                {/* progress */}
                <div className="mb-8 flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-widest" style={{ fontFamily: 'var(--font-brand)' }}>
                    Become a Retailer
                  </span>
                  <span className="text-xs font-bold tabular-nums" style={{ fontFamily: 'var(--font-brand)' }}>
                    {step + 1} / {total}
                  </span>
                </div>
                <div className="mb-10 h-1.5 w-full overflow-hidden rounded-full bg-black/15">
                  <div className="h-full rounded-full bg-black transition-all duration-500" style={{ width: `${((step + 1) / total) * 100}%` }} />
                </div>

                {/* question (re-keyed so it animates on change) */}
                <div key={step} className="min-h-[168px] gate-in">
                  <label className="block">
                    <span className="font-display block text-3xl uppercase leading-[0.95] md:text-5xl">{q.label}</span>
                    {q.hint && <span className="mt-2 block text-sm font-medium text-black/55">{q.hint}</span>}
                    {q.phone ? (
                      <div className="mt-6 flex items-stretch overflow-hidden rounded-full bg-white">
                        <span className="flex items-center border-r border-black/10 px-4 text-sm font-bold text-black/60" style={{ fontFamily: 'var(--font-brand)' }}>
                          US +1
                        </span>
                        <input
                          autoFocus
                          type="tel"
                          inputMode="numeric"
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && next()}
                          placeholder={q.placeholder}
                          className="w-full bg-transparent px-5 py-4 text-lg text-black outline-none placeholder:text-black/30"
                        />
                      </div>
                    ) : (
                      <input
                        autoFocus
                        type={q.type}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && next()}
                        placeholder={q.placeholder}
                        className="mt-6 w-full rounded-full bg-white px-6 py-4 text-lg text-black outline-none placeholder:text-black/30"
                      />
                    )}
                  </label>
                </div>

                {step === total - 1 && (
                  <p className="mt-6 text-[11px] leading-relaxed text-black/55">{consentText}</p>
                )}
                {state === 'error' && (
                  <p className="mt-4 text-sm font-semibold text-red-700" role="alert">
                    {error}
                  </p>
                )}

                {/* nav */}
                <div className="mt-8 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0}
                    className="rounded-full px-5 py-3 text-xs font-bold uppercase tracking-widest text-black/60 transition hover:text-black disabled:opacity-0"
                    style={{ fontFamily: 'var(--font-brand)' }}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    disabled={!canAdvance() || state === 'sending'}
                    className="rounded-full bg-black px-8 py-4 text-sm font-extrabold uppercase tracking-widest text-white transition-transform duration-200 hover:scale-[1.03] disabled:opacity-40"
                    style={{ fontFamily: 'var(--font-brand)' }}
                  >
                    {state === 'sending' ? 'Sending…' : step === total - 1 ? 'Submit →' : 'Next →'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
