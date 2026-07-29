// Dependency audit gate.
//
// `npm audit --audit-level=high` is all-or-nothing: when an advisory lands that
// nobody can fix yet, the only ways out are to let the build stay red forever
// or to drop the threshold — and dropping the threshold silently stops catching
// the NEXT one, which is the whole point of having the check.
//
// So this wraps npm audit instead. Every high/critical advisory must either be
// absent or be listed in security/audit-exceptions.json with a reason and a
// reviewBy date. Anything unlisted fails. Anything listed but past its date
// fails. New problems are still caught; known-and-assessed ones do not block.
//
// Usage: node scripts/audit-gate.mjs        (exit 0 = pass)

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const EXCEPTIONS_PATH = new URL('../security/audit-exceptions.json', import.meta.url)

function audit() {
  try {
    // npm audit exits non-zero when it finds anything, so capture rather than throw
    return execFileSync('npm', ['audit', '--omit=dev', '--json'], {
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
    })
  } catch (err) {
    if (err.stdout) return err.stdout
    throw err
  }
}

const report = JSON.parse(audit())
const { exceptions } = JSON.parse(readFileSync(EXCEPTIONS_PATH, 'utf8'))

const waived = new Map(exceptions.map((e) => [e.id, e]))
const today = new Date()

// collect every distinct high/critical advisory currently in the tree
const found = new Map()
for (const [pkg, v] of Object.entries(report.vulnerabilities ?? {})) {
  if (v.severity !== 'high' && v.severity !== 'critical') continue
  for (const via of v.via ?? []) {
    if (typeof via !== 'object' || !via.url) continue
    const id = via.url.split('/').pop()
    if (!found.has(id)) found.set(id, { id, pkg, severity: v.severity, title: via.title })
  }
}

const unlisted = []
const expired = []
for (const adv of found.values()) {
  const ex = waived.get(adv.id)
  if (!ex) { unlisted.push(adv); continue }
  if (new Date(ex.reviewBy) < today) expired.push({ ...adv, reviewBy: ex.reviewBy })
}

// an exception for something no longer in the tree is dead weight — say so, but
// do not fail on it
const stale = [...waived.keys()].filter((id) => !found.has(id))

console.log(`audit-gate: ${found.size} high/critical advisories in the production tree`)
for (const adv of found.values()) {
  const ex = waived.get(adv.id)
  const mark = !ex ? 'UNLISTED' : new Date(ex.reviewBy) < today ? 'EXPIRED' : `accepted until ${ex.reviewBy}`
  console.log(`  ${adv.id}  ${adv.pkg.padEnd(12)} ${mark}`)
}
if (stale.length) console.log(`  note: ${stale.length} exception(s) no longer needed — remove: ${stale.join(', ')}`)

if (unlisted.length || expired.length) {
  console.error('\naudit-gate: FAIL')
  for (const a of unlisted) console.error(`  NEW, unassessed: ${a.id} (${a.pkg}) — ${a.title}`)
  for (const a of expired) console.error(`  exception lapsed ${a.reviewBy}: ${a.id} (${a.pkg}) — re-assess or extend`)
  console.error('\nAssess it, then add an entry to security/audit-exceptions.json with a reason and a date.')
  process.exit(1)
}

console.log('\naudit-gate: PASS — every high/critical advisory is documented and in date')
