// Regression test for SEC-P2-1: the Storyblok richtext renderer escapes text
// and attribute values but NOT link schemes, so a `javascript:` href reaches
// the DOM intact — and our CSP carries `script-src 'unsafe-inline'`, which is
// exactly the grant that lets it run.
//
// Runs the REAL renderer, not a mock, so it fails if a renderer upgrade ever
// changes the escaping this sanitizer depends on.
//   npx tsx scripts/check-richtext-safe.mjs
import { renderRichText } from '@storyblok/richtext'
import { sanitizeRichTextHtml, isSafeUrl } from '../lib/richtext-safe'

const doc = (href) => ({ type:'doc', content:[{ type:'paragraph', content:[
  { type:'text', text:'click me', marks:[{ type:'link', attrs:{ href, target:'_self' } }] }]}]})

const ATTACKS = [
  'javascript:alert(document.domain)',
  'JaVaScRiPt:alert(1)',
  '  javascript:alert(1)',
  'java\tscript:alert(1)',
  'java\nscript:alert(1)',
  'jav&#x61;script:alert(1)',
  'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
  'vbscript:msgbox(1)',
  'file:///etc/passwd',
]
const LEGIT = [
  'https://jungleboys.com/products',
  'http://example.com',
  'mailto:hello@jungleboys.com',
  'tel:+13235551234',
  '/products/hash-hole',
  '#section',
  '?q=1',
  'relative/path',
]

let bad = 0
console.log('ATTACKS — must all be neutralised:')
for (const a of ATTACKS) {
  const raw = renderRichText(doc(a))
  const safe = sanitizeRichTextHtml(raw)
  const stillThere = /href="(?!#")/.test(safe) && !/href="#"/.test(safe)
  const ok = !stillThere
  if (!ok) bad++
  console.log(`  ${ok ? 'BLOCKED' : '*** LEAKED ***'}  ${JSON.stringify(a).slice(0,44).padEnd(46)} -> ${safe.match(/href="[^"]*"/)?.[0] ?? '(none)'}`)
}
console.log('\nLEGITIMATE — must all survive untouched:')
for (const l of LEGIT) {
  const raw = renderRichText(doc(l))
  const safe = sanitizeRichTextHtml(raw)
  const ok = raw === safe
  if (!ok) bad++
  console.log(`  ${ok ? 'kept   ' : '*** BROKEN ***'}  ${l.padEnd(46)} -> ${safe.match(/href="[^"]*"/)?.[0] ?? '(none)'}`)
}
console.log(`\n${bad === 0 ? 'PASS — 0 leaked, 0 broken' : 'FAIL — ' + bad + ' problem(s)'}`)
process.exit(bad === 0 ? 0 : 1)
