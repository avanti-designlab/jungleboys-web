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
  window.scrollTo(0, 0); await wait(800);
  const grp = document.querySelector('[data-grp]');
  const sec = grp.closest('section');
  const top = sec.getBoundingClientRect().top + scrollY;
  const span = innerHeight * 1.95;
  const cap = document.querySelector('[data-cap]');
  const body = document.querySelector('[data-body]');
  const jimg = document.querySelector('[data-jzoom]');
  const S = [];
  for (const f of [0.1, 0.3, 0.5, 0.68, 0.82, 0.97]) {
    await go(top + f * span);
    const jb = jimg.getBoundingClientRect(), bb = body.getBoundingClientRect();
    S.push({ f, secTop: Math.round(sec.getBoundingClientRect().top),
      capOp: +Number(getComputedStyle(cap).opacity).toFixed(2),
      bodyOp: +Number(getComputedStyle(body).opacity).toFixed(2),
      jointW: Math.round(jb.width), jointH: Math.round(jb.height),
      jointCx: Math.round(jb.left + jb.width / 2), jointCy: Math.round(jb.top + jb.height / 2),
      jointL: Math.round(jb.left), jointR: Math.round(jb.right),
      // fully out = joint's trailing edge clears the body's mouth entirely
      clearOfBody: bb.width < 2 || jb.left > bb.right - 4 || jb.right < bb.left + 4 || bb.bottom < jb.top || bb.top > jb.bottom,
      bodyL: Math.round(bb.left), bodyR: Math.round(bb.right) });
  }
  out.samples = S;
  out.pinned = S.every(s => Math.abs(s.secTop) < 6);
  out.capGone = S[5].capOp < 0.05 && S[1].capOp === 1;
  out.tubeRemoved = S[5].bodyOp < 0.05 && S[1].bodyOp === 1;
  out.jointFullyOut = S[4].clearOfBody || S[5].clearOfBody;
  out.jointZoomed = S[5].jointW > S[1].jointW * 1.25;
  const cxErr = Math.abs(S[5].jointCx - innerWidth / 2), cyErr = Math.abs(S[5].jointCy - innerHeight / 2);
  out.finalCentred = { cxErr, cyErr, ok: cxErr < 60 && cyErr < 90 };
  out.neverClipped = S.every(s => s.jointL > -40 && s.jointR < innerWidth + 40);
  out.tubeInFrameEarly = S[1].bodyL > -30 && S[1].bodyR < innerWidth + 30;
  out.horizScroll = document.documentElement.scrollWidth > innerWidth;
  return out;
})()`)

console.log(JSON.stringify(result, null, 1))
chrome.kill()
process.exit(0)
