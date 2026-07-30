// Regression test for SEC-P2-1: the Storyblok richtext renderer escapes text
// and attribute values but NOT link schemes, so a `javascript:` href reaches
// the DOM intact — and our CSP carries `script-src 'unsafe-inline'`, which is
// exactly the grant that lets it run.
//
// Runs the REAL renderer, not a mock, so it fails if a renderer upgrade ever
// changes the escaping this sanitizer depends on.
//   node --experimental-strip-types scripts/check-richtext-safe.mjs
import { renderRichText } from '@storyblok/richtext'
import { sanitizeRichTextDoc, sanitizeRichTextHtml } from '../lib/richtext-safe.ts'

const doc = (href) => ({ type:'doc', content:[{ type:'paragraph', content:[
  { type:'text', text:'click me', marks:[{ type:'link', attrs:{ href, target:'_self' } }] }]}]})

// Render exactly as the app does: document sanitised BEFORE the renderer, then
// the output pass. Testing only the output pass is what let the first version
// look finished while attribute-NAME injection walked straight through.
const render = (d) => sanitizeRichTextHtml(renderRichText(sanitizeRichTextDoc(d)))

// The five vectors the security gate used to break v1. Attribute NAMES are
// interpolated raw by the renderer (dist/index.mjs:669) and a link's `custom`
// bag is expanded key-by-key into attributes (dist/index.mjs:433).
const ATTR_VECTORS = [
  ['link custom onmouseover', { type:'doc', content:[{ type:'paragraph', content:[
    { type:'text', text:'click me', marks:[{ type:'link', attrs:{ href:'https://jungleboys.com',
      custom:{ onmouseover:'alert(document.domain)' } } }] }]}]}],
  ['link custom tag-breakout', { type:'doc', content:[{ type:'paragraph', content:[
    { type:'text', text:'hi', marks:[{ type:'link', attrs:{ href:'https://x.com',
      custom:{ 'q\"><img src=x onerror=alert(1)><a b=\"':'z' } } }] }]}]}],
  ['paragraph onmouseover', { type:'doc', content:[
    { type:'paragraph', attrs:{ onmouseover:'alert(1)' }, content:[{ type:'text', text:'hover me' }] }]}],
  ['image onerror', { type:'doc', content:[
    { type:'image', attrs:{ src:'https://a-us.storyblok.com/f/x.jpg', onerror:'alert(1)' } }]}],
  ['textStyle css-injection', { type:'doc', content:[{ type:'paragraph', content:[
    { type:'text', text:'overlay', marks:[{ type:'textStyle',
      attrs:{ color:'red; position:fixed; inset:0; z-index:99999; background:#fff' } }] }]}]}],
  // Same clickjack as the textStyle vector, smuggled through the attribute
  // sitting NEXT to the one that was constrained. Tailwind's utilities are
  // already in the shipped stylesheet, so an author needs no CSS of their own —
  // `class` was allowed by name with no value check while `color` beside it was
  // validated. Borrowing the positioning utilities is a full-viewport overlay.
  ['class tailwind-overlay', { type:'doc', content:[
    { type:'paragraph', attrs:{ class:'fixed inset-0 z-50 bg-black h-screen w-full' },
      content:[{ type:'text', text:'FREE DROP — CLICK HERE' }] }]}],
]

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
console.log('ATTRIBUTE-NAME VECTORS (the ones that broke v1):')
for (const [name, d] of ATTR_VECTORS) {
  const out = render(d)
  const leaked = /\son[a-z]+=/i.test(out) || /<img[^>]*onerror/i.test(out)
    || /position:\s*fixed/i.test(out) || /<a[^>]*\sq"/i.test(out)
    // positioning/stacking/sizing utilities surviving in a class attribute are
    // an overlay regardless of whether any inline CSS came with them
    || /class="[^"]*(?:^|\s)(?:fixed|absolute|sticky|inset-\S+|z-\d+|h-screen|w-full)(?:\s|")/i.test(out)
  if (leaked) bad++
  console.log(`  ${leaked ? '*** LEAKED ***' : 'BLOCKED'}  ${name.padEnd(28)} -> ${out.slice(0,88)}`)
}

console.log('\nSCHEME VECTORS — must all be neutralised:')
for (const a of ATTACKS) {
  const raw = renderRichText(doc(a))
  const safe = render(doc(a))
  const stillThere = /href="(?!#")/.test(safe) && !/href="#"/.test(safe)
  const ok = !stillThere
  if (!ok) bad++
  console.log(`  ${ok ? 'BLOCKED' : '*** LEAKED ***'}  ${JSON.stringify(a).slice(0,44).padEnd(46)} -> ${safe.match(/href="[^"]*"/)?.[0] ?? '(none)'}`)
}
console.log('\nLEGITIMATE — must all survive untouched:')
for (const l of LEGIT) {
  const raw = renderRichText(doc(l))
  const safe = render(doc(l))
  const ok = raw === safe
  if (!ok) bad++
  console.log(`  ${ok ? 'kept   ' : '*** BROKEN ***'}  ${l.padEnd(46)} -> ${safe.match(/href="[^"]*"/)?.[0] ?? '(none)'}`)
}
console.log(`\n${bad === 0 ? 'PASS — 0 leaked, 0 broken' : 'FAIL — ' + bad + ' problem(s)'}`)
process.exit(bad === 0 ? 0 : 1)
