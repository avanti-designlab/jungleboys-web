'use client'

import { useState } from 'react'
import NewsletterForm from './newsletter-form'

// "LET'S STAY IN TOUCH" — expands into the TCPA phone-first signup form.

export default function FooterSignup({ consentText }: { consentText: string }) {
  const [open, setOpen] = useState(false)

  if (open) {
    return (
      <div className="w-full max-w-xl">
        <NewsletterForm consentText={consentText} />
      </div>
    )
  }

  return (
    <button
      onClick={() => setOpen(true)}
      className="cursor-pointer rounded-full bg-[var(--color-accent)] px-8 py-4 text-sm font-bold uppercase tracking-widest text-[var(--color-on-accent)] transition-transform duration-200 hover:scale-105"
      style={{ fontFamily: 'var(--font-brand)' }}
    >
      Let&apos;s Stay In Touch
    </button>
  )
}
