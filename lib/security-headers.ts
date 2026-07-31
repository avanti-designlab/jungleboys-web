// The security-header baseline (04 §5), in ONE place.
//
// It used to live only in next.config.ts, where it applies to rendered
// responses but NOT to redirects — next.config's redirects() are served before
// headers() reaches them, so every 301/308 shipped bare. Middleware needs the
// same list, and two copies of a CSP is how they drift.
export const isDev = process.env.NODE_ENV === 'development'

export const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  // blob: — three.js GLTFLoader creates ephemeral same-origin blob URLs for the
  // embedded 3D-model textures (Pops jar viewer); worker-src for its decoders.
  `connect-src 'self' blob: https://api.storyblok.com https://api-us.storyblok.com https://nominatim.openstreetmap.org${isDev ? ' ws:' : ''}`,
  "worker-src 'self' blob:",
  'frame-src \'self\' https://www.youtube-nocookie.com https://www.youtube.com',
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ')

export const securityHeaders: { key: string; value: string }[] = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(self)' },
]
