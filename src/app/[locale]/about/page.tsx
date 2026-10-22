import type { Metadata } from "next";
import { resolveLocale } from "@/i18n/locale";
import { publicPageMeta } from "@/lib/page-meta";
import { getSettings } from "@/lib/site";
import { AboutTeaser } from "@/components/home/about-teaser";
import { CtaBand } from "@/components/home/cta-band";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, dict } = await resolveLocale(params);
  return publicPageMeta(locale, "about", dict.meta.about.title, dict.meta.about.description);
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, dict } = await resolveLocale(params);
  const settings = await getSettings();
  return (
    <>
      <AboutTeaser locale={locale} dict={dict} businessStatus={settings.businessStatus} headingAs="h1" />
      <CtaBand
        locale={locale}
        dict={dict}
        whatsappNumber={settings.whatsappNumber}
        businessStatus={settings.businessStatus}
      />
    </>
  );
}
