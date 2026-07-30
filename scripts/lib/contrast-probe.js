// In-page contrast probe. Measures text against the REAL painted ground by
// screenshotting the page with every text fill nulled ("ground plate") and
// sampling the pixels under each text box. Handles gradients, glows, images,
// blend modes and translucency, none of which a DOM-walking bg lookup can see.
(() => {
  const DG = {}

  // ---- colour parsing -------------------------------------------------
  // Tailwind v4 compiles `text-white/85` to color-mix(in oklab, ...), which
  // Chrome serialises as oklab()/color(srgb). A parser that only knows rgba()
  // silently drops every translucent colour on the site.
  function srgbFromLinear(c) {
    return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
  }
  function oklabToRgb(L, a, b) {
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b
    const s_ = L - 0.0894841775 * a - 1.2914855480 * b
    const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3
    const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    const bb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    return [r, g, bb].map((v) => Math.max(0, Math.min(255, Math.round(srgbFromLinear(v) * 255))))
  }
  function nums(s) {
    return s.replace(/^[a-z-]+\(/i, '').replace(/\)$/, '').replace(/\//g, ' ')
      .trim().split(/[\s,]+/).filter(Boolean)
  }
  DG.parse = function parse(str) {
    if (!str) return null
    const s = String(str).trim()
    if (s === 'transparent') return [0, 0, 0, 0]
    if (s.startsWith('#')) {
      const h = s.slice(1)
      const x = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
      return [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16),
        x.length === 8 ? parseInt(x.slice(6, 8), 16) / 255 : 1]
    }
    if (/^rgba?\(/i.test(s)) {
      const p = nums(s)
      const v = p.map((t) => (t.endsWith('%') ? parseFloat(t) * 2.55 : parseFloat(t)))
      return [v[0], v[1], v[2], p[3] == null ? 1 : (p[3].endsWith('%') ? parseFloat(p[3]) / 100 : parseFloat(p[3]))]
    }
    if (/^oklab\(/i.test(s)) {
      const p = nums(s)
      const L = p[0].endsWith('%') ? parseFloat(p[0]) / 100 : parseFloat(p[0])
      const a = parseFloat(p[1]), b = parseFloat(p[2])
      const al = p[3] == null ? 1 : (p[3].endsWith('%') ? parseFloat(p[3]) / 100 : parseFloat(p[3]))
      return [...oklabToRgb(L, a, b), al]
    }
    if (/^oklch\(/i.test(s)) {
      const p = nums(s)
      const L = p[0].endsWith('%') ? parseFloat(p[0]) / 100 : parseFloat(p[0])
      const C = parseFloat(p[1]), H = (parseFloat(p[2]) || 0) * Math.PI / 180
      const al = p[3] == null ? 1 : (p[3].endsWith('%') ? parseFloat(p[3]) / 100 : parseFloat(p[3]))
      return [...oklabToRgb(L, C * Math.cos(H), C * Math.sin(H)), al]
    }
    if (/^color\(srgb/i.test(s)) {
      const p = nums(s).slice(1)
      const v = p.slice(0, 3).map((t) => Math.round((t.endsWith('%') ? parseFloat(t) / 100 : parseFloat(t)) * 255))
      const al = p[3] == null ? 1 : (p[3].endsWith('%') ? parseFloat(p[3]) / 100 : parseFloat(p[3]))
      return [...v, al]
    }
    // last resort: let the engine resolve it
    const probe = document.createElement('span')
    probe.style.color = s
    document.body.appendChild(probe)
    const out = getComputedStyle(probe).color
    probe.remove()
    if (out && out !== s) return parse(out)
    return null
  }
  DG.lum = function (r, g, b) {
    const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
  }
  DG.ratio = function (a, b) {
    const l1 = DG.lum(...a), l2 = DG.lum(...b)
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
  }
  DG.over = function (fg, bg) { // composite fg (with alpha) onto opaque bg
    const a = fg[3]
    return [0, 1, 2].map((i) => Math.round(fg[i] * a + bg[i] * (1 - a)))
  }

  // ---- 3D backface culling --------------------------------------------
  // A flip card keeps BOTH faces in the DOM at full opacity; the one facing
  // away is culled by the compositor, not by any style a DOM walk can read.
  // Measuring it scores the hidden face's text against the visible face's
  // background — pure fiction. Accumulate the 3D transform chain and drop any
  // element whose surface normal points away from the viewer.
  function accumulatedMatrix(el) {
    const chain = []
    let p = el
    while (p && p !== document.documentElement) { chain.push(p); p = p.parentElement }
    let m = new DOMMatrix()
    for (let i = chain.length - 1; i >= 0; i--) {
      const t = getComputedStyle(chain[i]).transform
      if (t && t !== 'none') m = m.multiply(new DOMMatrix(t))
    }
    return m
  }
  DG.culled = function (el) {
    let p = el
    while (p && p !== document.documentElement) {
      if (getComputedStyle(p).backfaceVisibility === 'hidden') {
        // normal of a +z-facing plane after the transform chain
        if (accumulatedMatrix(p).m33 < 0) return true
      }
      p = p.parentElement
    }
    return false
  }

  // A text box is only readable where its clipping ancestors let it show.
  // The footer marquee's range rect runs the full track width and hangs over
  // the 12px page gutter either side of the black panel; without clipping,
  // that gutter shows up as "white ground under white text".
  function clipRect(el) {
    let x0 = 0, y0 = 0, x1 = innerWidth, y1 = innerHeight
    let p = el
    while (p && p !== document.documentElement) {
      const c = getComputedStyle(p)
      if (c.overflow !== 'visible' || c.overflowX !== 'visible' || c.overflowY !== 'visible') {
        const r = p.getBoundingClientRect()
        if (c.overflowX !== 'visible') { x0 = Math.max(x0, r.left); x1 = Math.min(x1, r.right) }
        if (c.overflowY !== 'visible') { y0 = Math.max(y0, r.top); y1 = Math.min(y1, r.bottom) }
      }
      p = p.parentElement
    }
    return [x0, y0, x1, y1]
  }
  // Elements pinned over the page (the sticky header, the mobile tab bar)
  // paint ON TOP of text that scrolls under them. In the ground plate that
  // reads as "white text on brand yellow 1.48:1" when the truth is that the
  // text is not visible there at all — it is behind the yellow SHOP pill.
  function occluders(el) {
    const out = []
    for (const e of document.querySelectorAll('body *')) {
      const c = getComputedStyle(e)
      if (c.position !== 'fixed' && c.position !== 'sticky') continue
      if (c.visibility === 'hidden' || parseFloat(c.opacity) === 0) continue
      if (e.contains(el)) continue
      const r = e.getBoundingClientRect()
      if (r.width < 4 || r.height < 4) continue
      out.push(r)
    }
    return out
  }
  DG.boxesFor = function (el) {
    const [cx0, cy0, cx1, cy1] = clipRect(el)
    const occ = occluders(el)
    const boxes = []
    for (const n of el.childNodes) {
      if (n.nodeType !== 3 || !n.nodeValue.trim()) continue
      const rg = document.createRange()
      rg.selectNodeContents(n)
      for (const q of rg.getClientRects()) {
        const l = Math.max(q.left, cx0, 0)
        let t = Math.max(q.top, cy0, 0)
        const r = Math.min(q.right, cx1, innerWidth)
        let bt = Math.min(q.bottom, cy1, innerHeight)
        // trim the band an overlapping pinned element covers
        for (const o of occ) {
          if (o.right <= l || o.left >= r || o.bottom <= t || o.top >= bt) continue
          if (o.top <= t && o.bottom >= bt) { t = bt; break }
          if (o.top <= t) t = Math.max(t, o.bottom)
          else if (o.bottom >= bt) bt = Math.min(bt, o.top)
          else { t = bt; break } // occluder splits the line: give up on it
        }
        if (r - l < 3 || bt - t < 3) continue
        boxes.push([Math.round(l), Math.round(t), Math.round(r - l), Math.round(bt - t)])
      }
    }
    return boxes
  }

  // ---- element collection ---------------------------------------------
  DG.collect = function () {
    const out = []
    const all = document.querySelectorAll('body *')
    for (const el of all) {
      let txt = ''
      for (const n of el.childNodes) if (n.nodeType === 3) txt += n.nodeValue
      txt = txt.replace(/\s+/g, ' ').trim()
      if (!txt) continue
      const cs = getComputedStyle(el)
      if (cs.display === 'none' || cs.visibility === 'hidden') continue
      // Visually-hidden text (Tailwind sr-only) is 1x1 and clipped away — it
      // is read aloud, never rendered, so a contrast ratio for it is meaningless.
      const er = el.getBoundingClientRect()
      if (er.width <= 2 || er.height <= 2) continue
      if (cs.clip === 'rect(0px, 0px, 0px, 0px)' || cs.clipPath === 'inset(50%)') continue
      // Sample the TEXT RUNS, not the element box. A pill's box contains its
      // icon disc; a card's box contains its artwork. Ranges over the direct
      // text nodes give the actual line boxes the glyphs sit in, which is the
      // only ground WCAG cares about.
      const boxes = DG.boxesFor(el)
      if (!boxes.length) continue
      const r = er
      // effective opacity down the chain
      let op = 1, p = el, hidden = false, ariaHidden = false
      while (p && p !== document.documentElement) {
        const pcs = getComputedStyle(p)
        op *= parseFloat(pcs.opacity)
        if (pcs.visibility === 'hidden') hidden = true
        if (p.getAttribute && p.getAttribute('aria-hidden') === 'true') ariaHidden = true
        p = p.parentElement
      }
      if (hidden) continue
      if (DG.culled(el)) continue
      const col = DG.parse(cs.color)
      if (!col) continue
      const fs = parseFloat(cs.fontSize)
      const fw = parseInt(cs.fontWeight, 10) || 400
      const large = fs >= 24 || (fs >= 18.66 && fw >= 700)
      out.push({
        i: out.length, tag: el.tagName.toLowerCase(),
        text: txt.slice(0, 60), cls: (el.className && el.className.baseVal !== undefined ? el.className.baseVal : String(el.className || '')).slice(0, 90),
        color: cs.color, rgba: col, opacity: +op.toFixed(3), ariaHidden,
        fs: +fs.toFixed(1), fw, large,
        stroke: cs.webkitTextStrokeWidth + ' ' + cs.webkitTextStrokeColor,
        shadow: cs.textShadow === 'none' ? '' : cs.textShadow.slice(0, 60),
        mixBlend: cs.mixBlendMode, bgClip: cs.webkitBackgroundClip || cs.backgroundClip,
        rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
        boxes,
        el,
      })
      if (out.length > 900) break
    }
    DG._els = out
    return out.map(({ el, ...rest }) => rest)
  }

  // ---- ground plate ----------------------------------------------------
  DG.nullText = function (on) {
    let s = document.getElementById('__dg_plate_css')
    if (on) {
      if (!s) {
        s = document.createElement('style')
        s.id = '__dg_plate_css'
        document.head.appendChild(s)
      }
      // kill every text fill: colour, stroke, shadow — leave every background,
      // border, image, gradient and glow exactly where it is.
      s.textContent = `*, *::before, *::after { color: transparent !important;
        -webkit-text-stroke-color: transparent !important; text-shadow: none !important;
        text-decoration-color: transparent !important; caret-color: transparent !important; }`
    } else if (s) s.remove()
    return true
  }

  DG.sample = async function (b64) {
    // NOT fetch(dataURL): the site ships a strict CSP and connect-src blocks it.
    const bin = atob(b64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    const img = await createImageBitmap(new Blob([bytes], { type: 'image/png' }))
    const cv = new OffscreenCanvas(img.width, img.height)
    const ctx = cv.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(img, 0, 0)
    const scale = img.width / innerWidth
    const res = []
    for (const e of DG._els) {
      const hist = new Map()
      let total = 0
      let sr = 0, sg = 0, sb = 0
      for (const [x, y, w, h] of e.boxes) {
        const X = Math.max(0, Math.round(x * scale)), Y = Math.max(0, Math.round(y * scale))
        const W = Math.min(img.width - X, Math.round(w * scale)), H = Math.min(img.height - Y, Math.round(h * scale))
        if (W <= 0 || H <= 0) continue
        const d = ctx.getImageData(X, Y, W, H).data
        // stride so a full-width block does not cost 1.3M reads
        const stride = Math.max(1, Math.round(Math.sqrt((W * H) / 4000)))
        for (let py = 0; py < H; py += stride) {
          for (let px = 0; px < W; px += stride) {
            const o = (py * W + px) * 4
            const k = (d[o] << 16) | (d[o + 1] << 8) | d[o + 2]
            hist.set(k, (hist.get(k) || 0) + 1)
            sr += d[o]; sg += d[o + 1]; sb += d[o + 2]
            total++
          }
        }
      }
      if (!total) { res.push(null); continue }
      const sorted = [...hist.entries()].sort((a, b) => b[1] - a[1])
      const cands = sorted.filter(([, n]) => n / total >= 0.02).slice(0, 12)
        .map(([k, n]) => ({ rgb: [(k >> 16) & 255, (k >> 8) & 255, k & 255], share: +(n / total).toFixed(3) }))
      // A gradient ground has no modal colour — the top entry can be 3% of the
      // box. Its mean is the honest single-colour stand-in; the modal colour
      // there is just the widest band of a ramp.
      const mean = [Math.round(sr / total), Math.round(sg / total), Math.round(sb / total)]
      res.push({ cands, mean, distinct: sorted.length })
    }
    return res
  }

  // Re-read the glyph boxes just before the plate is captured. Marquees and
  // scrubbed tracks keep moving; rects read seconds earlier point at ground
  // the text has already left.
  DG.refreshRects = function () {
    for (const e of DG._els) e.boxes = DG.boxesFor(e.el)
    return { scrollY: Math.round(scrollY), h: document.documentElement.scrollHeight }
  }

  // A fingerprint of every text element's fill strength, used to wait for
  // scroll-triggered reveals to FINISH before measuring.
  //
  // Without this, a GSAP fade-in is sampled mid-flight and the element's own
  // opaque colour is scored as though it were translucent — one `/rewards`
  // heading declared `text-[var(--color-foreground)]` (opaque white) reported
  // at alpha 0.039, 0.118, 0.172 and 0.425 on four different passes, i.e. four
  // "failures" that do not exist at rest. Only opacity and colour are hashed:
  // a marquee's transform never settles and would block forever, and sliding
  // sideways does not change the ratio (refreshRects already re-reads ground).
  DG.signature = function () {
    let s = ''
    for (const el of document.querySelectorAll('body *')) {
      let has = false
      for (const n of el.childNodes) if (n.nodeType === 3 && n.nodeValue.trim()) { has = true; break }
      if (!has) continue
      const cs = getComputedStyle(el)
      s += cs.opacity + '|' + cs.color + ';'
    }
    let h = 0
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
    return h
  }

  window.__DG = DG
  return true
})()
