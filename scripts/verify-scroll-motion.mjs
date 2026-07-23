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
  const xOf = e => Math.round(new DOMMatrixReadOnly(getComputedStyle(e).transform).m41);
  const op = e => Number(getComputedStyle(e).opacity);
  const go = async y => { window.scrollTo(0, y); await wait(900); };
  const out = { vw: innerWidth, vh: innerHeight };

  // intro: logo centred in the stage, no plaque/logo overlap
  const logo = document.querySelector('[data-logo]');
  const stage = logo.parentElement;
  await go(stage.getBoundingClientRect().top + scrollY - innerHeight * 0.4);
  const lb = logo.getBoundingClientRect(), sb = stage.getBoundingClientRect();
  const logoMid = (lb.left + lb.right) / 2, stageMid = (sb.left + sb.right) / 2;
  const plaques = [...document.querySelectorAll('[data-plaque]')].slice(0, 4);
  const overlaps = plaques.filter(p => {
    const b = p.getBoundingClientRect();
    return b.right > lb.left + 8 && b.left < lb.right - 8 && b.bottom > lb.top && b.top < lb.bottom;
  }).length;
  out.intro = { logoCentredPx: Math.round(logoMid - stageMid), plaqueLogoOverlaps: overlaps,
    plaqueBoxes: plaques.map(p => { const b = p.getBoundingClientRect(); return Math.round(b.left - sb.left) + ',' + Math.round(b.top - sb.top); }) };

  // crossing scrub
  const tube = document.querySelector('[data-tube]');
  const joint = document.querySelector('[data-joint]');
  const psec = tube.closest('section');
  const ptop = psec.getBoundingClientRect().top + scrollY;
  const cross = [];
  for (const f of [0, 0.5, 1]) {
    await go(ptop - innerHeight + f * (psec.offsetHeight + innerHeight));
    cross.push({ f, tubeX: xOf(tube), jointX: xOf(joint) });
  }
  out.crossing = { tubeRightToLeft: cross[0].tubeX > cross[2].tubeX,
    jointLeftToRight: cross[0].jointX < cross[2].jointX,
    tubeTravel: cross[0].tubeX - cross[2].tubeX, jointTravel: cross[2].jointX - cross[0].jointX };

  // breakdown: PINNED — section top stays at 0 across the pin span while the
  // build progresses one piece at a time
  const paper = document.querySelector('[data-piece="paper"]');
  const bsec = paper.closest('section');
  const pinStart = bsec.getBoundingClientRect().top + scrollY;
  const bd = [];
  for (const f of [0.15, 0.35, 0.55, 0.75, 0.95]) {
    await go(pinStart + f * innerHeight * 2.4);
    const secTop = Math.round(bsec.getBoundingClientRect().top);
    bd.push({ f, secTop,
      paper: op(document.querySelector('[data-piece="paper"]')),
      flower: op(document.querySelector('[data-piece="flower"]')),
      rosin: op(document.querySelector('[data-piece="rosin"]')),
      tip: op(document.querySelector('[data-piece="tip"]')),
      pillPaper: op(document.querySelector('[data-pill="paper"]')) });
  }
  out.breakdown = { samples: bd,
    pinned: bd.every(s => Math.abs(s.secTop) < 6),
    oneByOne: bd[0].paper > bd[0].tip && bd[1].flower > bd[1].tip,
    endsBuilt: bd[4].tip > 0.9 };
  const line = document.querySelector('[data-line="paper"]');
  out.lineThinPx = Math.round(line.getBoundingClientRect().width);
  out.pillHasNumber = /\\d/.test(document.querySelector('[data-pill="paper"]').textContent);

  // footer gutter colour
  out.bodyBg = getComputedStyle(document.body).backgroundColor;
  out.footer = !!document.querySelector('footer');
  out.horizScroll = document.documentElement.scrollWidth > innerWidth;
  return out;
})()`)

console.log(JSON.stringify(result, null, 1))
chrome.kill()
process.exit(0)
