import type { NextConfig } from "next";

// Security headers + CSP now live in lib/security-headers.ts so middleware.ts
// can apply the SAME list to responses next.config never reaches (its
// redirects() are served before headers() and shipped bare). Two copies of a
// CSP is how they drift apart.
import { securityHeaders } from "./lib/security-headers";

import { redirects } from "./lib/redirects";

const nextConfig: NextConfig = {
  images: {
    // Interim: current-site assets served from Webflow's CDN while content
    // migrates; production assets move first-party before cutover (03 CWV budget).
    remotePatterns: [
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
