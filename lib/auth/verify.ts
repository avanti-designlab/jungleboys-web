// Product authentication — the swappable interface behind /auth.
//
// ⚠️ STUB. BatchSys owns the real verification (batchsys.com — the vendor
// behind the JB app + PWF Rewards). When their production endpoint/API is
// available, replace `verifyProduct` with a real fetch; the callers + UI
// (app/auth, auth-result) don't change. Until then this returns deterministic
// demo results so every screen can be previewed.
//
// Demo codes (case-insensitive substring):
//   • empty / < 4 chars / contains "FAIL"  → failed (counterfeit/invalid)
//   • contains "CLAIM"                       → already claimed
//   • anything else (e.g. AABBCC112233)      → authentic

export type VerifyStatus = 'authentic' | 'claimed' | 'failed'

export type VerifiedProduct = {
  name: string
  type?: string
  size?: string
  strain?: string
  lineage?: string
}

export type VerifyResult = {
  status: VerifyStatus
  code: string
  product?: VerifiedProduct
}

export async function verifyProduct(rawCode: string): Promise<VerifyResult> {
  const code = (rawCode || '').trim()
  const up = code.toUpperCase()

  // TODO(BatchSys): replace this block with a real call, e.g.
  //   const res = await fetch(`${process.env.BATCHSYS_VERIFY_URL}?code=${code}`,
  //     { headers: { authorization: process.env.BATCHSYS_API_KEY! }, next: { revalidate: 0 } })
  //   → map their response to VerifyResult.

  if (code.length < 4 || up.includes('FAIL')) {
    return { status: 'failed', code }
  }
  if (up.includes('CLAIM')) {
    return { status: 'claimed', code }
  }
  return {
    status: 'authentic',
    code,
    // Real fields arrive from BatchSys; left undefined so the UI shows a clean
    // "verified genuine" state rather than placeholder data pretending to be real.
    product: { name: 'Jungle Boys' },
  }
}

// Pull the code out of whatever the QR encodes: a full URL with ?code=XXXX,
// a path URL (jungleboys.com/auth/XXXX — the real sticker format, often with
// no scheme), or a raw scratch code.
export function extractCode(scanned: string): string {
  const s = (scanned || '').trim()
  // QR stickers encode a bare URL with no scheme — give URL() one to parse.
  const candidate = /^https?:\/\//i.test(s) ? s : `https://${s}`
  try {
    const u = new URL(candidate)
    const c = u.searchParams.get('code')
    if (c) return c.trim()
    // last path segment, e.g. /auth/XXXX
    const seg = u.pathname.split('/').filter(Boolean).pop()
    if (seg && seg.toLowerCase() !== 'auth') return decodeURIComponent(seg)
  } catch {
    // not URL-like — treat as a raw code
  }
  return s
}
