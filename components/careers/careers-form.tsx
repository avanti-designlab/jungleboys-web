'use client'

import { useEffect, useRef, useState } from 'react'

// Careers application — the phenos/wholesale questionnaire concept, hiring
// edition (Avanti, 2026-09-25: "same concept but for careers. upload resume
// option, and basic info. make it really design forward"). One question at a
// time, tap-to-answer pills auto-advance, a styled resume drop as the final
// step, POST /api/careers. Keyboard/viewport handling lifted from the phenos
// wizard (the visualViewport lesson).

const ROLES = [
  'Budtender / Retail',
  'Cultivation',
  'Processing & Trim',
  'Delivery Driver',
  'Security',
  'Marketing & Creative',
  'Office & Corporate',
]

const STORES = ['Downtown LA', 'Pomona', 'Orange County', 'San Diego', 'Any location']

const EXPERIENCE = ['New to the industry', '1-2 years', '3-5 years', '5+ years']

type Q = {
  key: string
  label: string
  hint?: string
  type: 'choice' | 'text' | 'email' | 'textarea' | 'resume'
  placeholder?: string
  required: boolean
  options?: string[]
}

const ALL_Q: Q[] = [
  { key: 'role', label: 'What do you want to do here?', type: 'choice', options: ROLES, required: true },
  { key: 'store', label: 'Which location fits you?', type: 'choice', options: STORES, required: true },
  { key: 'experience', label: 'How long have you been in cannabis?', hint: 'No experience needed for every role. Honesty is the flex.', type: 'choice', options: EXPERIENCE, required: true },
  { key: 'name', label: 'What is your name?', type: 'text', placeholder: 'First and last', required: true },
  { key: 'email', label: 'Where can we reach you?', type: 'email', placeholder: 'you@email.com', required: true },
  { key: 'phone', label: 'Best number to call?', hint: 'Optional, but interviews move faster', type: 'text', placeholder: '(555) 555-5555', required: false },
  { key: 'pitch', label: 'Why do you belong in the jungle?', hint: 'Two sentences beat two pages', type: 'textarea', placeholder: 'Tell us your story…', required: true },
  { key: 'resume', label: 'Drop your resume', hint: 'PDF or Word, up to 5MB. Optional, but it helps.', type: 'resume', required: false },
]

const MAX_RESUME = 5 * 1024 * 1024

