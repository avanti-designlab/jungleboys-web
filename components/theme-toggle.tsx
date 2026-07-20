'use client'

import { useEffect, useState } from 'react'

// Site theme toggle — lives in the sticky header right of the socials pill.
// Default is LIGHT (Avanti 2026-07-19); choice persists in localStorage.
// The no-flash boot script in app/layout.tsx applies the saved theme pre-paint.

export default function ThemeToggle({
  className = 'border-white text-white',
}: {
  className?: string
}) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === 'dark')
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    if (next) {
      document.documentElement.dataset.theme = 'dark'
    } else {
      delete document.documentElement.dataset.theme
    }
    try {
      localStorage.setItem('jb-theme', next ? 'dark' : 'light')
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border transition-transform duration-200 hover:scale-110 ${className}`}
    >
      {dark ? (
        /* sun */
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path strokeLinecap="round" d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" />
        </svg>
      ) : (
        /* moon */
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
          <path d="M20.5 14.1A8.5 8.5 0 0 1 9.9 3.5a.6.6 0 0 0-.8-.7 9.5 9.5 0 1 0 12.1 12.1.6.6 0 0 0-.7-.8Z" />
        </svg>
      )}
    </button>
  )
}
