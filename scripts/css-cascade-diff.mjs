// Prove a CSS refactor changed NOTHING for the visitor it wasn't meant to affect.
//
// Hoisting rules out of @media (prefers-reduced-motion: no-preference) moves
// them EARLIER in source order. For two declarations of equal specificity the
// later one wins, so a hoist can silently lose a conflict it used to win. The
// intended change is only visible under `reduce`; under `no-preference` the
// computed styles must be byte-identical.
//
// Usage:
//   node scripts/css-cascade-diff.mjs capture <label>   # snapshot every page
//   node scripts/css-cascade-diff.mjs diff <a> <b>      # compare two snapshots
//
// Snapshots land in .cascade/<label>.json (gitignored scratch).
import { spawn } from 'node:child_process'
import crypto from 'node:crypto'
import net from 'node:net'
import fs from 'node:fs'
import path from 'node:path'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 9391
const ORIGIN = process.env.ORIGIN || 'http://localhost:3000'
const OUT = '.cascade'

const PAGES = [
  '/', '/products', '/products/pops', '/products/all-in-one',
  '/products/premium-flower', '/products/hash-hole', '/products/twins',
  '/products/10-pack-prerolls', '/products/pre-rolls', '/rewards',
  '/contact', '/wholesale', '/locations', '/phenos',
]

// Only properties the hoisted declarations could possibly touch. A full dump
// would drown the diff in layout noise from fonts and images loading.
const PROPS = [
  'background-color', 'background-image', 'background-size', 'background-position',
  'background-repeat', 'opacity', 'display', 'color', 'position',
  '-webkit-text-stroke-width', '-webkit-text-stroke-color', '-webkit-mask-image',
  'mask-image', 'grid-area', 'rotate', 'translate', 'filter', 'box-shadow',
  'pointer-events', 'animation-name', 'animation-duration', 'animation-play-state',
  'animation-iteration-count', 'transition-property', 'transition-duration',
]

const wait = ms => new Promise(r => setTimeout(r, ms))

async function getWsUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const tabs = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
      const page = tabs.find(t => t.type === 'page')
      if (page) return page.webSocketDebuggerUrl
    } catch {}
    await wait(250)
  }
  throw new Error('chrome never came up')
}

function wsConnect(url) {
  const { hostname, port, pathname } = new URL(url)
  return new Promise((resolve, reject) => {
    const key = crypto.randomBytes(16).toString('base64')
    const sock = net.connect(Number(port), hostname, () => {
      sock.write(`GET ${pathname} HTTP/1.1\r\nHost: ${hostname}:${port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`)
    })
    let up = false, buf = Buffer.alloc(0)
    const waiting = new Map()
    let id = 0
    const send = (method, params = {}) => new Promise((res) => {
      const mid = ++id
      waiting.set(mid, res)
      const payload = Buffer.from(JSON.stringify({ id: mid, method, params }))
      const mask = crypto.randomBytes(4)
      let header
      if (payload.length < 126) header = Buffer.from([0x81, 0x80 | payload.length])
      else if (payload.length < 65536) { header = Buffer.alloc(4); header[0] = 0x81; header[1] = 0x80 | 126; header.writeUInt16BE(payload.length, 2) }
      else { header = Buffer.alloc(10); header[0] = 0x81; header[1] = 0x80 | 127; header.writeBigUInt64BE(BigInt(payload.length), 2) }
      const masked = Buffer.from(payload)
      for (let i = 0; i < masked.length; i++) masked[i] ^= mask[i % 4]
      sock.write(Buffer.concat([header, mask, masked]))
    })
    sock.on('data', d => {
      if (!up) {
        const s = d.toString()
        const idx = s.indexOf('\r\n\r\n')
        if (idx === -1) return
        up = true
        resolve({ send })
        d = d.subarray(Buffer.byteLength(s.slice(0, idx + 4)))
        if (!d.length) return
      }
      buf = Buffer.concat([buf, d])
      while (buf.length >= 2) {
        const len7 = buf[1] & 0x7f
        let off = 2, len = len7
        if (len7 === 126) { if (buf.length < 4) return; len = buf.readUInt16BE(2); off = 4 }
        else if (len7 === 127) { if (buf.length < 10) return; len = Number(buf.readBigUInt64BE(2)); off = 10 }
        if (buf.length < off + len) return
        const frame = buf.subarray(off, off + len).toString()
        buf = buf.subarray(off + len)
        try {
          const msg = JSON.parse(frame)
          if (msg.id && waiting.has(msg.id)) { waiting.get(msg.id)(msg); waiting.delete(msg.id) }
        } catch {}
      }
    })
    sock.on('error', reject)
  })
}

