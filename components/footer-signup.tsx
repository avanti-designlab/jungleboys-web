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
      className="cursor-pointer rounded-[10px] border-2 border-white px-6 py-3 text-sm font-bold uppercase tracking-widest text-white transition-colors duration-200 hover:bg-[var(--color-accent)] hover:border-[var(--color-accent)] hover:text-[var(--color-on-accent)]"
      style={{ fontFamily: 'var(--font-brand)' }}
    >
      Let&apos;s Stay In Touch
    </button>
  )
}
