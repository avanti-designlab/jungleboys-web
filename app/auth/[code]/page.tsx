import type { Metadata } from 'next'
import { verifyProduct, extractCode } from '@/lib/auth/verify'
import AuthResult from '@/components/scan/auth-result'

// Path-based verification — the real sticker format is jungleboys.com/auth/<CODE>.
// Scanning the QR (or visiting the URL) lands here directly. Utility → noindex.

export const metadata: Metadata = {
  title: 'Verify Your Product',
  description: 'Confirm your Jungle Boys product is authentic.',
  robots: { index: false, follow: false },
  // NO canonical. noindex plus a canonical pointing at a DIFFERENT page is a
  // conflicting signal, and Google can resolve it by propagating the noindex to
  // the canonical target — i.e. this per-code page could have taken /auth down
  // with it. There are unbounded code URLs, so noindex alone is the right tool.
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
