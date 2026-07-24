// Headless-Chrome scrub verification over raw CDP (no deps).
//
// WHY THIS EXISTS: the in-app Browser preview pane cannot execute GSAP
// scroll-driven motion (ticker frozen; programmatic scrollTo fires no scroll
// events) — every scrub reads as static there even on pages that work
// perfectly live. Run `node scripts/verify-scroll-motion.mjs` against the dev
// server for a truthful pass before shipping any ScrollTrigger work.
import { spawn } from 'node:child_process'
import crypto from 'node:crypto'
import net from 'node:net'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 9377
const chrome = spawn(CHROME, [
  `--headless=new`, `--remote-debugging-port=${PORT}`, '--no-first-run',
  '--window-size=1440,900', '--hide-scrollbars', '--mute-audio', 'about:blank',
], { stdio: 'ignore' })
process.on('exit', () => chrome.kill())

const wait = ms => new Promise(r => setTimeout(r, ms))
async function getWsUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`)
      const tabs = await res.json()
      const page = tabs.find(t => t.type === 'page')
      if (page) return page.webSocketDebuggerUrl
    } catch {}
    await wait(250)
  }
  throw new Error('chrome never came up')
}

// minimal ws client (text frames only)
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

const ws = await wsConnect(await getWsUrl())
const evaluate = async (expression) => {
  const r = await ws.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails))
  return r.result?.result?.value
}

await ws.send('Page.enable')
await ws.send('Page.navigate', { url: 'http://localhost:3000/products/hash-hole' })
await wait(5000) // hydration + gsap init

// pass the age gate if it's up
await evaluate(`(() => { const b=[...document.querySelectorAll('button')].find(x=>/yes/i.test(x.textContent)); if(b) b.click(); return 'ok' })()`)
await wait(1200)

const result = await evaluate(`(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const go = async y => { window.scrollTo(0, y); await wait(950); };
  const mat = e => new DOMMatrixReadOnly(getComputedStyle(e).transform);
  const out = { vw: innerWidth, vh: innerHeight };
  const sec = document.querySelector('[data-tflight]').closest('section');
  const top = sec.getBoundingClientRect().top + scrollY;
  const span = innerHeight * 1.75;
  const jf = document.querySelector('[data-jflight]');
  const tf = document.querySelector('[data-tflight]');
  const samples = [];
  for (const f of [0.1, 0.35, 0.55, 0.8, 0.97]) {
    await go(top + f * span);
    samples.push({ f, secTop: Math.round(sec.getBoundingClientRect().top),
      jx: Math.round(mat(jf).m41), tx: Math.round(mat(tf).m41),
      ty: Math.round(mat(tf).m42), tScale: Number(mat(tf).a.toFixed(2)),
      jointVisible: (() => { const b = document.querySelector('[data-jimg]').getBoundingClientRect();
        const clipEdge = innerWidth / 2 - innerWidth * 0.20;
        return b.left < clipEdge - 8; })() });
  }
  out.samples = samples;
  out.pinned = samples.every(s => Math.abs(s.secTop) < 6);
  out.breatheBeat = samples[0].jx < -innerWidth * 0.4 && samples[0].ty > innerHeight * 0.3;
  out.jointArrives = samples[2].jx > samples[1].jx;
  out.jointSwallowed = !samples[4].jointVisible && samples[1].jointVisible;
  out.tubeEndsCentred = Math.abs(samples[4].tx) < 20 && samples[4].tScale > 1.05;
  out.balls = document.querySelectorAll('[data-ball]').length;
  out.horizScroll = document.documentElement.scrollWidth > innerWidth;
  // flower mobile frames reachable
  const r = await fetch('/products/flower/frames/mobile/0060.webp');
  out.flowerMobileFrame = r.status;
  return out;
})()`)

console.log(JSON.stringify(result, null, 1))
chrome.kill()
process.exit(0)
