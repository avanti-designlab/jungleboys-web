'use client'

import { useState } from 'react'
import NewsletterForm from './newsletter-form'
import PillCta from './pill-cta'

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

  return <PillCta label="Let's Stay In Touch" onClick={() => setOpen(true)} />
}
