import type { Metadata } from "next";
import { SITE_ORIGIN } from "@/lib/storyblok/seo";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import localFont from "next/font/local";
import AgeGate from "@/components/age-gate";
import LoadingScreen from "@/components/loading-screen";
import RevealGate from "@/components/reveal-gate";
import NewsletterPopupMount from "@/components/newsletter-popup-mount";
import CookieConsent from "@/components/cookie-consent";
import MobileTabBar from "@/components/mobile-tab-bar";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";
import ScanProvider from "@/components/scan/scan-provider";
import "./globals.css";

// Type roles per the frozen tokens (design-system/MASTER.md):
//   --font-display = Bebas Neue (lead voice, bold/dramatic headers)
//   --font-brand   = Lemon Milk Pro (licensed webfont, app/fonts)
//   --font-body    = DM Sans (long-form + default)
const bebas = Bebas_Neue({
  variable: "--font-bebas",
  weight: ["400"],
  subsets: ["latin"],
});

const lemonMilk = localFont({
  variable: "--font-lemon-milk",
  src: [
    { path: "./fonts/lemon-milk-pro-regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/lemon-milk-pro-medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/lemon-milk-pro-bold.woff2", weight: "700", style: "normal" },
  ],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Absolute base for OG/Twitter image URLs. The real domain, matching the
  // canonical every page now emits and SITE_URL in lib/schema — one identity
  // everywhere. On staging that means OG images point at the live host, which
  // is correct: staging must never advertise itself as the canonical home.
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: "Jungle Boys",
    template: "%s | Jungle Boys",
  },
  description:
    "Jungle Boys — premium cannabis cultivated in Los Angeles since 2006. Playing With Fire®.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bebas.variable} ${lemonMilk.variable} ${dmSans.variable} h-full antialiased`}
    >
      <head>
        <script
          // Applies the saved theme before first paint (default: light)
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('jb-theme')==='dark')document.documentElement.dataset.theme='dark'}catch(e){}",
          }}
        />
        <script
          // Decides the intro BEFORE first paint. LoadingScreen and RevealGate
          // both made this call in useEffect, so a returning visitor sat under
          // an opaque #050505 panel until hydration finished — 4.2s of black on
          // a fast connection, and the LCP that was measured was the panel, not
          // the page. Same reasoning as the theme script above: a decision that
          // controls what the first frame looks like has to run before it.
          dangerouslySetInnerHTML={{
            __html:
              "try{var d=document.documentElement," +
              "s=sessionStorage.getItem('jb-intro-done')==='1'||matchMedia('(prefers-reduced-motion: reduce)').matches," +
              "g=!!localStorage.getItem('jb-age-gate');" +
              "if(s)d.classList.add('jb-no-intro');" +
              "if(s&&g)d.classList.add('jb-reveal')}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ScanProvider>
          <LoadingScreen />
          <AgeGate />
          <RevealGate />
          <CookieConsent />
          <SiteNav />
          <div className="flex-1">{children}</div>
          <SiteFooter />
          <MobileTabBar />
          <NewsletterPopupMount />
        </ScanProvider>
      </body>
    </html>
  );
}
