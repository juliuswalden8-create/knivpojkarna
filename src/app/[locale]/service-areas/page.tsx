import type { Metadata } from "next";
import { resolveLocale } from "@/i18n/locale";
import { localizedPath } from "@/i18n/routes";
import { getSettings, siteUrl } from "@/lib/site";
import { AreasMap } from "@/components/home/areas-map";
import { CtaBand } from "@/components/home/cta-band";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, dict } = await resolveLocale(params);
  return {
    title: dict.meta.areas.title,
    description: dict.meta.areas.description,
    keywords:
      locale === "es"
        ? [
            "afilado de cuchillos Marbella",
            "afilado de cuchillos Fuengirola",
            "afilado de cuchillos Puerto Banús",
            "afilado de cuchillos San Pedro",
            "afilado de cuchillos Mijas Costa",
          ]
        : [
            "knife sharpening Marbella",
            "knife sharpening Fuengirola",
            "knife sharpening Puerto Banús",
            "knife sharpening San Pedro",
            "knife sharpening Mijas Costa",
            "professional knife sharpening Marbella",
          ],
    alternates: { canonical: `${siteUrl()}${localizedPath(locale, "areas")}` },
  };
}

export default async function AreasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, dict } = await resolveLocale(params);
  const settings = await getSettings();

  return (
    <>
      <AreasMap locale={locale} dict={dict} headingAs="h1" businessStatus={settings.businessStatus} />
      <section className="border-t border-line bg-soft">
        <div className="container-x py-16 lg:py-24">
          <h2 className="display text-3xl">{dict.areasPage.seoTitle}</h2>
          <p className="mt-4 max-w-3xl text-[16px] leading-relaxed text-stone">{dict.areasPage.seoText}</p>
        </div>
      </section>
      <CtaBand
        locale={locale}
        dict={dict}
        whatsappNumber={settings.whatsappNumber}
        businessStatus={settings.businessStatus}
      />
    </>
  );
}
