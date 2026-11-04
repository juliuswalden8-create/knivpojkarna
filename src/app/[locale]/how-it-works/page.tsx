import type { Metadata } from "next";
import { resolveLocale } from "@/i18n/locale";
import { publicPageMeta } from "@/lib/page-meta";
import { getSettings } from "@/lib/site";
import { HowPage } from "@/components/how/how-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, dict } = await resolveLocale(params);
  return publicPageMeta(locale, "how", dict.meta.how.title, dict.meta.how.description);
}

export default async function HowItWorksRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, dict } = await resolveLocale(params);
  const settings = await getSettings();

  return <HowPage locale={locale} dict={dict} businessStatus={settings.businessStatus} />;
}
