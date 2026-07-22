'use client'

import Link from 'next/link'
import { useScanner } from './scan-provider'
import FlameBurst from './flame-burst'
import type { VerifyResult } from '@/lib/auth/verify'

const FLAME_PATH =
  'M12 2c1.3 3.4-1.5 5-1.5 7.6 0 1.4 1 2.4 2.1 2.4 1.5 0 2.3-1.3 2-3 2 1.4 3.2 3.5 3.2 5.9 0 3.6-3 6.6-6.9 6.6S4 18.5 4 14.7c0-4.2 3.2-6.6 4.6-9.1C10 3.7 11.4 2.9 12 2Z'

// Custom flame-shaped badge (no circle): a green flame with a flame-shaped
// pulse aura behind it, plus a live flicker + spring pop-in.
function FlameBadge() {
  return (
    <div className="badge-in relative mx-auto flex h-32 w-28 items-end justify-center">
      <svg viewBox="0 0 24 24" fill="#22c55e" className="flame-pulse absolute inset-0 m-auto h-full w-auto" aria-hidden>
        <path d={FLAME_PATH} />
      </svg>
      <svg viewBox="0 0 24 24" fill="#15a34a" className="flame-flicker relative h-full w-auto drop-shadow-[0_0_28px_rgba(34,197,94,0.7)]" aria-hidden>
        <path d={FLAME_PATH} />
      </svg>
    </div>
  )
}

// Emergency alert badge — red (counterfeit/invalid) or amber (already claimed).
function AlertBadge({ color }: { color: string }) {
  return (
    <div className="relative mx-auto h-28 w-28">
      <span className="ring-pulse absolute inset-0 rounded-full border-4" style={{ borderColor: color }} />
      <div className="badge-in flex h-28 w-28 items-center justify-center">
        <svg viewBox="0 0 24 24" className="emergency-pulse h-24 w-24" style={{ color }} aria-hidden>
          <path fill="currentColor" d="M10.3 3.3 1.7 18a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.7-3L13.7 3.3a2 2 0 0 0-3.4 0Z" />
          <path stroke="#fff" strokeWidth="2.2" strokeLinecap="round" d="M12 9.5v4.2" />
          <circle cx="12" cy="17" r="1.3" fill="#fff" />
        </svg>
      </div>
    </div>
  )
}

export default function AuthResult({ result }: { result: VerifyResult }) {
  const { open } = useScanner()
  const { status, code, product } = result

  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 pb-24 pt-28 text-center md:pt-32">
      {status === 'authentic' ? (
        <>
          <FlameBurst />
          <FlameBadge />
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-[#15a34a]" style={{ fontFamily: 'var(--font-brand)' }}>
            Verified Genuine
          </p>
          <h1 className="font-display mt-2 text-5xl uppercase leading-[0.92] text-[var(--color-foreground)] md:text-6xl">
            Authentic Product
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-body)' }}>
            This is a genuine {product?.name || 'Jungle Boys'} product — never imitated, never duplicated.
          </p>

          <div className="mt-8 w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <Row label="Code" value={code} />
            {product?.type && <Row label="Product" value={product.type} />}
            {product?.strain && <Row label="Strain" value={product.strain} />}
            {product?.size && <Row label="Size" value={product.size} />}
            {product?.lineage && <Row label="Lineage" value={product.lineage} />}
          </div>

          <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
            <Link href="/products" className="flex-1 rounded-full bg-[var(--color-accent)] px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-black transition-colors hover:bg-[var(--color-foreground)] hover:text-[var(--color-background)]" style={{ fontFamily: 'var(--font-brand)' }}>
              Shop
            </Link>
            <button onClick={open} className="flex-1 rounded-full border-2 border-[var(--color-foreground)] px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-foreground)] hover:text-[var(--color-background)]" style={{ fontFamily: 'var(--font-brand)' }}>
              Scan Another
            </button>
          </div>
        </>
      ) : (
        <>
          <AlertBadge color={status === 'claimed' ? '#f59e0b' : '#ef4444'} />
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.3em]" style={{ fontFamily: 'var(--font-brand)', color: status === 'claimed' ? '#f59e0b' : '#ef4444' }}>
            {status === 'claimed' ? 'Heads Up' : 'Not Authentic'}
          </p>
          <h1 className="font-display mt-2 text-5xl uppercase leading-[0.92] text-[var(--color-foreground)] md:text-6xl">
            {status === 'claimed' ? 'Already Claimed' : 'Authentication Failed'}
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-body)' }}>
            {status === 'claimed'
              ? 'This product is already registered to another owner and cannot be claimed again.'
              : 'The code you scanned may be counterfeit or invalid. Please try again, or contact the brand or your retailer.'}
          </p>

          <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
            <Link href="/contact" className="flex-1 rounded-full bg-[var(--color-accent)] px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-black transition-colors hover:bg-[var(--color-foreground)] hover:text-[var(--color-background)]" style={{ fontFamily: 'var(--font-brand)' }}>
              Contact Us
            </Link>
            {status === 'failed' && (
              <button onClick={open} className="flex-1 rounded-full border-2 border-[var(--color-foreground)] px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-foreground)] hover:text-[var(--color-background)]" style={{ fontFamily: 'var(--font-brand)' }}>
                Try Again
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] py-2.5 last:border-0">
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>{label}</span>
      <span className="text-sm font-semibold uppercase tracking-wide text-[var(--color-foreground)]" style={{ fontFamily: 'var(--font-brand)' }}>{value}</span>
    </div>
  )
}
