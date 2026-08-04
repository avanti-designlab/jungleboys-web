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
  kind: 'signup' | 'forgot' | 'reset' | 'delete'
}) {
  const [notice, setNotice] = useState<string | null>(null)
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setNotice(
      {
        signup:
          'Online accounts activate with ordering. Today, your account and PWF points are created during checkout on your store’s menu.',
        forgot:
          'Online accounts activate with ordering. Password resets for checkout accounts are handled on your store’s menu.',
        reset:
          'Online accounts activate with ordering. Use the link from your reset email once accounts are live — nothing was changed.',
        delete:
          'Account deletion requests are handled with our dispensary system. Until online accounts activate, reach us through the contact page and we’ll take care of it.',
      }[kind]
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
      {kind !== 'reset' && (
        <label className={`block ${kind === 'signup' ? 'mt-4' : ''}`}>
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">Email</span>
          <input type="email" autoComplete="email" required placeholder="you@email.com" className={field} />
        </label>
      )}
      {kind === 'signup' && (
        <label className="mt-4 block">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">Password</span>
          <input type="password" autoComplete="new-password" required placeholder="••••••••" className={field} />
        </label>
      )}
      {kind === 'reset' && (
        <>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">New password</span>
            <input type="password" autoComplete="new-password" required placeholder="••••••••" className={field} />
          </label>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">Confirm new password</span>
            <input type="password" autoComplete="new-password" required placeholder="••••••••" className={field} />
          </label>
        </>
      )}
      {kind === 'delete' && (
        <label className="mt-4 flex items-start gap-3 rounded-2xl border border-white/15 bg-white/[0.06] p-4">
          <input type="checkbox" required className="mt-0.5 h-4 w-4 accent-[var(--color-accent)]" />
          <span className="text-[13px] leading-snug text-white/80">
            I understand this permanently deletes my account, order history and PWF Rewards points.
          </span>
        </label>
      )}

      <button
        type="submit"
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[var(--color-accent)] px-8 py-4 text-sm font-extrabold uppercase tracking-widest text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
      >
        {{ signup: 'Create account', forgot: 'Send reset link', reset: 'Set new password', delete: 'Request deletion' }[kind]}
      </button>

      {notice && (
        <p role="status" className="mt-4 rounded-2xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 px-4 py-3 text-center text-[13px] leading-relaxed text-white/90">
          {notice}
        </p>
      )}

      <p className="mt-6 text-center text-[12px] font-bold uppercase tracking-[0.16em] text-white/60">
        {{ signup: 'Already have an account? ', forgot: 'Remembered it? ', reset: 'All set? ', delete: 'Changed your mind? ' }[kind]}
        <Link href="/login" className="text-[var(--color-accent)] underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
