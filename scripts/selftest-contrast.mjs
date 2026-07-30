// Validates the contrast harness before anyone trusts a number from it.
//
//   node scripts/selftest-contrast.mjs
//
// Each case below is a trap that produced a WRONG verdict at least once this
// week. The expected ratios are computed by hand from the fixture's declared
// colours (see scripts/fixtures/contrast-fixture.html) and hardcoded here on
// purpose — deriving them from the harness would only prove it agrees with
// itself. Exit code 0 = the instrument may be trusted.
import http from 'node:http'
import fs from 'node:fs'
import { spawn } from 'node:child_process'

const FIXTURE = fs.readFileSync(new URL('./fixtures/contrast-fixture.html', import.meta.url), 'utf8')
// Same page with the theme boot script removed, to prove the theme assertion fires.
const NO_THEME = FIXTURE.replace(/<script>try\{if\(localStorage[\s\S]*?<\/script>/, '')

const PORT = 9799
const server = http.createServer((req, res) => {
  const body = req.url.startsWith('/no-theme') ? NO_THEME : FIXTURE
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
  res.end(body)
})
await new Promise((r) => server.listen(PORT, '127.0.0.1', r))

const fails = []
const ok = (name, cond, detail) => {
  process.stdout.write(`${cond ? '  ok  ' : '  FAIL'}  ${name}${detail ? '  — ' + detail : ''}\n`)
  if (!cond) fails.push(name)
}

// ---------------------------------------------------------------------------
// 1. The WCAG formula itself, against published reference pairs.
// ---------------------------------------------------------------------------
function lum([r, g, b]) {
  const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const ratio = (a, c) => {
  const l1 = lum(a), l2 = lum(c)
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}
const near = (a, b, tol = 0.06) => Math.abs(a - b) <= tol

console.log('\nformula')
ok('black on white = 21.00', near(ratio([0, 0, 0], [255, 255, 255]), 21.0, 0.01))
ok('#767676 on white = 4.54 (the AA boundary grey)',
  near(ratio([118, 118, 118], [255, 255, 255]), 4.54, 0.01))
ok('white on white = 1.00', near(ratio([255, 255, 255], [255, 255, 255]), 1.0, 0.001))

// ---------------------------------------------------------------------------
// 2. The full pipeline, end to end, through the real sweep script.
// ---------------------------------------------------------------------------
function sweep(url, extra = []) {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, [
      new URL('./contrast-sweep.mjs', import.meta.url).pathname,
      '--theme=dark', '--port=9481', `--url=${url}`, ...extra,
    ], { stdio: ['ignore', 'pipe', 'pipe'] })
    let out = '', err = ''
    p.stdout.on('data', (d) => { out += d })
    p.stderr.on('data', (d) => { err += d })
    p.on('close', (code) => resolve({ code, out, err }))
  })
}

console.log('\npipeline (dark theme, fixture page)')
const run = await sweep(`http://127.0.0.1:${PORT}/fixture.html`)
let found = []
try { found = JSON.parse(run.out) } catch {
  console.log(run.err.slice(-2000))
  ok('sweep produced parseable JSON', false, `exit ${run.code}`)
}
const by = (tag) => found.find((f) => f.text.includes(tag))

// Reported failures: the harness must find these, with these ratios.
ok('CASE-B  opaque #666666 on #0A0A0F reported at 3.44',
  by('CASE-B') && near(by('CASE-B').ratio, 3.44), by('CASE-B') ? `got ${by('CASE-B').ratio}` : 'NOT REPORTED')

ok('CASE-C  oklab/color-mix translucent reported at 3.23 (rgba-only parser drops this)',
  by('CASE-C') && near(by('CASE-C').ratio, 3.23), by('CASE-C') ? `got ${by('CASE-C').ratio}` : 'NOT REPORTED')

const d = by('CASE-D')
ok('CASE-D  scored against the painted glow (1.29), not the ancestor bg (19.75)',
  d && near(d.ratio, 1.29), d ? `got ${d.ratio} on ground ${d.ground}` : 'NOT REPORTED')
ok('CASE-D  sampled ground is the glow #ffe24d', d && d.ground.toLowerCase() === '#ffe24d',
  d ? d.ground : 'n/a')

ok('CASE-H2 #616161 at 16px reported at 3.19 (needs 4.5)',
  by('CASE-H2') && near(by('CASE-H2').ratio, 3.19), by('CASE-H2') ? `got ${by('CASE-H2').ratio}` : 'NOT REPORTED')

// Silences: the harness must NOT invent these.
ok('CASE-A  19.75:1 opaque pass is silent', !by('CASE-A'))
ok('CASE-E  text under a pinned bar is silent (phantom white-on-yellow class)', !by('CASE-E'))
ok('CASE-F  sr-only text is silent', !by('CASE-F'))
ok('CASE-G  backface-culled face is silent', !by('CASE-G'))
ok('CASE-H1 same colour at 24px passes the 3.0 large-text floor', !by('CASE-H1'))

// ---------------------------------------------------------------------------
// 3. The theme guard. A page that never applies data-theme must ABORT the
//    sweep, not quietly return light-mode numbers labelled dark.
// ---------------------------------------------------------------------------
console.log('\ntheme guard')
const guard = await sweep(`http://127.0.0.1:${PORT}/no-theme.html`)
ok('sweep aborts when data-theme never lands',
  guard.code !== 0 && /theme assertion failed/.test(guard.err),
  `exit ${guard.code}`)

server.close()
console.log(`\n${fails.length ? `${fails.length} FAILED: ${fails.join(', ')}` : 'instrument validated — all checks passed'}\n`)
process.exit(fails.length ? 1 : 0)
