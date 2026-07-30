// AA contrast sweep against the REAL painted ground, in either theme.
//
//   node scripts/contrast-sweep.mjs --theme=dark --set=themed --origin=http://localhost:3100
//   node scripts/contrast-sweep.mjs --theme=dark --mobile --url=http://localhost:3100/rewards
//
// Serve a PRODUCTION build. The dev server is not a valid instrument — it
// recompiles routes on first hit and paints the previous page while it does.
//
// Validate the instrument before trusting a number: scripts/selftest-contrast.mjs
// drives this same code over fixtures whose ratios are known analytically.
import fs from 'node:fs'
import { launch, wait } from './lib/cdp.mjs'
import { resolve as resolveRoutes } from './lib/routes.mjs'

const PROBE = fs.readFileSync(new URL('./lib/contrast-probe.js', import.meta.url), 'utf8')

const argv = process.argv.slice(2)
const flag = (n, d) => {
  const hit = argv.find((a) => a.startsWith(`--${n}=`))
  return hit ? hit.slice(n.length + 3) : d
}
const has = (n) => argv.includes(`--${n}`)

const theme = flag('theme', 'light')
const mobile = has('mobile')
const origin = flag('origin', 'http://localhost:3100')
const port = Number(flag('port', mobile ? 9412 : 9411))
const explicit = argv.filter((a) => a.startsWith('--url=')).map((a) => a.slice(6))
const urls = explicit.length ? explicit : resolveRoutes(flag('set', 'themed'), origin)

const b = await launch({
  port, width: mobile ? 390 : 1440, height: mobile ? 844 : 900, mobile, theme,
})

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

/** id -> { worstRec, best, maxAlpha } across every scroll step of the sweep. */
const seenEls = new Map()

// One row per element, already deduped by identity. `best` is the element's
// most-readable observed state: best < need means it never clears AA anywhere
// on the page (a real finding), while best >= need means it only failed while
// a scrub had it part-way faded or part-way across a changing ground.
function collate() {
  const out = []
  for (const { worstRec, best, maxAlpha } of seenEls.values()) {
    if (worstRec.ratio >= worstRec.need) continue
    out.push({ ...worstRec, best: +best.toFixed(2), maxAlpha: +maxAlpha.toFixed(3),
      everPasses: best >= worstRec.need })
  }
  return out.sort((a, b) => a.ratio - b.ratio)
}

// Results are flushed after EVERY route when --out is given. Printing only at
// the end means one lost CDP round-trip on route 11 of 15 discards ten
// completed routes — which is exactly what happened to the QA gate.
const outFile = flag('out', '')

