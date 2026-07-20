'use client'

import { useEffect, useRef, useState } from 'react'

// Everything below the hero: a yellow "pill" that first pitches the pheno hunt
// (editorial two-column copy + a history statement + GET STARTED), then swaps
// into a one-question-at-a-time clickthrough form (same pattern as wholesale),
// ending in a "you're in the hunt" confirmation. Reveals via .pheno-reveal.

type Q = { key: string; label: string; hint?: string; type: string; placeholder: string; required: boolean; phone?: boolean }

const QUESTIONS: Q[] = [
  { key: 'firstName', label: "What's your first name?", type: 'text', placeholder: 'First name', required: true },
  { key: 'lastName', label: 'And your last name?', type: 'text', placeholder: 'Last name', required: true },
  { key: 'email', label: 'Best email to reach you?', hint: 'Where we send hunt drops + updates', type: 'email', placeholder: 'you@email.com', required: true },
  { key: 'phone', label: "What's your phone number?", type: 'tel', placeholder: '(555) 555-5555', required: true, phone: true },
  { key: 'shop', label: 'Where do you shop Jungle Boys?', hint: 'Store or city', type: 'text', placeholder: 'Store or city', required: true },
  { key: 'why', label: 'Why do you want to hunt with us?', hint: 'Optional — tell us your palate', type: 'text', placeholder: 'Flavors you chase…', required: false },
]

export default function PhenosJoin({ consentText }: { consentText: string }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  // scroll reveal (+ failsafe)
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const els = Array.from(root.querySelectorAll<HTMLElement>('.pheno-reveal'))
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
  function begin() {
    setStarted(true)
    // let it render, then bring the form into view
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
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
          topic: 'Pheno Hunt',
          message: [`Shops at: ${answers.shop ?? ''}`, `Why: ${answers.why || '—'}`].join('\n'),
          sourcePage: '/phenos',
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
    <div ref={rootRef} className="relative z-10 px-4 pb-24 md:px-8 lg:px-12">
      <div className="pheno-reveal mx-auto max-w-[1280px]">
        <div className="overflow-hidden rounded-[2.5rem] bg-[var(--color-accent)] text-black shadow-[0_50px_140px_-50px_rgba(254,207,14,0.7)]">
          {/* ============ PITCH ============ */}
          {!started && (
            <div className="p-7 md:p-14">
              <span className="text-xs font-extrabold uppercase tracking-[0.4em]" style={{ fontFamily: 'var(--font-brand)' }}>
                The Pheno Hunt
              </span>

              {/* editorial two-column copy */}
              <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-16">
                <div className="border-t-2 border-black/25 pt-6">
                  <span className="font-display text-2xl uppercase leading-none opacity-70">01 — First Look</span>
                  <h2 className="font-display mt-2 text-4xl uppercase leading-[0.92] md:text-5xl">
                    Straight from the cultivation rooms
                  </h2>
                  <p className="mt-5 text-[15px] font-medium leading-relaxed text-black/80 md:text-base">
                    This is your chance to exclusively experience what we&apos;re testing behind the scenes —
                    small-batch drops of unnamed, unreleased genetics before they earn an official name and a spot
                    in the Jungle Boys genetics library. Each 3.5g jar is premium indoor flower, hand-selected from
                    our latest pheno hunts — a first look and taste at what could become the next Jungle Boys strain.
                  </p>
                </div>
                <div className="border-t-2 border-black/25 pt-6">
                  <span className="font-display text-2xl uppercase leading-none opacity-70">02 — Your Call</span>
                  <h2 className="font-display mt-2 text-4xl uppercase leading-[0.92] md:text-5xl">
                    Tell us how it smokes. Help name it.
                  </h2>
                  <p className="mt-5 text-[15px] font-medium leading-relaxed text-black/80 md:text-base">
                    We want your feedback — how it looks, tastes, and smokes… and even what to call it. Your input
                    helps decide what makes the final cut, moves into full production, and ultimately, into the hands
                    of consumers.
                  </p>
                </div>
              </div>

              {/* history statement */}
              <h3 className="font-display mt-12 text-5xl uppercase leading-[0.9] md:mt-16 md:text-7xl xl:text-8xl">
                This is your chance to be a part of Jungle Boys history.
              </h3>

              <button
                type="button"
                onClick={begin}
                className="group mt-9 inline-flex items-center gap-3 rounded-full bg-black py-4 pl-8 pr-3 text-white transition-transform duration-200 hover:scale-[1.03] md:mt-12"
              >
                <span className="text-sm font-extrabold uppercase tracking-widest" style={{ fontFamily: 'var(--font-brand)' }}>
                  Get Started
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent)] text-black">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
            </div>
          )}

          {/* ============ FORM ============ */}
          {started && (
            <div ref={formRef} className="p-7 md:p-14">
              {state === 'done' ? (
                <div className="flex flex-col items-center gap-5 py-8 text-center">
                  <span className="text-xs font-extrabold uppercase tracking-[0.4em]" style={{ fontFamily: 'var(--font-brand)' }}>
                    You&apos;re in the hunt
                  </span>
                  <h3 className="font-display text-6xl uppercase leading-none md:text-8xl">Welcome to the hunt</h3>
                  <p className="max-w-xl text-sm font-medium uppercase leading-relaxed tracking-wide md:text-base" style={{ fontFamily: 'var(--font-brand)' }}>
                    Thanks for signing up. We&apos;ll reach out when the next pheno drop is ready — keep an eye on
                    your inbox. Your palate is now part of Jungle Boys history.
                  </p>
                </div>
              ) : (
                <>
                  {/* progress */}
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-widest" style={{ fontFamily: 'var(--font-brand)' }}>
                      Join the Hunt
                    </span>
                    <span className="text-xs font-bold tabular-nums" style={{ fontFamily: 'var(--font-brand)' }}>
                      {step + 1} / {total}
                    </span>
                  </div>
                  <div className="mb-10 h-1.5 w-full overflow-hidden rounded-full bg-black/15">
                    <div className="h-full rounded-full bg-black transition-all duration-500" style={{ width: `${((step + 1) / total) * 100}%` }} />
                  </div>

                  <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-14">
                    <div key={step} className="gate-in">
                      <span className="font-display block text-4xl uppercase leading-[0.95] md:text-6xl">{q.label}</span>
                      {q.hint && <span className="mt-3 block text-sm font-medium text-black/55">{q.hint}</span>}
                    </div>

                    <div>
                      {q.phone ? (
                        <div className="flex items-stretch overflow-hidden rounded-full bg-white">
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
                          className="w-full rounded-full bg-white px-6 py-4 text-lg text-black outline-none placeholder:text-black/30"
                        />
                      )}

                      {step === total - 1 && <p className="mt-5 text-[11px] leading-relaxed text-black/55">{consentText}</p>}
                      {state === 'error' && (
                        <p className="mt-4 text-sm font-semibold text-red-700" role="alert">
                          {error}
                        </p>
                      )}

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
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
