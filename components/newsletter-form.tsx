'use client'

import { useState } from 'react'

// Newsletter / TCPA signup form (07 §4). Consent text is passed in verbatim from
// content/legal/tcpa-consent.txt — it is displayed AND logged with every lead.

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
        body: JSON.stringify({ ...data, sourcePage: window.location.pathname }),
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
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <label className="flex-1">
          <span className="sr-only">Name</span>
          <input
            name="name"
            autoComplete="name"
            placeholder="Name"
            maxLength={80}
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm"
          />
        </label>
        <label className="flex-1">
          <span className="sr-only">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="Email *"
            maxLength={120}
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm"
          />
        </label>
        <label className="flex-1">
          <span className="sr-only">Phone</span>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="Phone"
            maxLength={20}
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm"
          />
        </label>
      </div>

      {/* honeypot — bots fill it, humans never see it */}
      <input
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <button
        type="submit"
        disabled={state === 'sending'}
        className="cursor-pointer self-start rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-8 py-3 text-sm font-bold uppercase tracking-wider text-[var(--color-on-accent)] transition-transform duration-200 hover:scale-[1.02] disabled:opacity-50"
        style={{ fontFamily: 'var(--font-brand)' }}
      >
        {state === 'sending' ? 'Joining…' : 'Join the list'}
      </button>

      {state === 'error' && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <p className="text-[11px] leading-relaxed text-[var(--color-muted)]">{consentText}</p>
    </form>
  )
}
