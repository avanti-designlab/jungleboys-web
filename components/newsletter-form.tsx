'use client'

import { useState } from 'react'

// Phone-first SMS signup — matches the live footer form (US +1 prefix).
// Consent text is passed in verbatim from content/legal/tcpa-consent.txt —
// displayed at point of capture AND logged with every lead (07 §4).

export default function NewsletterForm({ consentText }: { consentText: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

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
          ...data,
          phone: data.phone ? `+1${String(data.phone).replace(/\D/g, '')}` : '',
          sourcePage: window.location.pathname,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Something went wrong — please try again.')
      }
      setState('done')
      form.reset()
    } catch (err) {
      setState('error')
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  if (state === 'done') {
    return (
      <p className="text-sm text-[var(--color-accent)]" role="status">
        You&apos;re on the list. Welcome to the jungle. 🌴
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-xl flex-col gap-4">
      <div className="flex items-stretch overflow-hidden rounded-[10px] border-2 border-white/80 focus-within:border-[var(--color-accent)]">
        <span
          className="flex items-center border-r border-white/30 px-4 text-sm font-bold text-white/70"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          US (+1)
        </span>
        <label className="flex-1">
          <span className="sr-only">Phone number</span>
          <input
            name="phone"
            type="tel"
            required
            autoComplete="tel-national"
            inputMode="numeric"
            placeholder="Phone number"
            maxLength={14}
            className="h-full w-full bg-transparent px-4 py-4 text-base text-white placeholder:text-white/40 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={state === 'sending'}
          aria-label="Join the list"
          className="cursor-pointer bg-[var(--color-accent)] px-6 text-xl font-bold text-[var(--color-on-accent)] transition-transform duration-200 hover:scale-105 disabled:opacity-50"
        >
          {state === 'sending' ? '…' : '→'}
        </button>
      </div>

      {/* honeypot — bots fill it, humans never see it */}
      <input name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      {state === 'error' && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <p className="text-[11px] leading-relaxed text-white/40">{consentText}</p>
    </form>
  )
}
