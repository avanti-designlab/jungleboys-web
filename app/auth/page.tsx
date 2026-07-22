import type { Metadata } from 'next'
import { verifyProduct } from '@/lib/auth/verify'
import AuthHub from '@/components/scan/auth-hub'
import AuthResult from '@/components/scan/auth-result'

// Product authentication hub. Utility route → noindex. With ?code it shows the
// verification result; without, the scan/tap landing. Verification is a stub
// until BatchSys's endpoint is wired (see lib/auth/verify.ts).

export const metadata: Metadata = {
  title: 'Verify Your Product',
  description: 'Confirm your Jungle Boys product is authentic. Scan the QR code on the label.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/auth' },
}

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams

  return (
    <main className="bg-[var(--color-background)] text-[var(--color-foreground)]">
      {code ? <AuthResult result={await verifyProduct(code)} /> : <AuthHub />}
    </main>
  )
}
