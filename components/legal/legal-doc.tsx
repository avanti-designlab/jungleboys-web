import type { ReactNode } from 'react'

// A tiny, dependency-free renderer for our legal markdown files (content/legal/*.md).
// Handles only the small subset we generate: ##/### headings, "- " bullet lists,
// "---" rules, "_italic_" lines, and paragraphs. The leading "# Title" is skipped
// (the page renders its own header).
function render(md: string): ReactNode[] {
  const lines = md.split('\n')
  const out: ReactNode[] = []
  let i = 0
  let key = 0
  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()
    if (!trimmed) {
      i++
      continue
    }
    if (trimmed.startsWith('# ')) {
      i++
      continue
    }
    if (trimmed === '---') {
      out.push(<hr key={key++} className="my-10 border-[var(--color-border)]" />)
      i++
      continue
    }
    if (trimmed.startsWith('## ')) {
      out.push(
        <h2 key={key++} className="font-display mt-12 mb-4 text-2xl uppercase leading-tight text-[var(--color-foreground)] md:text-3xl">
          {trimmed.slice(3)}
        </h2>
      )
      i++
      continue
    }
    if (trimmed.startsWith('### ')) {
      out.push(
        <h3 key={key++} className="mt-8 mb-3 text-lg font-bold text-[var(--color-foreground)]">
          {trimmed.slice(4)}
        </h3>
      )
      i++
      continue
    }
    if (trimmed.startsWith('- ')) {
      const items: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push(lines[i].trim().slice(2))
        i++
      }
      out.push(
        <ul key={key++} className="my-4 list-disc space-y-2 pl-6 text-[var(--color-muted)]">
          {items.map((it, n) => (
            <li key={n}>{it}</li>
          ))}
        </ul>
      )
      continue
    }
    if (/^_.+_$/.test(trimmed)) {
      out.push(
        <p key={key++} className="text-sm italic text-[var(--color-muted)]">
          {trimmed.slice(1, -1)}
        </p>
      )
      i++
      continue
    }
    out.push(
      <p key={key++} className="my-4 leading-relaxed text-[var(--color-muted)]">
        {trimmed}
      </p>
    )
    i++
  }
  return out
}

export default function LegalDoc({ markdown }: { markdown: string }) {
  return <div style={{ fontFamily: 'var(--font-body)' }}>{render(markdown)}</div>
}
