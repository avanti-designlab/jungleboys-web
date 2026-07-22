import type { NextConfig } from "next";

// Security headers baseline (04 §5) — verified by the per-phase security audit.
// CSP notes:
//  - 'unsafe-inline' script-src is a Phase 0 concession to Next's inline runtime;
//    Phase 1 replaces it with nonce-based CSP via middleware (tracked audit finding SEC-P0-1).
//  - connect/img/frame allowlists grow per phase (Storyblok now; Dutchie embeds + GA in later
//    phases). Additions require a note in the phase's security audit.
//  - dev builds add 'unsafe-eval' + ws: for HMR only; never shipped to production.
const isDev = process.env.NODE_ENV === "development";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' https://api.storyblok.com https://api-us.storyblok.com https://nominatim.openstreetmap.org${isDev ? " ws:" : ""}`,
  "frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
];

import { redirects } from "./lib/redirects";

const nextConfig: NextConfig = {
  images: {
    // Interim: current-site assets served from Webflow's CDN while content
    // migrates; production assets move first-party before cutover (03 CWV budget).
    remotePatterns: [
      { protocol: "https", hostname: "cdn.prod.website-files.com" },
      { protocol: "https", hostname: "i.ytimg.com" }, // YouTube thumbnails (Media hub)
      { protocol: "https", hostname: "a.storyblok.com" }, // Storyblok assets (EU)
      { protocol: "https", hostname: "a-us.storyblok.com" }, // Storyblok assets (US — our space)
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  async redirects() {
    return redirects;
  },
};

export default nextConfig;