export default function CareersForm() {
  const rootRef = useRef<HTMLDivElement>(null)
  const honeypotRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [resume, setResume] = useState<{ filename: string; dataBase64: string } | null>(null)
  const [fileError, setFileError] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  // keep the wizard usable with the on-screen keyboard up (phenos lesson:
  // svh never shrinks for the iOS keyboard; visualViewport is the truth)
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const root = document.documentElement
    const apply = () => {
      const open = vv.height < window.innerHeight - 120
      root.style.setProperty('--vvh', `${Math.round(vv.height)}px`)
      if (open) root.dataset.kb = '1'
      else delete root.dataset.kb
    }
    apply()
    vv.addEventListener('resize', apply)
    vv.addEventListener('scroll', apply)
    return () => {
      vv.removeEventListener('resize', apply)
      vv.removeEventListener('scroll', apply)
      delete root.dataset.kb
    }
  }, [])

  useEffect(() => {
    const onFocus = (e: FocusEvent) => {
      const el = e.target as HTMLElement
      if (!el.matches?.('input, textarea')) return
      window.setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 350)
    }
    document.addEventListener('focusin', onFocus)
    return () => document.removeEventListener('focusin', onFocus)
  }, [])

  const total = ALL_Q.length
  const q = ALL_Q[step]
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
  function choose(opt: string) {
    setAnswers((a) => ({ ...a, [q.key]: opt }))
    setTimeout(() => setStep((s) => (s < total - 1 ? s + 1 : s)), 240)
  }

  function onFile(file: File | undefined) {
    setFileError('')
    if (!file) return
    if (!/\.(pdf|docx?|)$/i.test(file.name) || !/\.(pdf|docx?)$/i.test(file.name)) {
      setFileError('PDF or Word documents only.')
      return
    }
    if (file.size > MAX_RESUME) {
      setFileError('That file is over 5MB. A lighter export works great.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const url = String(reader.result || '')
      const b64 = url.slice(url.indexOf(',') + 1)
      setResume({ filename: file.name, dataBase64: b64 })
    }
    reader.onerror = () => setFileError('Could not read that file, try again.')
    reader.readAsDataURL(file)
  }

  async function submit() {
    setState('sending')
    setError('')
    try {
      const res = await fetch('/api/careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: honeypotRef.current?.value ?? '',
          name: answers.name,
          email: answers.email,
          phone: answers.phone ?? '',
          role: answers.role,
          store: answers.store,
          experience: answers.experience ?? '',
          pitch: answers.pitch ?? '',
          resume: resume ?? undefined,
        }),
      })
      if (!res.ok) {
        const b = await res.json().catch(() => ({}))
        throw new Error(b.error ?? 'Something went wrong, please try again.')
      }
      setState('done')
    } catch (err) {
      setState('error')
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  const autoAdvance = q?.type === 'choice'
  const pill = (active: boolean) =>
    `w-full rounded-full border-2 px-6 py-4 text-left text-sm font-extrabold uppercase tracking-widest transition ${
      active
        ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-black'
        : 'border-black/15 text-black hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/15'
    }`

  return (
    <div ref={rootRef} className="relative z-10">
      <input ref={honeypotRef} name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <div
        id="apply"
        className="pheno-form-panel flex h-[calc(100svh-7.5rem)] max-h-[780px] scroll-mt-28 flex-col rounded-[2.25rem] bg-white p-6 pb-24 text-black shadow-[0_50px_140px_-40px_rgba(0,0,0,0.8)] md:h-auto md:max-h-none md:min-h-[560px] md:justify-center md:p-14 md:pb-14"
      >
        {state === 'done' ? (
          <div className="flex flex-col items-center gap-5 py-8 text-center">
            <span className="text-xs font-extrabold uppercase tracking-[0.4em] text-black/60" style={{ fontFamily: 'var(--font-brand)' }}>
              Application received
            </span>
            <h3 className="font-display text-6xl uppercase leading-none md:text-8xl">Welcome to the hunt</h3>
            <p className="max-w-xl text-sm font-medium uppercase leading-relaxed tracking-wide text-black/70 md:text-base" style={{ fontFamily: 'var(--font-brand)' }}>
              Your application is in. If it is a fit, the team reaches out directly. Keep playing with fire.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5 shrink-0 md:mb-10">
              <span className="text-xs font-extrabold uppercase tracking-[0.4em] text-black/60" style={{ fontFamily: 'var(--font-brand)' }}>
                Careers
              </span>
              <h3 className="font-display mt-2 text-3xl uppercase leading-[0.88] md:text-7xl">Run with the Jungle Boys</h3>
            </div>

            <div className="mb-3 flex shrink-0 items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-widest text-black/60" style={{ fontFamily: 'var(--font-brand)' }}>
                {autoAdvance ? 'Tap to answer' : q.type === 'resume' ? 'Last step' : 'Your answer'}
              </span>
              <span className="text-xs font-bold tabular-nums text-black/60" style={{ fontFamily: 'var(--font-brand)' }}>
                {step + 1} / {total}
              </span>
            </div>
            <div className="mb-6 h-1.5 w-full shrink-0 overflow-hidden rounded-full bg-black/10 md:mb-10">
              <div className="h-full rounded-full bg-black transition-all duration-500" style={{ width: `${((step + 1) / total) * 100}%` }} />
            </div>

            <div className="grid min-h-0 flex-1 content-center gap-5 overflow-y-auto md:grid-cols-2 md:items-center md:gap-14 md:overflow-visible">
              <div key={step} className="gate-in">
                <span className="font-display block text-[1.75rem] uppercase leading-[0.95] md:text-6xl">{q.label}</span>
                {q.hint && <span className="mt-3 block text-sm font-medium text-black/60">{q.hint}</span>}
              </div>

              <div>
                {q.type === 'choice' && (
                  <div className="flex flex-col gap-3">
                    {q.options!.map((opt) => (
                      <button key={opt} type="button" onClick={() => choose(opt)} className={pill(value === opt)} style={{ fontFamily: 'var(--font-brand)' }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {(q.type === 'text' || q.type === 'email') && (
                  <input
                    type={q.type === 'email' ? 'email' : 'text'}
                    value={value}
                    placeholder={q.placeholder}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && next()}
                    className="w-full rounded-full border-2 border-black/15 px-6 py-4 text-base font-bold outline-none transition focus:border-[var(--color-accent)]"
                    style={{ fontFamily: 'var(--font-brand)' }}
                  />
                )}

                {q.type === 'textarea' && (
                  <textarea
                    value={value}
                    placeholder={q.placeholder}
                    onChange={(e) => setValue(e.target.value)}
                    rows={5}
                    className="w-full rounded-[1.75rem] border-2 border-black/15 px-6 py-4 text-base font-bold outline-none transition focus:border-[var(--color-accent)]"
                    style={{ fontFamily: 'var(--font-brand)' }}
                  />
                )}

                {q.type === 'resume' && (
                  <div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => onFile(e.target.files?.[0])}
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className={`flex w-full flex-col items-center gap-3 rounded-[1.75rem] border-2 border-dashed px-6 py-10 transition ${
                        resume ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'border-black/25 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10'
                      }`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-9 w-9" aria-hidden>
                        <path d="M12 16V4m0 0 4 4m-4-4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M4 15v3.5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V15" strokeLinecap="round" />
                      </svg>
                      <span className="text-sm font-extrabold uppercase tracking-widest" style={{ fontFamily: 'var(--font-brand)' }}>
                        {resume ? resume.filename : 'Tap to upload your resume'}
                      </span>
                      <span className="text-xs font-medium text-black/50">{resume ? 'Attached. Tap to swap it.' : 'PDF, DOC or DOCX, max 5MB'}</span>
                    </button>
                    {fileError && (
                      <p className="mt-3 text-sm font-bold text-[#c21f1f]" style={{ fontFamily: 'var(--font-brand)' }}>
                        {fileError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* footer controls */}
            <div className="mt-6 flex shrink-0 items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0 || state === 'sending'}
                className="text-xs font-extrabold uppercase tracking-widest text-black/50 transition hover:text-black disabled:opacity-0"
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                ← Back
              </button>
              {!autoAdvance && (
                <button
                  type="button"
                  onClick={next}
                  disabled={!canAdvance() || state === 'sending'}
                  className="rounded-full bg-black px-9 py-4 text-sm font-extrabold uppercase tracking-widest text-white transition enabled:hover:bg-[var(--color-accent)] enabled:hover:text-black disabled:opacity-30"
                  style={{ fontFamily: 'var(--font-brand)' }}
                >
                  {state === 'sending' ? 'Sending…' : step === total - 1 ? 'Send application' : q.required ? 'Next' : 'Next / skip'}
                </button>
              )}
            </div>
            {state === 'error' && (
              <p className="mt-3 text-sm font-bold text-[#c21f1f]" style={{ fontFamily: 'var(--font-brand)' }}>
                {error}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
