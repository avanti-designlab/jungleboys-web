import type { Metadata } from 'next'
import { verifyProduct, extractCode } from '@/lib/auth/verify'
import AuthResult from '@/components/scan/auth-result'

// Path-based verification — the real sticker format is jungleboys.com/auth/<CODE>.
// Scanning the QR (or visiting the URL) lands here directly. Utility → noindex.

export const metadata: Metadata = {
  title: 'Verify Your Product',
  description: 'Confirm your Jungle Boys product is authentic.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/auth' },
}

export default async function AuthCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const result = await verifyProduct(extractCode(decodeURIComponent(code)))
  return (
    <main className="bg-[var(--color-background)] text-[var(--color-foreground)]">
      <AuthResult result={result} />
    </main>
  )
}
