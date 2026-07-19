import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans, Montserrat } from "next/font/google";
import AgeGate from "@/components/age-gate";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";
import "./globals.css";

// Type roles per the frozen tokens (design-system/MASTER.md):
//   --font-display = Bebas Neue (lead voice, bold/dramatic headers)
//   --font-brand   = Lemon Milk Pro via next/font/local when Avanti uploads the
//                    licensed files; Montserrat is the geometric stand-in until then
//   --font-body    = DM Sans (long-form + default)
const bebas = Bebas_Neue({
  variable: "--font-bebas",
  weight: ["400"],
  subsets: ["latin"],
});

const brandStandin = Montserrat({
  variable: "--font-brand-standin",
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
      className={`${bebas.variable} ${brandStandin.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AgeGate />
        <SiteNav />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
