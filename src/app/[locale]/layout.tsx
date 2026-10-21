import type { Metadata } from "next";
import { enabledLocales } from "@/i18n/config";
import { resolveLocale } from "@/i18n/locale";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { SiteNotice } from "@/components/layout/site-notice";
import { publicPageMeta } from "@/lib/page-meta";
import { customerFacingCopy, getSettings } from "@/lib/site";

export function generateStaticParams() {
  return enabledLocales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, dict } = await resolveLocale(params);
  return publicPageMeta(locale, "home", dict.meta.home.title, dict.meta.home.description);
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale, dict } = await resolveLocale(params);
  const settings = await getSettings();
  const storedWa = locale === "es" ? settings.whatsappMessageEs : settings.whatsappMessageEn;
  const waMessage = customerFacingCopy(storedWa).trim() || dict.whatsapp.message;

  return (
    <>
      <Header
        locale={locale}
        dict={dict}
        bookLabel={settings.businessStatus === "PRELAUNCH" ? dict.mode.registerCta : dict.nav.book}
      />
      <SiteNotice status={settings.businessStatus} dict={dict} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer
        locale={locale}
        dict={dict}
        whatsappNumber={settings.whatsappNumber}
        contactEmail={settings.contactEmail}
        instagramUrl={settings.instagramUrl}
        businessStatus={settings.businessStatus}
      />
      <WhatsAppButton number={settings.whatsappNumber} message={waMessage} label={dict.whatsapp.label} aria={dict.whatsapp.aria} />
      <CookieBanner locale={locale} dict={dict} />
    </>
  );
}
