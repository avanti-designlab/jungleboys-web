// Fire-and-forget event tracking — a no-op unless the consent-gated GA tag
// (components/analytics.tsx) has loaded. NEVER put PII in params (07 §7).
export function track(name: string, params?: Record<string, unknown>): void {
  try {
    ;(window as { gtag?: (...a: unknown[]) => void }).gtag?.('event', name, params ?? {})
  } catch {
    // analytics must never break the shop
  }
}
