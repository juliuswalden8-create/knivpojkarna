import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import { headers } from "next/headers";
import { defaultLocale, localeHtmlLang } from "@/i18n/config";
import { siteUrl } from "@/lib/site";
import { VercelAnalytics } from "@/components/layout/analytics";
import { MotionProvider } from "@/components/ui/motion-provider";
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
    default: "Knife Sharpening Marbella | Pickup & Delivery – BladeBud",
    template: "%s | BladeBud",
  },
  description:
    "Professional knife sharpening in Marbella and Costa del Sol. We collect your knives, sharpen them and deliver them back to your door. Sharpening from €7.",
  applicationName: "BladeBud",
  verification: {
    google: [
      "iNj3IBhH3Cu6_zCxLl7Ij43Yk7Z2ugpr6Fl1Ypt8D2Y",
      "TVdQAHAR5DYhRQs5XJnJITZXrfVkMyhRTkjLPK8s6Qs",
    ],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const localeHeader = (await headers()).get("x-locale") || defaultLocale;
  const lang = localeHtmlLang[localeHeader as keyof typeof localeHtmlLang] ?? "en";

  return (
    <html lang={lang} className={`${serif.variable} ${sans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-ivory font-sans text-ink">
        <MotionProvider>{children}</MotionProvider>
        <VercelAnalytics />
      </body>
    </html>
  );
}
