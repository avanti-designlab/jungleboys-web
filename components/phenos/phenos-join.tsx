'use client'

import { useEffect, useRef, useState } from 'react'

// Below the hero: three yellow pills — two copy pills on top (the pheno-hunt
// pitch) and a form pill on the bottom. The form pill opens on a history
// statement + GET STARTED, then swaps into a one-question-at-a-time sign-up
// (full name, email, phone, which CA store as pills, why) → /api/lead.

const CA_STORES = ['Downtown Los Angeles', 'Orange County', 'Pomona', 'San Diego']

type Q = {
  key: string
  label: string
  hint?: string
  type: 'text' | 'email' | 'tel' | 'choice'
  placeholder?: string
  required: boolean
  phone?: boolean
  options?: string[]
}

const QUESTIONS: Q[] = [
  { key: 'fullName', label: "What's your name?", type: 'text', placeholder: 'Full name', required: true },
  { key: 'email', label: 'Best email to reach you?', hint: 'Where we send hunt drops + updates', type: 'email', placeholder: 'you@email.com', required: true },
  { key: 'phone', label: "What's your phone number?", type: 'tel', placeholder: '(555) 555-5555', required: true, phone: true },
  { key: 'shop', label: 'Which store do you shop at?', type: 'choice', options: CA_STORES, required: true },
  { key: 'why', label: 'Why do you want to hunt with us?', hint: 'Optional — tell us your palate', type: 'text', placeholder: 'Flavors you chase…', required: false },
]

export default function PhenosJoin({ consentText }: { consentText: string }) {
  const rootRef = useRef<HTMLDivElement>(null)
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
  // pick a pill option → set + auto-advance (last step would submit)
  function choose(opt: string) {
    setAnswers((a) => ({ ...a, [q.key]: opt }))
    setTimeout(() => (step < total - 1 ? setStep((s) => s + 1) : submit()), 240)
  }

  async function submit() {
    setState('sending')
    setError('')
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: (answers.fullName ?? '').trim(),
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

  const pill = 'rounded-[2.25rem] bg-[var(--color-accent)] text-black shadow-[0_40px_120px_-50px_rgba(254,207,14,0.7)]'

  return (
    <div ref={rootRef} className="relative z-10 px-4 pb-24 md:px-8 lg:px-12">
      <div className="mx-auto max-w-[1280px]">
        {/* ===== two copy pills on top ===== */}
        <div className="grid gap-5 md:grid-cols-2 md:gap-6">
          <div className={`pheno-reveal flex flex-col ${pill} p-8 md:p-11`}>
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
          <div className={`pheno-reveal flex flex-col ${pill} p-8 md:p-11`}>
            <span className="font-display text-2xl uppercase leading-none opacity-70">02 — Your Call</span>
            <h2 className="font-display mt-2 text-4xl uppercase leading-[0.92] md:text-5xl">
              Tell us how it smokes. Help name it.
            </h2>
            <p className="mt-5 text-[15px] font-medium leading-relaxed text-black/80 md:text-base">
              We want your feedback — how it looks, tastes, and smokes… and even what to call it. Your input
              helps decide what makes the final cut, moves into full production, and ultimately, into the hands
              of consumers. This is your chance to be a part of Jungle Boys history.
            </p>
          </div>
        </div>

        {/* ===== form pill on the bottom (always present — GET STARTED scrolls here) ===== */}
        <div id="join" className={`pheno-reveal mt-5 scroll-mt-28 ${pill} p-7 md:mt-6 md:p-14`}>
          {state === 'done' ? (
            <div className="flex flex-col items-center gap-5 py-8 text-center text-black">
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
            <div className="text-black">
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
                  {q.type === 'choice' ? (
                    <div className="flex flex-wrap gap-3">
                      {q.options!.map((opt) => {
                        const active = value === opt
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => choose(opt)}
                            className={`rounded-full border-2 px-6 py-3 text-sm font-extrabold uppercase tracking-wide transition ${
                              active ? 'border-black bg-black text-[var(--color-accent)]' : 'border-black/25 text-black hover:border-black'
                            }`}
                            style={{ fontFamily: 'var(--font-brand)' }}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  ) : q.phone ? (
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
                    {/* choice steps auto-advance; hide Next there unless already chosen */}
                    {!(q.type === 'choice' && !value) && (
                      <button
                        type="button"
                        onClick={next}
                        disabled={!canAdvance() || state === 'sending'}
                        className="rounded-full bg-black px-8 py-4 text-sm font-extrabold uppercase tracking-widest text-white transition-transform duration-200 hover:scale-[1.03] disabled:opacity-40"
                        style={{ fontFamily: 'var(--font-brand)' }}
                      >
                        {state === 'sending' ? 'Sending…' : step === total - 1 ? 'Submit →' : 'Next →'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
