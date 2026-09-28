// Dutchie image CDN helpers. images.dutchie.com is imgix WITH the AI
// background-removal add-on enabled (verified 2026-09-28: ?bg-remove=true&
// fm=png returns true alpha cutouts). Use cutouts ONLY on dark grounds where
// a baked white studio box would show — light/white stages keep the cheaper
// mix-blend-multiply melt instead.
export function cutoutUrl(url: string, width = 800): string {
  if (!url.includes('images.dutchie.com')) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}bg-remove=true&fm=png&w=${width}`
}
