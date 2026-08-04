'use client'

import { useState } from 'react'
import Link from 'next/link'
import { menuPathFor, readStore } from '@/lib/store-selection'

// The REAL sign-in form (Avanti, 2026-08-04: "this actually needs to be a
// sign in page" — supersedes the no-form interim). The security boundary
// holds: Dutchie owns auth, so until the live account API keys land this
// form TRANSMITS NOTHING — submit is intercepted client-side and answers
// honestly. Wiring it is a data change (swap the stub in handleSubmit for
// the provider call), not a redesign. No credentials are stored, logged,
// or sent anywhere in the interim.

const field =
  'w-full rounded-2xl border border-white/15 bg-white/[0.06] px-5 py-4 text-[15px] text-white placeholder:text-white/40 outline-none transition focus:border-[var(--color-accent)]'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // STUB until the Dutchie account API is wired (recorded amendment
    // pattern): no network call leaves this handler in the interim.
    const s = readStore()
    setNotice(
      s?.state === 'CA'
        ? 'Online accounts activate with ordering. Right now, sign-in happens during checkout on your store’s menu — your bag is waiting there.'
        : 'Online accounts activate with ordering. Pick your store and sign in during checkout on its menu.'
    )
  }

  const saved = typeof window !== 'undefined' ? readStore() : null

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-sm text-left" style={{ fontFamily: 'var(--font-brand)' }}>
      <label className="block">
        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">Email</span>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className={field}
        />
      </label>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">Password</span>
        <span className="relative block">
          <input
            type={showPw ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={`${field} pr-14`}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? 'Hide password' : 'Show password'}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2.5 text-white/50 transition hover:text-white"
          >
            {showPw ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
                <path d="M3 3l18 18M10.6 5.1A9.8 9.8 0 0 1 12 5c7 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2M6.6 6.6A17 17 0 0 0 2 12s3 7 10 7a9.7 9.7 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </span>
      </label>

      <div className="mt-2.5 flex justify-end">
        <Link href="/forgot-password" className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/60 underline-offset-4 transition hover:text-[var(--color-accent)] hover:underline">
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[var(--color-accent)] px-8 py-4 text-sm font-extrabold uppercase tracking-widest text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
      >
        Sign in
      </button>

      {notice && (
        <p role="status" className="mt-4 rounded-2xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 px-4 py-3 text-center text-[13px] leading-relaxed text-white/90">
          {notice}{' '}
          {saved?.state === 'CA' && (
            <Link href={menuPathFor(saved.slug, saved.state)} className="font-bold text-[var(--color-accent)] underline-offset-4 hover:underline">
              Go to your menu →
            </Link>
          )}
        </p>
      )}

      <p className="mt-6 text-center text-[12px] font-bold uppercase tracking-[0.16em] text-white/60">
        New here?{' '}
        <Link href="/signup" className="text-[var(--color-accent)] underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  )
}
