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

  // one marquee only (the reverse one lower on the page)
  out.marquees = [...document.querySelectorAll('section')].filter(s => /PLAYING WITH|HASH ROSIN/.test(s.textContent) && s.className.includes('overflow-hidden') && s.querySelector('.marquee-pause')).length;

  // intro signs: rows optically centred (text block centre vs face centre)
  const intro = document.querySelector('#hh-intro');
  const stage = intro.querySelector('[data-logo]').parentElement;
  await go(stage.getBoundingClientRect().top + scrollY - innerHeight * 0.25);
  await wait(1600);
  out.signCentring = [...stage.querySelectorAll('.hh-plaque')].map(f => {
    const fb = f.getBoundingClientRect();
    const tb = f.firstElementChild.getBoundingClientRect();
    return { dx: Math.round((tb.left + tb.right) / 2 - (fb.left + fb.right) / 2),
             dy: Math.round((tb.top + tb.bottom) / 2 - (fb.top + fb.bottom) / 2) };
  });
  out.thinApplied = !!stage.querySelector('.hh-sign-thin') &&
    getComputedStyle(stage.querySelector('.hh-sign-thin')).webkitTextStrokeWidth !== '0px';

  // flyover: horizon caps, trails, ball, both pieces crossing
  const psec = document.querySelector('[data-fly="tube"]').closest('section');
  out.horizonCaps = psec.querySelectorAll('[class*="rounded-b-"]').length;
  out.trailStrokes = psec.querySelectorAll('span span').length;
  const ptop = psec.getBoundingClientRect().top + scrollY;
  const tubeW = document.querySelector('[data-fly="tube"]');
  const jointW = document.querySelector('[data-fly="joint"]');
  const ball = document.querySelector('[data-ball]');
  const cross = [];
  for (const f of [0, 0.5, 1]) {
    await go(ptop - innerHeight + f * (psec.offsetHeight + innerHeight));
    cross.push({ tubeX: xOf(tubeW), jointX: xOf(jointW), ballX: xOf(ball) });
  }
  out.fly = { tubeRightToLeft: cross[0].tubeX > cross[2].tubeX,
    jointLeftToRight: cross[0].jointX < cross[2].jointX,
    ballOpposesTube: (cross[2].ballX - cross[0].ballX) > 0,
    tubeTravel: cross[0].tubeX - cross[2].tubeX };
  // grass clearance: at mid-pass the tube's top edge stays below the horizon cap
  await go(ptop - innerHeight + 0.5 * (psec.offsetHeight + innerHeight));
  const tubeBox = document.querySelector('[data-tube]').getBoundingClientRect();
  const capBox = psec.querySelector('[class*="rounded-b-"]').getBoundingClientRect();
  out.grassClearPx = Math.round(tubeBox.top - capBox.bottom);

  // breakdown still pinned + sequential
  const paper = document.querySelector('[data-piece="paper"]');
  const bsec = paper.closest('section');
  const pinStart = bsec.getBoundingClientRect().top + scrollY;
  const op = e => Number(getComputedStyle(e).opacity);
  const bd = [];
  for (const f of [0.2, 0.95]) {
    await go(pinStart + f * innerHeight * 2.4);
    bd.push({ secTop: Math.round(bsec.getBoundingClientRect().top), paper: op(paper),
      tip: op(document.querySelector('[data-piece="tip"]')) });
  }
  out.breakdown = { pinned: bd.every(s => Math.abs(s.secTop) < 6), sequential: bd[0].paper > bd[0].tip, endsBuilt: bd[1].tip > 0.9 };

  // footer gutter: the footer element no longer paints its own background
  const foot = document.querySelector('footer');
  out.footerBg = getComputedStyle(foot).backgroundColor;
  out.bodyBg = getComputedStyle(document.body).backgroundColor;
  out.footer = !!foot;
  out.horizScroll = document.documentElement.scrollWidth > innerWidth;
  return out;
})()`)

console.log(JSON.stringify(result, null, 1))
chrome.kill()
process.exit(0)