for (const url of urls) {
  const overlays = await b.goto(url)
  if (overlays && overlays.length) process.stderr.write(`OVERLAY on ${url}: ${JSON.stringify(overlays)}\n`)
  const height = await b.evaluate(`document.documentElement.scrollHeight`)
  const vh = await b.evaluate(`innerHeight`)
  const steps = []
  for (let y = 0; y < height; y += Math.round(vh * 0.85)) steps.push(y)
  if (steps.length > 26) steps.length = 26

  for (const y of steps) {
    process.stderr.write(`  y=${y}\n`)
    await b.evaluate(`window.scrollTo(0, ${y})`)
    await wait(900)
    await b.evaluate(PROBE)
    // Wait for scroll-triggered reveals to REACH THEIR RESTING STATE. Measuring
    // an element that is still fading in scores its opaque colour as though it
    // were translucent and invents failures that no visitor ever sees. Marquees
    // never settle, so give up after ~6s and mark the step unsettled rather than
    // silently reporting mid-flight numbers as fact.
    let settled = false
    let prev = await b.evaluate(`window.__DG.signature()`)
    for (let t = 0; t < 15; t++) {
      await wait(400)
      const cur = await b.evaluate(`window.__DG.signature()`)
      if (cur === prev) { settled = true; break }
      prev = cur
    }
    if (!settled) process.stderr.write(`  UNSETTLED y=${y} (animation still running)\n`)
    const els = await b.evaluate(`JSON.stringify(window.__DG.collect())`).then(JSON.parse)
    if (!els.length) continue
    await b.evaluate(`window.__DG.nullText(true)`)
    await wait(260)
    // rects re-read in the same paint window as the plate
    const before = await b.evaluate(`JSON.stringify(window.__DG.refreshRects())`).then(JSON.parse)
    const plate = await b.screenshot()
    const after = await b.evaluate(`JSON.stringify({scrollY: Math.round(scrollY), h: document.documentElement.scrollHeight})`).then(JSON.parse)
    await b.evaluate(`window.__DG.nullText(false)`)
    if (before.scrollY !== after.scrollY || before.h !== after.h) {
      process.stderr.write(`  SKIP y=${y}: layout moved ${JSON.stringify(before)} -> ${JSON.stringify(after)}\n`)
      continue
    }
    const sampled = await b.evaluate(
      `window.__DG.sample("${plate}").then(r => JSON.stringify(r))`
    ).then(JSON.parse)

    els.forEach((e, i) => {
      const s = sampled[i]
      if (!s || !s.cands.length) return
      const alpha = e.rgba[3] * e.opacity
      if (alpha <= 0.02) return
      // Only grounds that actually cover a fifth of the glyph box count. A 2%
      // sliver is the box clipping a rounded corner or a border line, not the
      // surface the letters are read against — scoring against it invents
      // failures. Fall back to the single dominant ground.
      let pool = s.cands.filter((c) => c.share >= 0.2)
      if (!pool.length) pool = [{ rgb: s.mean, share: -1 }]
      let worst = null
      for (const c of pool) {
        const fg = over(e.rgba, alpha, c.rgb)
        const r = ratio(fg, c.rgb)
        if (!worst || r < worst.r) worst = { r, ground: c.rgb, share: c.share, fg }
      }
      const need = e.large ? 3 : 4.5
      // Record EVERY measurement, pass or fail, keyed by element identity.
      //
      // Scroll-linked (scrubbed) reveals hold a stable-but-partial opacity at a
      // given scroll offset, so waiting for a settled frame does not separate
      // "permanently unreadable" from "caught halfway through its fade". Only
      // comparing an element's worst state against its BEST state does. An
      // element that reaches AA at some scroll offset was mid-transition when it
      // failed; one that never reaches AA anywhere is a genuine finding.
      const id = `${url}|${e.tag}|${e.cls}|${e.text}`
      const rec = seenEls.get(id)
      const cur = {
        url: new URL(url).pathname + (mobile ? ' [390]' : '') + ` [${theme}]`,
        y, settled, text: e.text, cls: e.cls, tag: e.tag,
        color: e.color, alpha: +alpha.toFixed(3), fs: e.fs, fw: e.fw, large: e.large,
        ratio: +worst.r.toFixed(2), need, fg: hex(worst.fg), ground: hex(worst.ground),
        share: worst.share, ariaHidden: e.ariaHidden, stroke: e.stroke, shadow: e.shadow,
        mixBlend: e.mixBlend, bgClip: e.bgClip, rect: e.rect, boxes: e.boxes.length,
        cands: s.cands.slice(0, 5).map((c) => hex(c.rgb) + '@' + c.share),
      }
      if (!rec) {
        seenEls.set(id, { worstRec: cur, best: worst.r, maxAlpha: alpha })
      } else {
        if (worst.r < rec.worstRec.ratio) rec.worstRec = cur
        if (worst.r > rec.best) rec.best = worst.r
        if (alpha > rec.maxAlpha) rec.maxAlpha = alpha
      }
    })
  }
  process.stderr.write(`done ${url}\n`)
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(collate(), null, 1))
}

console.log(JSON.stringify(collate(), null, 1))
b.kill()
process.exit(0)
