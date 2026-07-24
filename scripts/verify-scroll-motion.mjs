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
  const rotOf = e => Math.round(Math.atan2(mat(e).b, mat(e).a) * 180 / Math.PI);
  const out = { vw: innerWidth, vh: innerHeight };
  window.scrollTo(0, 0); await wait(900);

  // ── signs: four distinct wind clocks, pivoting from the post base
  const sways = [...document.querySelectorAll('#hh-intro .hh-sway')].slice(0, 4);
  out.sway = sways.map(e => { const cs = getComputedStyle(e);
    return { dur: cs.animationDuration, delay: cs.animationDelay, origin: cs.transformOrigin, name: cs.animationName }; });
  out.swayAllDistinct = new Set(out.sway.map(s => s.dur + s.delay)).size === 4;
  // sample rotation twice — a running animation must change it
  const r1 = sways.map(e => Number(getComputedStyle(e).rotate.replace('deg','')) || 0);
  await wait(1400);
  const r2 = sways.map(e => Number(getComputedStyle(e).rotate.replace('deg','')) || 0);
  out.swayMoving = r1.some((v, i) => Math.abs(v - r2[i]) > 0.15);

  // ── unbox: rises from lower-left at an angle, shorter span
  const grp = document.querySelector('[data-grp]');
  const sec = grp.closest('section');
  const top = sec.getBoundingClientRect().top + scrollY;
  const span = innerHeight * 1.45;
  out.pinSpanVh = 145;
  const S = [];
  for (const f of [0.30, 0.52, 0.97]) {
    await go(top + f * span);
    const jb = document.querySelector('[data-jzoom]').getBoundingClientRect();
    S.push({ f, x: Math.round(mat(grp).m41), y: Math.round(mat(grp).m42), rot: rotOf(grp),
      jl: Math.round(jb.left), jr: Math.round(jb.right), jw: Math.round(jb.width),
      bodyOp: +Number(getComputedStyle(document.querySelector('[data-body]')).opacity).toFixed(2) });
  }
  out.unbox = S;
  out.restAngled = S[0].rot > 45 && S[0].rot < 70;           // diagonal, not level
  out.restLowerLeft = S[0].x < -80 && S[0].y > 20;            // left of centre and low
  out.tubeRemoved = S[2].bodyOp < 0.05;
  out.jointZoomed = S[2].jw > S[0].jw * 1.25;
  out.neverClipped = S.every(s => s.jl > -40 && s.jr < innerWidth + 40);

  // ── even gaps around the marquee band
  const mq = [...document.querySelectorAll('section')].find(s => s.querySelector('.marquee-pause'));
  const prev = mq.previousElementSibling, next = mq.nextElementSibling;
  const mqR = mq.getBoundingClientRect();
  out.gapAbove = Math.round(mqR.top - prev.getBoundingClientRect().bottom);
  out.gapBelow = Math.round(next.getBoundingClientRect().top - mqR.bottom);
  out.gapsEven = Math.abs(out.gapAbove - out.gapBelow) <= 8;

  // ── logo resolution actually served
  const logo = document.querySelector('#hh-intro [data-logo]');
  out.logo = { natural: logo.naturalWidth + 'x' + logo.naturalHeight,
    cssW: Math.round(logo.getBoundingClientRect().width),
    ratio: +(logo.naturalWidth / logo.getBoundingClientRect().width).toFixed(2) };
  out.logoRetinaOk = out.logo.ratio >= 2;
  out.horizScroll = document.documentElement.scrollWidth > innerWidth;
  return out;
})()`)

console.log(JSON.stringify(result, null, 1))
chrome.kill()
process.exit(0)