const FINGERPRINT = (props) => `(() => {
  const PROPS = ${JSON.stringify(props)};
  const pathOf = (el) => {
    const p = [];
    while (el && el.nodeType === 1 && el !== document.documentElement) {
      p.unshift(el.tagName + '.' + ([...el.parentNode.children].indexOf(el)));
      el = el.parentElement;
    }
    return p.join('>');
  };
  const out = {};
  for (const el of document.querySelectorAll('*')) {
    const rec = {};
    const cs = getComputedStyle(el);
    for (const p of PROPS) { const v = cs.getPropertyValue(p); if (v) rec[p] = v; }
    for (const ps of ['::before', '::after']) {
      const c = getComputedStyle(el, ps);
      if (c.content && c.content !== 'none') {
        for (const p of PROPS) { const v = c.getPropertyValue(p); if (v) rec[ps + ' ' + p] = v; }
      }
    }
    out[pathOf(el)] = rec;
  }
  return JSON.stringify(out);
})()`

async function capture(label, { reduce = false } = {}) {
  const args = [
    '--headless=new', `--remote-debugging-port=${PORT}`, '--no-first-run',
    '--window-size=1440,900', '--hide-scrollbars', '--mute-audio',
  ]
  if (reduce) args.push('--force-prefers-reduced-motion')
  args.push('about:blank')
  const chrome = spawn(CHROME, args, { stdio: 'ignore' })
  process.on('exit', () => chrome.kill())

  const ws = await wsConnect(await getWsUrl())
  const evaluate = async (expression) => {
    const r = await ws.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails))
    return r.result?.result?.value
  }
  await ws.send('Page.enable')

  // Suppress the three overlays that otherwise sit on top of every page and
  // make the fingerprint about THEM rather than the page underneath.
  await ws.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `try{
      localStorage.setItem('jb-age-gate', JSON.stringify({verifiedAt: Date.now()}));
      localStorage.setItem('jb-cookie-consent', JSON.stringify({choice:'necessary', at: Date.now()}));
      sessionStorage.setItem('jb-intro-done','1');
    }catch(e){}`,
  })

  const snap = {}
  for (const p of PAGES) {
    await ws.send('Page.navigate', { url: ORIGIN + p })
    await wait(4200)
    const motionMode = await evaluate(`matchMedia('(prefers-reduced-motion: reduce)').matches`)
    if (motionMode !== reduce) throw new Error(`motion mode mismatch on ${p}: wanted reduce=${reduce}`)
    snap[p] = JSON.parse(await evaluate(FINGERPRINT(PROPS)))
    process.stdout.write(`  ${p} — ${Object.keys(snap[p]).length} elements\n`)
  }
  fs.mkdirSync(OUT, { recursive: true })
  fs.writeFileSync(path.join(OUT, label + '.json'), JSON.stringify(snap))
  chrome.kill()
  console.log(`\nwrote ${OUT}/${label}.json`)
}

function diff(a, b) {
  const A = JSON.parse(fs.readFileSync(path.join(OUT, a + '.json')))
  const B = JSON.parse(fs.readFileSync(path.join(OUT, b + '.json')))
  let changed = 0, checked = 0
  for (const page of Object.keys(A)) {
    const rows = []
    for (const el of Object.keys(A[page])) {
      const ra = A[page][el], rb = B[page]?.[el]
      if (!rb) continue // DOM differs run-to-run (lazy images); not a CSS signal
      for (const prop of Object.keys(ra)) {
        checked++
        if (rb[prop] !== undefined && ra[prop] !== rb[prop]) {
          rows.push(`    ${el.split('>').slice(-3).join('>')}\n      ${prop}: ${ra[prop]}  ->  ${rb[prop]}`)
          changed++
        }
      }
    }
    if (rows.length) {
      console.log(`\n${page} — ${rows.length} changed`)
      console.log(rows.slice(0, 25).join('\n'))
      if (rows.length > 25) console.log(`    … ${rows.length - 25} more`)
    }
  }
  console.log(`\n${checked} computed values compared, ${changed} changed`)
  process.exit(changed === 0 ? 0 : 1)
}

const [cmd, ...rest] = process.argv.slice(2)
if (cmd === 'capture') await capture(rest[0], { reduce: rest.includes('--reduce') })
else if (cmd === 'diff') diff(rest[0], rest[1])
else { console.error('usage: capture <label> [--reduce] | diff <a> <b>'); process.exit(2) }
