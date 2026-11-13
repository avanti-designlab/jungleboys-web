// California Proposition 65 warning (2026-11-12 compliance pass).
//
// Prop 65 requires the warning BEFORE an online purchase completes; checkout
// happens on Dutchie's hosted page, so this site carries the warning itself
// on every PDP and in the footer regardless of what their checkout shows
// (private enforcers collect per-day penalties, and relying on a vendor's
// page for our obligation is the exposure being closed here).
//
// Wording follows OEHHA's cannabis safe-harbor language and the yellow
// warning triangle is part of the safe-harbor format. DO NOT reword or
// restyle without counsel; the protection comes from matching the format.

const TEXT =
  'Products sold on this site can expose you to chemicals including cannabis (marijuana) smoke and Δ9-Tetrahydrocannabinol (Δ9-THC), which are known to the State of California to cause cancer and birth defects or other reproductive harm. For more information go to '

function Triangle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false">
      <path d="M12 2.5 23 21.5H1L12 2.5Z" fill="#fecf0e" stroke="#000" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 9v6" stroke="#000" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="17.6" r="1.3" fill="#000" />
    </svg>
  )
}

/** tone: 'footer' renders on the dark footer; 'page' on theme surfaces */
export default function Prop65({ tone = 'page' }: { tone?: 'footer' | 'page' }) {
  const text = tone === 'footer' ? 'text-white/60' : 'text-[var(--color-muted)]'
  const link = tone === 'footer' ? 'text-white/80' : 'text-[var(--color-foreground)]'
  return (
    <p className={`flex items-start gap-2 text-[10px] normal-case leading-relaxed tracking-normal ${text}`}>
      <Triangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>
        <strong className={`font-bold ${link}`}>WARNING:</strong> {TEXT}
        <a
          href="https://www.P65Warnings.ca.gov"
          target="_blank"
          rel="noopener noreferrer"
          className={`underline underline-offset-2 ${link}`}
        >
          www.P65Warnings.ca.gov
        </a>
        .
      </span>
    </p>
  )
}
