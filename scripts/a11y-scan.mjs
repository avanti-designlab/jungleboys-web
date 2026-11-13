// WCAG 2.1 AA regression guard — axe-core over every template.
//
//   node scripts/a11y-scan.mjs [--origin=http://localhost:3100]
//
// Exits non-zero when any serious/critical violation appears that is not in
// the allowlist below, so CI fails before a regression ships. Born from the
// 2026-11-12 compliance pass (5 findings across 25 templates; 3 real, fixed,
// 2 were the recorded reveal-trap). KNOWN TRAP, do not re-learn it: axe
// samples mid-animation. A color-contrast hit where foreground AND background
// read nearly identical is almost always an element caught mid-reveal; verify
// with scripts/contrast-verify.mjs (which centres + settles) before fixing
// anything, per the 2026-07-30 measurement rule.
import fs from 'node:fs'
import { launch, wait } from './lib/cdp.mjs'

const AXE = fs.readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8')
const argv = process.argv.slice(2)
const flag = (n, d) => {
  const hit = argv.find((a) => a.startsWith(`--${n}=`))
  return hit ? hit.slice(n.length + 3) : d
}
const origin = flag('origin', 'http://localhost:3100')

const PAGES = [
  '/', '/products', '/products/premium-flower', '/products/hash-hole', '/products/orc',
  '/shop', '/menu/california/downtown-los-angeles',
  '/menu/california/downtown-los-angeles/shop/flower',
  '/menu/california/downtown-los-angeles/deals',
  '/menu/california/downtown-los-angeles/drops',
  '/menu/california/downtown-los-angeles/brands',
  '/locations', '/contact', '/find-jb-products', '/rewards', '/media', '/faq',
  '/phenos', '/wholesale', '/careers', '/login', '/blog', '/terms', '/privacy',
  '/accessibility',
]

// rule id -> reason. Add entries ONLY with a recorded ruling.
const ALLOW = {
  // (none today)
}

const b = await launch({ port: 9410, width: 1440, height: 900 })
let failures = 0
for (const p of PAGES) {
  await b.goto(origin.replace(/\/$/, '') + p)
  await b.evaluate(AXE)
  // walk the page so lazy content mounts, then return to top and settle —
  // reveals that have FIRED resolve to their end state before axe samples
  await b.evaluate(`(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));
    for(let y=0;y<Math.min(document.body.scrollHeight,12000);y+=1000){window.scrollTo(0,y);await w(60)}
    window.scrollTo(0,0);await w(600);return 'ok'})()`)
  await wait(1500)
  const raw = await b.evaluate(`(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']},resultTypes:['violations']});
    return JSON.stringify(r.violations.filter(v=>v.impact==='serious'||v.impact==='critical')
      .map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length,sample:v.nodes[0]&&v.nodes[0].target.join(' ')})))})()`)
  const violations = JSON.parse(raw).filter((v) => !ALLOW[v.id])
  if (violations.length) {
    failures += violations.length
    for (const v of violations) console.log(`FAIL ${p}: [${v.impact}] ${v.id} x${v.nodes} — ${v.sample}`)
  } else {
    console.log(`ok   ${p}`)
  }
}
await b.kill()
if (failures) {
  console.log(`\n${failures} rule(s) failed. Mid-animation contrast hits: verify with scripts/contrast-verify.mjs before changing colors.`)
  process.exit(1)
}
console.log('\nall pages pass WCAG 2.1 AA (axe, serious+critical)')
