// Re-measure each candidate finding with the element SCROLLED INTO VIEW.
//
//   node scripts/contrast-verify.mjs findings.json [--origin=http://localhost:3100]
//
// Why this exists. contrast-sweep.mjs walks a page in fixed 85%-viewport steps.
// An element whose reveal is scroll-triggered can sit at a partial opacity at
// EVERY one of those steps — settled, stable, and still not the state a visitor
// reads it in. Five `/rewards` findings looked real that way; centred and
// allowed to settle, all five are fully opaque and pass comfortably.
//
// So: the sweep proposes, this disposes. A finding is only real if it still
// fails when the element is placed where a visitor would actually read it.
import fs from 'node:fs'
import { launch, wait } from './lib/cdp.mjs'

const PROBE = fs.readFileSync(new URL('./lib/contrast-probe.js', import.meta.url), 'utf8')
const argv = process.argv.slice(2)
const file = argv.find((a) => !a.startsWith('--'))
const flag = (n, d) => {
  const hit = argv.find((a) => a.startsWith(`--${n}=`))
  return hit ? hit.slice(n.length + 3) : d
}
const origin = flag('origin', 'http://localhost:3100')
const findings = JSON.parse(fs.readFileSync(file, 'utf8'))

function lum([r, g, bb]) {
  const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bb)
}
const ratio = (a, c) => {
  const l1 = lum(a), l2 = lum(c)
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}
const over = (fg, a, bg) => [0, 1, 2].map((i) => Math.round(fg[i] * a + bg[i] * (1 - a)))
const hex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('')

// group by (path, viewport) so one browser per configuration
const groups = new Map()
for (const f of findings) {
  const mobile = f.url.includes('[390]')
  const theme = f.url.includes('[dark]') ? 'dark' : 'light'
  const path = f.url.split(' ')[0]
  const k = `${mobile ? 'm' : 'd'}|${theme}`
  if (!groups.has(k)) groups.set(k, { mobile, theme, items: [] })
  groups.get(k).items.push({ ...f, path })
}

const results = []
let port = 9500
for (const { mobile, theme, items } of groups.values()) {
  const b = await launch({
    port: port++, width: mobile ? 390 : 1440, height: mobile ? 844 : 900, mobile, theme,
  })
  for (const f of items) {
    const url = origin.replace(/\/$/, '') + f.path
    // Reload for EVERY finding rather than scrolling between them on one page
    // load. Reveals here reverse when scrolled back past, so revisiting an
    // element from an unusual scroll path measures a state no first-time
    // visitor sees — `/rewards` "Level Up" read 0.315 that way and 1.0 on a
    // clean approach. Slower, but it measures the state people actually meet.
    await b.goto(url)

    await b.evaluate(PROBE)
    // Centre the target and let its reveal finish.
    const placed = await b.evaluate(`(async () => {
      const want = ${JSON.stringify(f.text)};
      const el = [...document.querySelectorAll(${JSON.stringify(f.tag)})].find(e => {
        let t=''; for (const n of e.childNodes) if (n.nodeType===3) t += n.nodeValue;
        return t.replace(/\\s+/g,' ').trim().slice(0,60) === want;
      });
      if (!el) return false;
      el.scrollIntoView({ block: 'center', behavior: 'instant' });
      window.__DG_TARGET = el;
      return true;
    })()`)
    if (!placed) { results.push({ ...f, verified: null, note: 'element not found when centred' }); continue }

    // A minimum dwell BEFORE settle-detection starts. A ScrollTrigger that has
    // not fired yet is perfectly stable, and therefore indistinguishable from
    // one that has finished — `/rewards` "Level Up" was scored at opacity 0.315
    // that way, then measured 1.0 when simply given longer. Settle-detection
    // can only tell you an animation STOPPED, never that it started.
    await wait(2500)
    let prev = await b.evaluate(`window.__DG.signature()`)
    let stable = 0
    for (let t = 0; t < 15; t++) {
      await wait(400)
      const cur = await b.evaluate(`window.__DG.signature()`)
      stable = cur === prev ? stable + 1 : 0
      prev = cur
      if (stable >= 2) break
    }

    const els = await b.evaluate(`JSON.stringify(window.__DG.collect())`).then(JSON.parse)
    const idx = await b.evaluate(`window.__DG._els.findIndex(e => e.el === window.__DG_TARGET)`)
    if (idx < 0) { results.push({ ...f, verified: null, note: 'centred element no longer painted (culled/clipped/hidden)' }); continue }

    await b.evaluate(`window.__DG.nullText(true)`)
    await wait(260)
    await b.evaluate(`window.__DG.refreshRects()`)
    const plate = await b.screenshot()
    await b.evaluate(`window.__DG.nullText(false)`)
    const sampled = await b.evaluate(`window.__DG.sample("${plate}").then(r => JSON.stringify(r))`).then(JSON.parse)

    const e = els[idx], s = sampled[idx]
    if (!s || !s.cands.length) { results.push({ ...f, verified: null, note: 'no ground sampled' }); continue }
    const alpha = e.rgba[3] * e.opacity
    let pool = s.cands.filter((c) => c.share >= 0.2)
    if (!pool.length) pool = [{ rgb: s.mean, share: -1 }]
    let worst = null
    for (const c of pool) {
      const fg = over(e.rgba, alpha, c.rgb)
      const r = ratio(fg, c.rgb)
      if (!worst || r < worst.r) worst = { r, ground: c.rgb, fg }
    }
    const need = e.large ? 3 : 4.5
    results.push({
      url: f.url, text: f.text, cls: f.cls, sweptRatio: f.ratio,
      verified: +worst.r.toFixed(2), need, alphaAtRest: +alpha.toFixed(3),
      fg: hex(worst.fg), ground: hex(worst.ground), ariaHidden: e.ariaHidden,
      real: worst.r < need,
    })
  }
  b.kill()
}

const real = results.filter((r) => r.real)
const cleared = results.filter((r) => r.verified !== null && !r.real)
const unknown = results.filter((r) => r.verified === null)
process.stderr.write(`\nverified ${results.length}: ${real.length} REAL, ${cleared.length} cleared once centred, ${unknown.length} indeterminate\n`)
console.log(JSON.stringify({ real, cleared, unknown }, null, 1))
process.exit(0)
