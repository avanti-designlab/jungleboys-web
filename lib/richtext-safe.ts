// Scheme allowlist for CMS richtext (security finding SEC-P2-1).
//
// `renderRichText` from @storyblok/richtext escapes text nodes and attribute
// VALUES, but it does not validate link SCHEMES. A Storyblok editor can author
//   { type: 'link', attrs: { href: 'javascript:alert(document.domain)' } }
// and the renderer emits it verbatim into an href. Both consumers push that
// straight into `dangerouslySetInnerHTML`, and our CSP carries
// `script-src 'unsafe-inline'`, which is exactly the grant that lets a
// `javascript:` URI run — so CSP does not catch it either.
//
// Invariant 04 §9 #5 is unconditional: all CMS content is untrusted and must be
// sanitized. This is the sanitizer for the one hole that renderer leaves.
//
// It deliberately does NOT try to be a general HTML sanitizer. The renderer's
// escaping of text and attribute values is sound (verified against the
// installed package), so widening scope here would add risk, not remove it.

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
