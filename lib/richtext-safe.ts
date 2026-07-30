// Sanitizer for CMS richtext (SEC-P2-1, first AND second pass).
//
// TWO layers, because the renderer has two separate holes and my first fix only
// closed one of them.
//
// LAYER 1 — sanitizeRichTextDoc(), the important one, added after the security
// gate broke the first version. `@storyblok/richtext` builds attributes as
//
//     result += ` ${key}="${escapeAttr(value)}"`      (dist/index.mjs:669)
//
// so the attribute VALUE is escaped and the attribute NAME is not — and names
// are attacker-supplied. Every attrs interface carries `[key: string]: unknown`,
// and a link's declared `custom` object is expanded key-by-key into attributes
// (dist/index.mjs:433). From a CMS account with publish rights that yields:
//   custom: { onmouseover: 'alert(1)' }       -> <a … onmouseover="alert(1)">
//   image attrs: { onerror: 'alert(1)' }      -> <img … onerror="alert(1)">
//   custom: { 'q"><img src=x onerror=alert(1)><a b="': 'z' }
//                                             -> breaks the tag open entirely
//   textStyle color: 'red; position:fixed; inset:0; z-index:99999'
//                                             -> full-viewport clickjack overlay
//
// My first version rewrote only href/src in the OUTPUT and justified that narrow
// scope with "the renderer's escaping of attribute values is sound". True, and
// irrelevant — the injection is in the NAME position. The same false premise
// also made the output regex unsound, because a `"` CAN appear unescaped when it
// arrives via a name. Scope decisions resting on an unverified premise are how
// a sanitizer ends up looking finished while being open.
//
// LAYER 2 — sanitizeRichTextHtml(), the original pass, kept as defence in depth
// for link schemes, which IS a value-position problem the renderer never checks.


// ── LAYER 1: attribute-name allowlist ────────────────────────────────────────

// Names the renderer legitimately emits across every node and mark type it
// supports. Everything else is dropped by simply not being here — every `on*`
// handler, `style`, and the `custom` bag included.
const ALLOWED_ATTRS = new Set([
  'href', 'target', 'anchor', 'uuid', 'linktype', 'title', 'rel',
  'src', 'alt', 'width', 'height', 'loading', 'decoding',
  'level', 'class', 'id', 'name', 'start', 'order', 'language',
  'colspan', 'rowspan', 'color',
])

// `color` is the one allowed name whose VALUE lands inside a style declaration
// (`style="color: <value>"`), so it is the one value that can still inject CSS.
// Hex, rgb()/hsl(), or a bare keyword only — no `;`, no `:`, no url().
const SAFE_COLOR = /^(#[0-9a-f]{3,8}|(rgb|rgba|hsl|hsla)\([0-9.,%\s/-]+\)|[a-z]+)$/i

// `class` is a VALUE-position risk, exactly like `color` above.
//
// Tailwind's utilities are already in the shipped stylesheet, so a CMS author
// with publish rights can borrow them without adding any CSS of their own:
// `class="fixed inset-0 z-50 bg-black h-screen w-full"` is a full-viewport
// overlay — the clickjack the `textStyle`/`color` restriction was added to
// prevent, smuggled through the attribute sitting next to it. Storyblok's
// `styled` mark uses class legitimately, so the value is constrained rather
// than the name dropped: no positioning, stacking, sizing or inset utilities.
const UNSAFE_CLASS = /^(fixed|absolute|sticky|inset|top|right|bottom|left|z|h|w|min-h|min-w|max-h|max-w|translate|scale|rotate|opacity|pointer-events|overflow|transform)(-|$)/

function safeClassValue(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const kept = v.split(/\s+/).filter((c) => c && !UNSAFE_CLASS.test(c))
  return kept.length ? kept.join(' ') : null
}

function cleanAttrs(attrs: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(attrs)) {
    if (!ALLOWED_ATTRS.has(k)) continue
    if (k === 'color' && !(typeof v === 'string' && SAFE_COLOR.test(v.trim()))) continue
    if ((k === 'href' || k === 'src') && typeof v === 'string' && !isSafeUrl(v)) continue
    if (k === 'class') {
      const safe = safeClassValue(v)
      if (safe === null) continue
      out[k] = safe
      continue
    }
    out[k] = v
  }
  return out
}

/** Deep-clean a Storyblok richtext document. Never mutates the input. */
export function sanitizeRichTextDoc<T>(doc: T): T {
  const walk = (n: unknown): unknown => {
    if (Array.isArray(n)) return n.map(walk)
    if (!n || typeof n !== 'object') return n
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(n as Record<string, unknown>)) {
      if (k === 'attrs' && v && typeof v === 'object' && !Array.isArray(v)) {
        out[k] = cleanAttrs(v as Record<string, unknown>)
      } else {
        out[k] = walk(v)
      }
    }
    return out
  }
  return walk(doc) as T
}

// ── LAYER 2: link schemes in the rendered output ─────────────────────────────

const SAFE_SCHEMES = ['http:', 'https:', 'mailto:', 'tel:']

// A URL with no scheme at all — /path, #anchor, ?q=, ./rel — is same-origin and fine.
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i

/**
 * Decode the entity forms a browser would resolve *before* dispatching a URL,
 * so `java&#115;cript:` cannot slip past a naive prefix test.
 *
 * The renderer double-escapes (`&` -> `&amp;`), so this is belt-and-braces
 * rather than the primary defence — but a future renderer change must not
 * silently turn that into a hole.
 */
function normalize(raw: string): string {
  // Decode to a FIXED POINT, and decode `&amp;` before the numeric forms.
  // Getting this order wrong is not theoretical — my first version stripped
  // numeric entities first, so `&amp;#x61;` never resolved to `a` and
  // `jav&amp;#x61;script:` walked past the check. (A browser would not have
  // executed that particular string either, since the scheme is invalid, but a
  // sanitizer that silently fails open on one encoding will fail open on the
  // next one someone finds.)
  let s = raw
  for (let i = 0; i < 5; i++) {
    const before = s
    s = s
      .replace(/&amp;/gi, '&')
      .replace(/&#x([0-9a-f]+);?/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
      .replace(/&#(\d+);?/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    if (s === before) break
  }
  // Browsers strip control characters and whitespace while parsing a scheme,
  // so "java\tscript:" and "java\nscript:" both execute. Remove them first.
  s = s.replace(/[\u0000-\u0020\u007f]/g, '')
  return s.toLowerCase()
}

export function isSafeUrl(raw: string): boolean {
  const s = normalize(raw)
  if (s === '') return false
  if (!HAS_SCHEME.test(s)) return true // relative / anchor / query
  return SAFE_SCHEMES.some((scheme) => s.startsWith(scheme))
}

/**
 * Neutralise unsafe `href` and `src` values in renderer output.
 *
 * Matching on `"..."` is safe HERE specifically because the renderer escapes
 * `"` inside attribute values to `&quot;` — so a quote cannot terminate the
 * attribute early and smuggle content past this regex. That assumption is the
 * one thing to re-check if the richtext renderer is ever swapped out.
 */
export function sanitizeRichTextHtml(html: string): string {
  if (!html) return ''
  return html.replace(
    /\s(href|src)="([^"]*)"/gi,
    (match, attr: string, value: string) => (isSafeUrl(value) ? match : ` ${attr}="#"`)
  )
}
