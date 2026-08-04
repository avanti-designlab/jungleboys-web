'use client'

import { useState } from 'react'
import Link from 'next/link'

// Shared client form for the auth suite's sibling pages (/signup,
// /forgot-password). Same contract as LoginForm: real, validated UI whose
// submit TRANSMITS NOTHING until the Dutchie account API is wired — the
// handler answers honestly instead. Swapping the stub for the provider call
// is the only change at cutover.

const field =
  'w-full rounded-2xl border border-white/15 bg-white/[0.06] px-5 py-4 text-[15px] text-white placeholder:text-white/40 outline-none transition focus:border-[var(--color-accent)]'

export default function AuthStubForm({
  kind,
}: {
  kind: 'signup' | 'forgot'
}) {
  const [notice, setNotice] = useState<string | null>(null)
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setNotice(
      kind === 'signup'
        ? 'Online accounts activate with ordering. Today, your account and PWF points are created during checkout on your store’s menu.'
        : 'Online accounts activate with ordering. Password resets for checkout accounts are handled on your store’s menu.'
    )
  }

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-sm text-left" style={{ fontFamily: 'var(--font-brand)' }}>
      {kind === 'signup' && (
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">Name</span>
          <input type="text" autoComplete="name" required placeholder="Your name" className={field} />
        </label>
      )}
      <label className={`block ${kind === 'signup' ? 'mt-4' : ''}`}>
        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">Email</span>
        <input type="email" autoComplete="email" required placeholder="you@email.com" className={field} />
      </label>
      {kind === 'signup' && (
        <label className="mt-4 block">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">Password</span>
          <input type="password" autoComplete="new-password" required placeholder="••••••••" className={field} />
        </label>
      )}

      <button
        type="submit"
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[var(--color-accent)] px-8 py-4 text-sm font-extrabold uppercase tracking-widest text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
      >
        {kind === 'signup' ? 'Create account' : 'Send reset link'}
      </button>

      {notice && (
        <p role="status" className="mt-4 rounded-2xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 px-4 py-3 text-center text-[13px] leading-relaxed text-white/90">
          {notice}
        </p>
      )}

      <p className="mt-6 text-center text-[12px] font-bold uppercase tracking-[0.16em] text-white/60">
        {kind === 'signup' ? 'Already have an account? ' : 'Remembered it? '}
        <Link href="/login" className="text-[var(--color-accent)] underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
