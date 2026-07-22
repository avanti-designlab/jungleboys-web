'use client'

import Link from 'next/link'
import { useScanner } from './scan-provider'
import type { VerifyResult } from '@/lib/auth/verify'

function CheckBadge() {
  return (
    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-accent)] text-black">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" className="h-12 w-12" aria-hidden><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </div>
  )
}

function WarnBadge() {
  return (
    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-[var(--color-muted)] text-[var(--color-foreground)]">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-12 w-12" aria-hidden><path d="M12 8v5M12 16.5v.5" strokeLinecap="round" /><path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" strokeLinejoin="round" /></svg>
    </div>
  )
}

export default function AuthResult({ result }: { result: VerifyResult }) {
  const { open } = useScanner()
  const { status, code, product } = result

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 pb-24 pt-28 text-center md:pt-32">
      {status === 'authentic' ? (
        <>
          <CheckBadge />
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-muted)]" style={{ fontFamily: 'var(--font-brand)' }}>
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
          <WarnBadge />
          <h1 className="font-display mt-6 text-5xl uppercase leading-[0.92] text-[var(--color-foreground)] md:text-6xl">
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
