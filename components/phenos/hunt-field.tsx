// Diagonal "HUNT WITH US" texture that sits behind the whole pheno page.
// Rows are real DOM (brand display font, crisp at any size) on a rotated,
// oversized layer; alternating rows drift in opposite directions. Purely
// decorative — aria-hidden.

const ROWS = 16
const PHRASE = 'HUNT WITH US'

export default function HuntField() {
  const row = Array.from({ length: 12 }, () => PHRASE).join('  ')
  return (
    <div className="hunt-field" aria-hidden>
      {Array.from({ length: ROWS }).map((_, i) => (
        <div key={i} className="hunt-row">
          {row}
        </div>
      ))}
    </div>
  )
}
