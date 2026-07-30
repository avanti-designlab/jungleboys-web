// Minimal CDP client (no deps) for the a11y/design harness.
//
// Promoted from the design gate's throwaway harness so gate results are
// reproducible. Every guard below exists because its absence produced a wrong
// verdict at least once — do not "simplify" one away without re-running
// scripts/selftest-contrast.mjs, which fails if any of them regress.
import { spawn } from 'node:child_process'
import crypto from 'node:crypto'
import net from 'node:net'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
export const wait = (ms) => new Promise((r) => setTimeout(r, ms))

export async function launch({
  port = 9411, width = 1440, height = 900, mobile = false, theme = 'light',
  reducedMotion = false,
  // 'closed' (default) seeds every overlay dismissed so page content is
  // measurable. 'age-gate' deliberately leaves the gate UP and does not click
  // through it, because otherwise that surface can never be measured at all —
  // which is how its 21+ line sat at 4.31:1 in the DEFAULT theme unnoticed.
  overlays = 'closed',
} = {}) {
  const args = [
    `--headless=new`, `--remote-debugging-port=${port}`, '--no-first-run',
    `--window-size=${width},${height}`, '--hide-scrollbars', '--mute-audio',
    '--force-device-scale-factor=1', '--disable-lcd-text', 'about:blank',
  ]
  const chrome = spawn(CHROME, args, { stdio: 'ignore' })
  process.on('exit', () => { try { chrome.kill() } catch {} })

  let wsUrl = null
  for (let i = 0; i < 80; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`)
      const tabs = await res.json()
      const page = tabs.find((t) => t.type === 'page')
      if (page) { wsUrl = page.webSocketDebuggerUrl; break }
    } catch {}
    await wait(250)
  }
  if (!wsUrl) throw new Error('chrome never came up')
  const ws = await wsConnect(wsUrl)
  const send = ws.send

  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 1500))
    return r.result?.result?.value
  }
  await send('Page.enable')
  await send('Runtime.enable')
  if (reducedMotion) {
    await send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    })
  }
  if (mobile) {
    await send('Emulation.setDeviceMetricsOverride', {
      width, height, deviceScaleFactor: 1, mobile: true,
      screenOrientation: { type: 'portraitPrimary', angle: 0 },
    })
    await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 })
  }

  // Seed every dismissible overlay CLOSED before the page's own scripts run.
  //
  //  - jb-age-gate MUST be the JSON shape. The string "1" does not parse, the
  //    gate treats that as unverified, and its panel then covers every frame.
  //  - jb-newsletter fires at 60% scroll and drops a scrim over the whole page;
  //    every ground reading behind it is the dimmed colour, not the real one.
  //  - jb-intro-done is sessionStorage, not localStorage, and is the key the
  //    original harness missed: without it the loading screen holds the first
  //    frames and reveal-gate keeps content at opacity 0.
  const seed = `try{
    localStorage.setItem('jb-newsletter','1');
    localStorage.setItem('jb-cookie-consent','accepted');
    ${overlays === 'age-gate' ? `localStorage.removeItem('jb-age-gate');`
      : `localStorage.setItem('jb-age-gate', JSON.stringify({verifiedAt: Date.now()}));`}
    localStorage.setItem('jb-theme', ${JSON.stringify(theme)});
    sessionStorage.setItem('jb-intro-done','1');
  }catch(e){}`
  let seeded = false

  const goto = async (url, settle = 5000) => {
    if (!seeded) {
      await send('Page.navigate', { url })
      await wait(1200)
      await evaluate(seed)
      await send('Page.addScriptToEvaluateOnNewDocument', { source: seed })
      seeded = true
    }
    // Warm the route first. The Next dev server compiles a route on its first
    // hit, and until the response lands the browser keeps painting the PREVIOUS
    // page — a whole page's worth of measurements attributed to the wrong URL.
    try { await fetch(url) } catch {}
    await send('Page.navigate', { url })
    const want = new URL(url).pathname
    let ok = false
    for (let i = 0; i < 60; i++) {
      await wait(500)
      const st = await evaluate(`JSON.stringify({p: location.pathname, r: document.readyState})`)
        .then((s) => JSON.parse(s || '{}')).catch(() => ({}))
      if (st.p === want && st.r === 'complete') { ok = true; break }
    }
    if (!ok) throw new Error('navigation never committed: ' + url)
    await wait(settle)
    if (overlays !== 'age-gate') {
      await evaluate(`(() => {
        const b=[...document.querySelectorAll('button')].find(x=>/^\\s*yes/i.test(x.textContent||''));
        if(b){b.click();return true} return false })()`)
    }
    await wait(1600)

    // HARD ASSERT the theme landed. Emulation.setEmulatedMedia does nothing
    // here — the theme is data-theme on <html>, driven by localStorage
    // 'jb-theme', and the default is LIGHT. If the seed ever fails silently,
    // every "dark mode" number below is a light-mode number wearing a dark
    // label, which is worse than having no number at all.
    const applied = await evaluate(`document.documentElement.dataset.theme || 'light'`)
    if (applied !== theme) {
      throw new Error(`theme assertion failed on ${url}: wanted '${theme}', <html data-theme> is '${applied}'`)
    }

    // hard assert: nothing is covering the page
    return await evaluate(`(() => {
      const o=[...document.querySelectorAll('body *')].filter(e=>{
        const c=getComputedStyle(e); const r=e.getBoundingClientRect();
        return c.position==='fixed' && r.width>innerWidth*0.8 && r.height>innerHeight*0.8
          && c.visibility!=='hidden' && parseFloat(c.opacity)>0.05
          && (c.backgroundColor!=='rgba(0, 0, 0, 0)' || c.backdropFilter!=='none');
      });
      return o.map(e=>(e.className&&e.className.baseVal!==undefined?e.className.baseVal:String(e.className||'')).slice(0,60));
    })()`)
  }

  const screenshot = async () => {
    const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
    return r.result?.data
  }

  const kill = () => { try { chrome.kill() } catch {} }
  return { send, evaluate, goto, screenshot, kill }
}

function wsConnect(url) {
  const { hostname, port, pathname } = new URL(url)
  return new Promise((resolve, reject) => {
    const key = crypto.randomBytes(16).toString('base64')
    const sock = net.connect(Number(port), hostname, () => {
      sock.write(`GET ${pathname} HTTP/1.1\r\nHost: ${hostname}:${port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`)
    })
    sock.setNoDelay(true)
    let up = false, buf = Buffer.alloc(0), acc = Buffer.alloc(0)
    const waiting = new Map()
    let id = 0
    // Every call gets a deadline and a reject path.
    //
    // Without them a single lost round-trip hangs forever: Chrome's DevTools
    // endpoint can stop answering while the process stays alive, and the whole
    // run then sits at 0% CPU looking exactly like work in progress. For a gate
    // instrument that is the worst available failure mode — a hang is
    // indistinguishable from "still measuring", and it orphans the browser too.
    const CALL_TIMEOUT = Number(process.env.CDP_TIMEOUT_MS || 60000)
    const settle = (mid, fn, arg) => {
      const e = waiting.get(mid)
      if (!e) return
      clearTimeout(e.timer)
      waiting.delete(mid)
      fn(arg)
    }
    const send = (method, params = {}) => new Promise((res, rej) => {
      const mid = ++id
      const timer = setTimeout(
        () => settle(mid, rej, new Error(`CDP timeout after ${CALL_TIMEOUT}ms: ${method}`)),
        CALL_TIMEOUT,
      )
      waiting.set(mid, { res, rej, timer })
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
    sock.on('data', (d) => {
      if (!up) {
        const s = d.toString('latin1')
        const idx = s.indexOf('\r\n\r\n')
        if (idx === -1) return
        up = true
        resolve({ send })
        d = d.subarray(idx + 4)
        if (!d.length) return
      }
      buf = Buffer.concat([buf, d])
      for (;;) {
        if (buf.length < 2) break
        const len7 = buf[1] & 0x7f
        let off = 2, len = len7
        if (len7 === 126) { if (buf.length < 4) break; len = buf.readUInt16BE(2); off = 4 }
        else if (len7 === 127) { if (buf.length < 10) break; len = Number(buf.readBigUInt64BE(2)); off = 10 }
        if (buf.length < off + len) break
        const fin = (buf[0] & 0x80) !== 0
        const opcode = buf[0] & 0x0f
        const payload = buf.subarray(off, off + len)
        buf = buf.subarray(off + len)
        if (opcode === 0x8) { sock.end(); break }
        if (opcode === 0x9) continue
        acc = Buffer.concat([acc, payload])
        if (!fin) continue
        const frame = acc.toString('utf8')
        acc = Buffer.alloc(0)
        try {
          const msg = JSON.parse(frame)
          if (msg.id && waiting.has(msg.id)) settle(msg.id, waiting.get(msg.id).res, msg)
        } catch {}
      }
    })
    // Chrome going away must fail every in-flight call, not strand it.
    const failAll = (why) => {
      for (const mid of [...waiting.keys()]) settle(mid, waiting.get(mid).rej, new Error(why))
    }
    sock.on('close', () => failAll('CDP socket closed (Chrome went away)'))
    sock.on('error', (e) => { failAll('CDP socket error: ' + e.message); reject(e) })
  })
}
