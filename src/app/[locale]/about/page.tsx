import type { Metadata } from "next";
import { resolveLocale } from "@/i18n/locale";
import { localizedPath } from "@/i18n/routes";
import { getSettings, siteUrl } from "@/lib/site";
import { AboutTeaser } from "@/components/home/about-teaser";
import { CtaBand } from "@/components/home/cta-band";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, dict } = await resolveLocale(params);
  return {
    title: dict.meta.about.title,
    description: dict.meta.about.description,
    alternates: { canonical: `${siteUrl()}${localizedPath(locale, "about")}` },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, dict } = await resolveLocale(params);
  const settings = await getSettings();
  return (
    <>
      <AboutTeaser locale={locale} dict={dict} businessStatus={settings.businessStatus} />
      <CtaBand
        locale={locale}
        dict={dict}
        whatsappNumber={settings.whatsappNumber}
        businessStatus={settings.businessStatus}
      />
    </>
  );
}
