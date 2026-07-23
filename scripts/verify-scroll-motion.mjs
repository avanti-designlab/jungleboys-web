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
  const go = async y => { window.scrollTo(0, y); await wait(900); };
  const xOf = e => Math.round(new DOMMatrixReadOnly(getComputedStyle(e).transform).m41);
  const out = { vw: innerWidth, vh: innerHeight };
  const psec = document.querySelector('[data-fly="tube"]').closest('section');
  const ptop = psec.getBoundingClientRect().top + scrollY;
  // mid-pass: measure the pair's composition
  await go(ptop - innerHeight + 0.5 * (psec.offsetHeight + innerHeight));
  const tb = document.querySelector('[data-tube]').getBoundingClientRect();
  const jb = document.querySelector('[data-joint]').getBoundingClientRect();
  const sb = psec.getBoundingClientRect();
  out.tubeBand = [Math.round((tb.top - sb.top) / sb.height * 100), Math.round((tb.bottom - sb.top) / sb.height * 100)];
  out.jointBand = [Math.round((jb.top - sb.top) / sb.height * 100), Math.round((jb.bottom - sb.top) / sb.height * 100)];
  out.overlapPct = Math.max(0, Math.round((tb.bottom - jb.top) / sb.height * 100));
  out.pairCentre = Math.round(((tb.top + jb.bottom) / 2 - sb.top) / sb.height * 100);
  out.balls = [...document.querySelectorAll('[data-ball]')].length;
  // travel directions incl. all balls
  const cross = [];
  for (const f of [0, 1]) {
    await go(ptop - innerHeight + f * (psec.offsetHeight + innerHeight));
    cross.push({ t: xOf(document.querySelector('[data-fly="tube"]')), j: xOf(document.querySelector('[data-fly="joint"]')),
      a: xOf(document.querySelector('[data-ball="a"]')), b: xOf(document.querySelector('[data-ball="b"]')), c: xOf(document.querySelector('[data-ball="c"]')) });
  }
  out.dirs = { tube: cross[0].t > cross[1].t ? 'R->L' : 'wrong', joint: cross[0].j < cross[1].j ? 'L->R' : 'wrong',
    ballA: cross[1].a - cross[0].a > 0 ? 'L->R' : 'R->L', ballB: cross[1].b - cross[0].b > 0 ? 'L->R' : 'R->L', ballC: cross[1].c - cross[0].c > 0 ? 'L->R' : 'R->L' };
  out.horizScroll = document.documentElement.scrollWidth > innerWidth;
  return out;
})()`)

console.log(JSON.stringify(result, null, 1))
chrome.kill()
process.exit(0)
