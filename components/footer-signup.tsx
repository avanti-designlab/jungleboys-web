'use client'

import PillCta from './pill-cta'

// "LET'S STAY IN TOUCH" — opens the site-wide newsletter signup modal
// (NewsletterPopup) via a custom event.

export default function FooterSignup() {
  return (
    <PillCta
      label="Let's Stay In Touch"
      onClick={() => window.dispatchEvent(new Event('jb:open-newsletter'))}
      className="w-full justify-between lg:w-auto lg:justify-start"
    />
  )
}
