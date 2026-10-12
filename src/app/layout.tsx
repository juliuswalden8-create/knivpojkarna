import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import { headers } from "next/headers";
import { defaultLocale, localeHtmlLang } from "@/i18n/config";
import { siteUrl } from "@/lib/site";
import { VercelAnalytics } from "@/components/layout/analytics";
import "./globals.css";

const serif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
  weight: "400",
  style: ["normal", "italic"],
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "KNIVPOJKARNA — We Bring Back the Edge",
    template: "%s | KNIVPOJKARNA",
  },
  description: "Professional knife sharpening from Marbella to Fuengirola.",
  applicationName: "KNIVPOJKARNA",
  icons: { icon: "/favicon.svg" },
  verification: {
    google: "iNj3IBhH3Cu6_zCxLl7Ij43Yk7Z2ugpr6Fl1Ypt8D2Y",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const localeHeader = (await headers()).get("x-locale") || defaultLocale;
  const lang = localeHtmlLang[localeHeader as keyof typeof localeHtmlLang] ?? "en";

  return (
    <html lang={lang} className={`${serif.variable} ${sans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-ivory font-sans text-ink">
        {children}
        <VercelAnalytics />
      </body>
    </html>
  );
}
