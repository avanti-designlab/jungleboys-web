'use client'

import { useEffect, useRef, useState } from 'react'

// 21+ DOB gate + CA/FL state selector (07 §1 — locked approach).
// Client overlay only: server-rendered content stays crawlable underneath.
// Not a security boundary — a UX/compliance layer.

const STORAGE_KEY = 'jb-age-gate'
const VALID_DAYS = 30

type GateState = { verifiedAt: number; state: 'CA' | 'FL' }

export function getVisitorState(): 'CA' | 'FL' | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: GateState = JSON.parse(raw)
    const fresh = Date.now() - parsed.verifiedAt < VALID_DAYS * 864e5
    return fresh ? parsed.state : null
  } catch {
    return null
  }
}

export default function AgeGate() {
  const [open, setOpen] = useState(false)
  const [dob, setDob] = useState({ m: '', d: '', y: '' })
  const [usState, setUsState] = useState<'CA' | 'FL'>('CA')
  const [error, setError] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!getVisitorState()) setOpen(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    panel?.querySelector<HTMLElement>('input, button')?.focus()
    // simple focus trap
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !panel) return
      const items = panel.querySelectorAll<HTMLElement>('input, select, button, a')
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', trap)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', trap)
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  function submit() {
    const m = Number(dob.m)
    const d = Number(dob.d)
    const y = Number(dob.y)
    if (!m || !d || !y || m > 12 || d > 31 || y < 1900 || y > new Date().getFullYear()) {
      setError('Enter a valid date of birth.')
      return
    }
    const birthday = new Date(y, m - 1, d)
    const age =
      (Date.now() - birthday.getTime()) / (365.25 * 864e5)
    if (age < 21) {
      window.location.href = 'https://www.google.com'
      return
    }
    const payload: GateState = { verifiedAt: Date.now(), state: usState }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    setOpen(false)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Age verification"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[var(--color-background)]/95 backdrop-blur-sm p-6"
    >
      <div
        ref={panelRef}
        className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 flex flex-col gap-6 text-center"
      >
        <p
          className="text-4xl uppercase leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          You must be 21+ years old to enter this site
        </p>

        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
            Date of birth
          </label>
          <div className="flex justify-center gap-3">
            {(
              [
                ['MM', 'm', 2],
                ['DD', 'd', 2],
                ['YYYY', 'y', 4],
              ] as const
            ).map(([ph, key, len]) => (
              <input
                key={key}
                inputMode="numeric"
                maxLength={len}
                placeholder={ph}
                value={dob[key]}
                onChange={(e) =>
                  setDob((s) => ({ ...s, [key]: e.target.value.replace(/\D/g, '') }))
                }
                className="w-20 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-3 text-center text-lg"
                aria-label={ph}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
            Select your state
          </label>
          <div className="flex justify-center gap-3">
            {(['CA', 'FL'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setUsState(s)}
                aria-pressed={usState === s}
                className={`cursor-pointer rounded-[var(--radius-sm)] px-8 py-3 text-sm font-bold uppercase tracking-wider border transition-colors duration-200 ${
                  usState === s
                    ? 'bg-[var(--color-accent)] text-[var(--color-on-accent)] border-[var(--color-accent)]'
                    : 'border-[var(--color-border)] text-[var(--color-foreground)]'
                }`}
                style={{ fontFamily: 'var(--font-brand)' }}
              >
                {s === 'CA' ? 'California' : 'Florida'}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          onClick={submit}
          className="cursor-pointer rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-8 py-4 text-sm font-bold uppercase tracking-wider text-[var(--color-on-accent)] transition-transform duration-200 hover:scale-[1.02]"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          Yes, I&apos;m 21+ — Enter
        </button>

        <a
          href="https://www.google.com"
          className="text-xs uppercase tracking-widest text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
        >
          Get me out of here
        </a>
      </div>
    </div>
  )
}
