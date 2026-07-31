// LCP under throttling, with the LCP element identified and the critical path
// itemised. Reproducible, because an LCP number without its conditions is noise.
//
//   node scripts/measure-lcp.mjs --url=http://localhost:3100/products/pre-rolls --runs=3
//   node scripts/measure-lcp.mjs --url=... --runs=3 --desktop --no-throttle
//
// Defaults reproduce the QA gate's conditions — mobile 390, 4x CPU, slow 4G
// (150ms RTT, 1.6 Mbps down) — which is what bracketed the 3160ms field figure.
// Serve a PRODUCTION build; the dev server is not a valid instrument.
//
// Reports the MEDIAN across runs. A single LCP run on a throttled connection
// varies by hundreds of ms, so a before/after built on one sample each can show
// a "win" that is pure noise — which is the whole reason this file exists.
import { launch, wait } from './lib/cdp.mjs'

const argv = process.argv.slice(2)
const flag = (n, d) => {
  const hit = argv.find((a) => a.startsWith(`--${n}=`))
  return hit ? hit.slice(n.length + 3) : d
}
const has = (n) => argv.includes(`--${n}`)

const url = flag('url', 'http://localhost:3100/products/pre-rolls')
const runs = Number(flag('runs', 3))
const desktop = has('desktop')
const throttle = !has('no-throttle')

const b = await launch({
  port: Number(flag('port', 9620)),
  width: desktop ? 1440 : 390,
  height: desktop ? 900 : 844,
  mobile: !desktop,
  theme: flag('theme', 'light'),
})

await b.send('Network.enable')

// LCP must be captured by an observer registered BEFORE navigation.
// performance.getEntriesByType('largest-contentful-paint') returns nothing —
// LCP entries are delivered to a PerformanceObserver, not parked in the
// timeline buffer for retrieval. Reading it the obvious way yields null on
// every run, which looks like "no LCP" rather than "wrong API".
await b.send('Page.addScriptToEvaluateOnNewDocument', {
  source: `(() => { window.__LCP = null;
    try {
      new PerformanceObserver((l) => {
        const e = l.getEntries(); const last = e[e.length - 1];
        if (!last) return;
        window.__LCP = {
          t: last.startTime,
          url: last.url || '',
          size: last.size || 0,
          tag: last.element ? last.element.tagName.toLowerCase() : '',
          cls: last.element ? String(last.element.className || '').slice(0, 60) : '',
        };
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {}
  })()`,
})

// CLS alongside LCP, because they trade against each other. Dropping a font
// preload buys LCP by letting text paint in a fallback first — and pays for it
// in layout shift when the real face arrives. Reporting one without the other
// would make a regression look like a win.
await b.send('Page.addScriptToEvaluateOnNewDocument', {
  source: `(() => { window.__CLS = 0;
    try {
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) if (!e.hadRecentInput) window.__CLS += e.value;
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (e) {}
  })()`,
})

// Seed storage and assert the theme ONCE, unthrottled. goto() waits for
// readyState 'complete', which on slow 4G with ~900KB of hero art exceeds its
// 30s budget and aborts the run — so the measured navigations below use
// Page.navigate and wait on the LCP observer instead of on load completion.
await b.goto(url, 1500)

const samples = []
let lastDetail = null

