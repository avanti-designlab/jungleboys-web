'use client'

import { useEffect, useRef, useState } from 'react'

// Below the hero: two yellow pitch pills on top + a WHITE feedback pill on the
// bottom that rebuilds the original "share your feedback WITH US!" pheno-tasting
// survey as a one-question-at-a-time flow → /api/lead. GET STARTED (in the hero)
// smooth-scrolls to the white pill, which is tall enough to fill the viewport.

// The pheno batches rotate per drop — these mirror the current jar labels and
// should move to the CMS later.
const PHENOS = [
  'Mimosa x LCJ',
  'Gelonade x Zangria',
  'Blue Cheese x Sex on the Beach x G@’1 Cake',
  'Rainbow Belts x OG OG',
]

type Q = {
  key: string
  label: string
  hint?: string
  type: 'choice' | 'scale' | 'textarea' | 'yesno' | 'text' | 'email'
  placeholder?: string
  required: boolean
  options?: string[]
}

// Original survey fields + name/email so the feedback is attributable (the live
// form captured identity via the batch app login, which we don't have here).
const ALL_Q: Q[] = [
  { key: 'pheno', label: 'Which pheno are you testing?', type: 'choice', options: PHENOS, required: true },
  { key: 'appeal', label: 'Rate the overall nug appeal', hint: '1 = low · 10 = fire', type: 'scale', required: true },
  { key: 'look', label: 'Describe the look of the nugs', hint: 'Talk nug density, color, trichome coverage, shape, etc.', type: 'textarea', placeholder: 'What are you seeing?', required: true },
  { key: 'cut', label: 'Should this pheno make the cut?', type: 'yesno', required: true },
  { key: 'why', label: 'If no — tell us why?', hint: 'What held it back?', type: 'textarea', placeholder: 'Your honest take…', required: false },
  { key: 'name', label: "What's your name?", type: 'text', placeholder: 'Full name', required: true },
  { key: 'email', label: 'Best email to reach you?', hint: 'So we can follow up on the hunt', type: 'email', placeholder: 'you@email.com', required: true },
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

  // "why" only appears when they answered No to the cut question
  const questions = ALL_Q.filter((q) => q.key !== 'why' || answers.cut === 'No')
  const q = questions[Math.min(step, questions.length - 1)]
  const total = questions.length
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
  // tap-to-pick fields set + auto-advance
  function choose(key: string, opt: string) {
    setAnswers((a) => ({ ...a, [key]: opt }))
    setTimeout(() => setStep((s) => (s < total - 1 ? s + 1 : s)), 240)
  }

  async function submit() {
    setState('sending')
    setError('')
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: (answers.name ?? '').trim(),
          email: answers.email,
          phone: '',
          topic: 'Pheno Feedback',
          message: [
            `Pheno: ${answers.pheno ?? ''}`,
            `Nug appeal (1-10): ${answers.appeal ?? ''}`,
            `Look: ${answers.look ?? ''}`,
            `Make the cut?: ${answers.cut ?? ''}`,
            answers.cut === 'No' ? `Why not: ${answers.why || '—'}` : null,
          ]
            .filter(Boolean)
            .join('\n'),
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

  const yellowPill = 'rounded-[2.25rem] bg-[var(--color-accent)] text-black shadow-[0_40px_120px_-50px_rgba(254,207,14,0.6)]'
  const field =
    'w-full rounded-full border-2 border-black/10 bg-black/[0.04] px-6 py-4 text-lg text-black outline-none transition-colors placeholder:text-black/30 focus:border-black'

  return (
    <div ref={rootRef} className="relative z-10 px-4 pb-16 md:px-8 lg:px-12">
      <div className="mx-auto max-w-[1280px]">
        {/* ===== two yellow pitch pills on top ===== */}
        <div className="grid gap-5 md:grid-cols-2 md:gap-6">
          <PitchPill
            className={yellowPill}
            num="01"
            tag="Exclusive Access"
            heading="Straight from the cultivation rooms"
          >
            Small-batch drops of unnamed, unreleased genetics — pulled from our latest pheno hunts before they
            earn a name and a spot in the Jungle Boys genetics library. Each 3.5g jar is premium indoor flower:
            a first look and taste at what could become the next Jungle Boys strain.
          </PitchPill>
          <PitchPill
            className={yellowPill}
            num="02"
            tag="Your Call"
            heading="You decide what makes the cut"
          >
            Tell us how it looks, tastes, and smokes — and even help name it. Your feedback decides what makes the
            final cut, moves into full production, and lands in the hands of consumers. This is your chance to be a
            part of Jungle Boys history.
          </PitchPill>
        </div>

        {/* ===== WHITE feedback pill on the bottom (GET STARTED scrolls here) ===== */}
        <div
          id="join"
          className="pheno-reveal mt-5 flex min-h-[76vh] scroll-mt-24 flex-col justify-center rounded-[2.25rem] bg-white p-7 text-black shadow-[0_50px_140px_-40px_rgba(0,0,0,0.8)] md:mt-6 md:p-14"
        >
          {state === 'done' ? (
            <div className="flex flex-col items-center gap-5 py-8 text-center">
              <span className="text-xs font-extrabold uppercase tracking-[0.4em] text-black/60" style={{ fontFamily: 'var(--font-brand)' }}>
                Feedback received
              </span>
              <h3 className="font-display text-6xl uppercase leading-none md:text-8xl">You&apos;re part of the hunt</h3>
              <p className="max-w-xl text-sm font-medium uppercase leading-relaxed tracking-wide text-black/70 md:text-base" style={{ fontFamily: 'var(--font-brand)' }}>
                Thanks for weighing in — your take now helps decide what makes the final cut. Keep an eye out for
                the next pheno drop.
              </p>
            </div>
          ) : (
            <>
              {/* header */}
              <div className="mb-8 md:mb-10">
                <span className="text-xs font-extrabold uppercase tracking-[0.4em] text-black/50" style={{ fontFamily: 'var(--font-brand)' }}>
                  Pheno Hunt
                </span>
                <h3 className="font-display mt-2 text-5xl uppercase leading-[0.88] md:text-7xl">
                  Share your feedback with us!
                </h3>
              </div>

              {/* progress */}
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-widest text-black/60" style={{ fontFamily: 'var(--font-brand)' }}>
                  {q.type === 'choice' || q.type === 'yesno' || q.type === 'scale' ? 'Tap to answer' : 'Your answer'}
                </span>
                <span className="text-xs font-bold tabular-nums text-black/60" style={{ fontFamily: 'var(--font-brand)' }}>
                  {step + 1} / {total}
                </span>
              </div>
              <div className="mb-10 h-1.5 w-full overflow-hidden rounded-full bg-black/10">
                <div className="h-full rounded-full bg-black transition-all duration-500" style={{ width: `${((step + 1) / total) * 100}%` }} />
              </div>

              <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-14">
                <div key={step} className="gate-in">
                  <span className="font-display block text-4xl uppercase leading-[0.95] md:text-6xl">{q.label}</span>
                  {q.hint && <span className="mt-3 block text-sm font-medium text-black/50">{q.hint}</span>}
                </div>

                <div>
                  {q.type === 'choice' && (
                    <div className="flex flex-col gap-3">
                      {q.options!.map((opt) => (
                        <Pill key={opt} block active={value === opt} onClick={() => choose('pheno', opt)}>
                          {opt}
                        </Pill>
                      ))}
                    </div>
                  )}

                  {q.type === 'scale' && (
                    <div className="flex flex-wrap gap-2.5">
                      {Array.from({ length: 10 }, (_, n) => String(n + 1)).map((n) => {
                        const active = value === n
                        return (
                          <button
                            key={n}
                            type="button"
                            onClick={() => choose('appeal', n)}
                            className={`h-12 w-12 rounded-full border-2 text-base font-extrabold tabular-nums transition ${
                              active ? 'border-black bg-black text-white' : 'border-black/15 text-black hover:border-black'
                            }`}
                            style={{ fontFamily: 'var(--font-brand)' }}
                          >
                            {n}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {q.type === 'yesno' && (
                    <div className="flex gap-3">
                      {['Yes', 'No'].map((opt) => (
                        <Pill key={opt} active={value === opt} wide onClick={() => choose('cut', opt)}>
                          {opt}
                        </Pill>
                      ))}
                    </div>
                  )}

                  {q.type === 'textarea' && (
                    <textarea
                      autoFocus
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder={q.placeholder}
                      rows={4}
                      className="min-h-[130px] w-full resize-none rounded-2xl border-2 border-black/10 bg-black/[0.04] px-6 py-4 text-base text-black outline-none transition-colors placeholder:text-black/30 focus:border-black"
                    />
                  )}

                  {(q.type === 'text' || q.type === 'email') && (
                    <input
                      autoFocus
                      type={q.type}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && next()}
                      placeholder={q.placeholder}
                      className={field}
                    />
                  )}

                  {q.key === 'email' && <p className="mt-5 text-[11px] leading-relaxed text-black/45">{consentText}</p>}
                  {state === 'error' && (
                    <p className="mt-4 text-sm font-semibold text-red-600" role="alert">
                      {error}
                    </p>
                  )}

                  <div className="mt-8 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setStep((s) => Math.max(0, s - 1))}
                      disabled={step === 0}
                      className="rounded-full px-5 py-3 text-xs font-bold uppercase tracking-widest text-black/50 transition hover:text-black disabled:opacity-0"
                      style={{ fontFamily: 'var(--font-brand)' }}
                    >
                      ← Back
                    </button>
                    {/* tap-to-pick fields auto-advance; hide Next until an answer exists */}
                    {!((q.type === 'choice' || q.type === 'yesno' || q.type === 'scale') && !value) && (
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function PitchPill({
  className,
  num,
  tag,
  heading,
  children,
}: {
  className: string
  num: string
  tag: string
  heading: string
  children: React.ReactNode
}) {
  return (
    <div className={`pheno-reveal relative flex flex-col overflow-hidden p-8 md:p-11 ${className}`}>
      {/* oversized number watermark */}
      <span aria-hidden className="font-display pointer-events-none absolute -right-2 -top-10 select-none text-[11rem] leading-none text-black/10 md:text-[15rem]">
        {num}
      </span>
      <span className="relative w-fit rounded-full bg-black px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-brand)' }}>
        {tag}
      </span>
      <h2 className="font-display relative mt-6 text-5xl uppercase leading-[0.9] md:text-6xl">{heading}</h2>
      <p className="relative mt-5 text-[15px] font-medium leading-relaxed text-black/80 md:text-base">{children}</p>
    </div>
  )
}

function Pill({
  active,
  wide,
  block,
  onClick,
  children,
}: {
  active: boolean
  wide?: boolean
  block?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  const size = block ? 'w-full px-6 py-4' : wide ? 'px-10 py-3.5' : 'px-6 py-3'
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border-2 text-sm font-extrabold uppercase tracking-wide transition ${size} ${
        active ? 'border-black bg-black text-white' : 'border-black/20 text-black hover:border-black'
      }`}
      style={{ fontFamily: 'var(--font-brand)' }}
    >
      {block ? (
        <span className="flex w-full items-center justify-between gap-4 text-left">
          <span>{children}</span>
          <span className={`h-4 w-4 shrink-0 rounded-full border-2 ${active ? 'border-white bg-white' : 'border-black/30'}`} />
        </span>
      ) : (
        children
      )}
    </button>
  )
}
