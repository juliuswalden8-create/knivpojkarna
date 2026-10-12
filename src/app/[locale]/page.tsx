import { resolveLocale } from "@/i18n/locale";
import { getPackages, getSettings } from "@/lib/site";
import { Hero } from "@/components/home/hero";
import { AboutTeaser } from "@/components/home/about-teaser";
import { HowItWorks } from "@/components/home/how-it-works";
import { PricingGrid } from "@/components/home/pricing-grid";
import { Why } from "@/components/home/why";
import { BeforeAfter } from "@/components/home/before-after";
import { AreasMap } from "@/components/home/areas-map";
import { CtaBand } from "@/components/home/cta-band";
import { JsonLd } from "@/components/seo/json-ld";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, dict } = await resolveLocale(params);
  const [packages, settings] = await Promise.all([getPackages(locale), getSettings()]);
  const single = packages.find((p) => p.knifeCount === 1)?.priceCents ?? 700;

  return (
    <>
      <JsonLd locale={locale} description={dict.meta.home.description} />
      <Hero locale={locale} dict={dict} businessStatus={settings.businessStatus} />
      <AboutTeaser locale={locale} dict={dict} businessStatus={settings.businessStatus} />
      <HowItWorks dict={dict} />
      <PricingGrid
        locale={locale}
        dict={dict}
        packages={packages}
        singlePriceCents={single}
        businessStatus={settings.businessStatus}
      />
      <Why dict={dict} />
      <BeforeAfter dict={dict} />
      <AreasMap locale={locale} dict={dict} businessStatus={settings.businessStatus} />
      <CtaBand
        locale={locale}
        dict={dict}
        whatsappNumber={settings.whatsappNumber}
        businessStatus={settings.businessStatus}
      />
    </>
  );
}