for (let i = 0; i < runs; i++) {
  // Fresh conditions each run; a warm HTTP cache turns run 2 into a different
  // experiment from run 1.
  await b.send('Network.clearBrowserCache')
  if (throttle) {
    await b.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    await b.send('Network.emulateNetworkConditions', {
      offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8, connectionType: 'cellular4g',
    })
  }

  await b.send('Page.navigate', { url: 'about:blank' })
  // DRAIN. 400ms was not enough: on a throttled pipe the PREVIOUS run's
  // downloads are still in flight and they delay the next run's LCP request by
  // ~850ms, inflating the discovery segment from ~170ms to ~1030ms. That is not
  // noise around a true value — it is a second, wrong value the run lands on
  // roughly half the time. /products/hash-hole alternated 1872/3004/1872/3028,
  // and the 2872ms figure recorded in CLAUDE.md was one contaminated sample.
  // Drained, it measures 1872ms and passes.
  await wait(Number(flag('drain', 4000)))
  await b.send('Page.navigate', { url })
  // Poll the observer rather than waiting on readyState. LCP can still be
  // revised upward after it first reports, so keep going until it stops moving.
  let stable = 0, prev = null
  for (let t = 0; t < 60; t++) {
    await wait(500)
    const cur = await b.evaluate(`window.__LCP ? Math.round(window.__LCP.t) : null`).catch(() => null)
    if (cur != null && cur === prev) { stable++; if (stable >= 4) break } else stable = 0
    prev = cur
  }

  const detail = await b.evaluate(`JSON.stringify((() => {
    const lcp = window.__LCP ? { startTime: window.__LCP.t, url: window.__LCP.url,
      size: window.__LCP.size, element: { tagName: window.__LCP.tag + (window.__LCP.cls ? '.' + window.__LCP.cls.split(' ')[0] : '') } } : null;
    const nav = performance.getEntriesByType('navigation')[0] || {};
    const res = performance.getEntriesByType('resource')
      .map(r => ({ name: r.name.split('/').pop().slice(0, 46), kb: Math.round((r.transferSize||0)/1024),
                   end: Math.round(r.responseEnd), type: r.initiatorType }))
      .filter(r => r.kb > 8)
      .sort((a, b) => b.kb - a.kb).slice(0, 12);
    return {
      lcp: lcp ? Math.round(lcp.startTime) : null,
      lcpEl: lcp ? (lcp.url ? lcp.url.split('/').pop().slice(0, 60) : (lcp.element ? lcp.element.tagName : '?')) : null,
      lcpSize: lcp ? lcp.size : null,
      cls: Math.round((window.__CLS || 0) * 1000) / 1000,
      dcl: Math.round(nav.domContentLoadedEventEnd || 0),
      resources: res,
    };
  })())`).then(JSON.parse)

  if (detail.lcp != null) samples.push(detail.lcp)
  lastDetail = detail
  process.stderr.write(`  run ${i + 1}/${runs}: LCP ${detail.lcp}ms  (${detail.lcpEl})\n`)
}

samples.sort((a, b) => a - b)
const median = samples.length ? samples[Math.floor(samples.length / 2)] : null
const spread = samples.length ? samples[samples.length - 1] - samples[0] : null

// SPREAD GUARD. This field was already computed and printed, and nothing
// consumed it — so a median with a 2164ms spread on a 2500ms budget got
// recorded as a point fact. A median is only a verdict when the runs agree:
// the same page measured 1928ms over 3 runs and 2820ms over 7. Refuse to
// report a verdict when the spread is a meaningful fraction of the budget.
const BUDGET = 2500

// A run that collected NOTHING must not return a verdict. When a refactor left
// the navigation out, every median came back null and the row still printed
// "UNRELIABLE — spread too wide" as though something had been measured. Same
// shape as the unstyled-page trap one layer up: a broken run has to be
// distinguishable from a clean one, so this throws rather than reports.
if (!samples.length) {
  throw new Error(
    `no LCP samples collected for ${url} — the page never loaded, or the observer ` +
    `never fired. Check that resources were fetched at all before trusting any number.`
  )
}

const RELIABLE = spread != null && spread <= BUDGET * 0.2 // 500ms
const verdict = !RELIABLE ? 'UNRELIABLE — spread too wide to call'
  : median <= BUDGET ? 'PASS' : 'FAIL'

console.log(JSON.stringify({
  url,
  conditions: throttle
    ? `${desktop ? 'desktop 1440' : 'mobile 390'} + 4x CPU + slow4G (150ms RTT, 1.6Mbps)`
    : `${desktop ? 'desktop 1440' : 'mobile 390'} unthrottled`,
  runs: samples, cls: lastDetail?.cls,
  median,
  spread,
  verdict,
  reliable: RELIABLE,
  lcpElement: lastDetail?.lcpEl,
  heaviestResources: lastDetail?.resources,
}, null, 1))

b.kill()
process.exit(0)
