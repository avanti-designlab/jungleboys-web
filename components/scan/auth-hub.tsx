'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useScanner } from './scan-provider'
import { extractCode } from '@/lib/auth/verify'

const STEPS = [
  'Scan the QR code on your product label — or tap the phone to it.',
  'We confirm your product is genuine Jungle Boys.',
  'Get the details on what you’re holding, straight from the source.',
]

export default function AuthHub() {
  const { open } = useScanner()
  const router = useRouter()
  const [nfc, setNfc] = useState(false)
  const [nfcMsg, setNfcMsg] = useState('')

  useEffect(() => {
    setNfc(typeof window !== 'undefined' && 'NDEFReader' in window)
  }, [])

  async function tap() {
    setNfcMsg('')
    try {
      // Web NFC (Android Chrome). Reads the code the tag encodes → /auth?code=…
      const Reader = (window as unknown as { NDEFReader: new () => { scan: () => Promise<void>; onreading: ((e: { message: { records: { recordType: string; data: BufferSource }[] } }) => void) | null } }).NDEFReader
      const reader = new Reader()
      await reader.scan()
      setNfcMsg('Hold your phone to the product tag…')
      reader.onreading = (e) => {
        for (const rec of e.message.records) {
          try {
            const text = new TextDecoder().decode(rec.data)
            if (text) {
              router.push(`/auth?code=${encodeURIComponent(extractCode(text))}`)
              return
            }
          } catch {
            /* skip */
          }
        }
      }
    } catch {
      setNfcMsg('Tap didn’t start — try Scan instead.')
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 pb-24 pt-28 text-center md:pt-32">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
        Product Authentication
      </p>
      <h1 className="font-display mt-3 text-6xl uppercase leading-[0.9] text-[var(--color-foreground)] md:text-7xl">
        Verify Your Product
      </h1>
      <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-body)' }}>
        Confirm your Jungle Boys product is the real thing. Scan the QR on the label — never imitated, never duplicated.
      </p>

      {/* scan visual */}
      <div className="relative mx-auto mt-10 flex h-56 w-full max-w-sm items-center justify-center overflow-hidden rounded-[1.75rem] bg-[#0b0b0d]" data-nav-theme="dark">
        <div className="relative h-36 w-36">
          <span className="absolute left-0 top-0 h-8 w-8 rounded-tl-lg border-l-4 border-t-4 border-[var(--color-accent)]" />
          <span className="absolute right-0 top-0 h-8 w-8 rounded-tr-lg border-r-4 border-t-4 border-[var(--color-accent)]" />
          <span className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-lg border-b-4 border-l-4 border-[var(--color-accent)]" />
          <span className="absolute bottom-0 right-0 h-8 w-8 rounded-br-lg border-b-4 border-r-4 border-[var(--color-accent)]" />
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.4" className="absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)] opacity-90" aria-hidden>
            <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
            <path d="M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z" />
          </svg>
          <span className="scan-line absolute inset-x-1 top-0 h-0.5 bg-[var(--color-accent)]" />
        </div>
      </div>

      {/* steps */}
      <ol className="mx-auto mt-10 max-w-md space-y-4 text-left">
        {STEPS.map((s, i) => (
          <li key={i} className="flex items-start gap-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-bold text-black" style={{ fontFamily: 'var(--font-brand)' }}>
              {i + 1}
            </span>
            <span className="pt-0.5 text-sm leading-relaxed text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-body)' }}>{s}</span>
          </li>
        ))}
      </ol>

      {/* actions */}
      <div className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row">
        <button
          onClick={open}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-4 text-sm font-bold uppercase tracking-widest text-black transition-colors duration-300 hover:bg-[var(--color-foreground)] hover:text-[var(--color-background)]"
          style={{ fontFamily: 'var(--font-brand)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
            <path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2" strokeLinecap="round" />
            <path d="M4 12h16" strokeLinecap="round" />
          </svg>
          Scan
        </button>
        {nfc && (
          <button
            onClick={tap}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-[var(--color-foreground)] px-6 py-4 text-sm font-bold uppercase tracking-widest text-[var(--color-foreground)] transition-colors duration-300 hover:bg-[var(--color-foreground)] hover:text-[var(--color-background)]"
            style={{ fontFamily: 'var(--font-brand)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
              <path d="M5 8a13 13 0 0 1 0 8M9 6a17 17 0 0 1 0 12M13 5v14M17 8a13 13 0 0 1 0 8" strokeLinecap="round" />
            </svg>
            Tap
          </button>
        )}
      </div>
      {nfcMsg && <p className="mt-4 text-xs uppercase tracking-wide text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>{nfcMsg}</p>}
    </div>
  )
}
