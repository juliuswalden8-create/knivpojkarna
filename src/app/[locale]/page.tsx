import { resolveLocale } from "@/i18n/locale";
import { getPackages, getSettings } from "@/lib/site";
import { Hero } from "@/components/home/hero";
import { Experience } from "@/components/home/experience";
import { AboutTeaser } from "@/components/home/about-teaser";
import { HowItWorks } from "@/components/home/how-it-works";
import { KnifeBrandsMarquee } from "@/components/home/knife-brands-marquee";
import { PricingGrid } from "@/components/home/pricing-grid";
import { Why } from "@/components/home/why";
import { AreasMap } from "@/components/home/areas-map";
import { FaqAccordion } from "@/components/home/faq-accordion";
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
      <Experience dict={dict} />
      <HowItWorks locale={locale} dict={dict} />
      <KnifeBrandsMarquee dict={dict} />
      <Why dict={dict} />
      <PricingGrid
        locale={locale}
        dict={dict}
        packages={packages}
        singlePriceCents={single}
        businessStatus={settings.businessStatus}
        zone1FeeCents={settings.deliveryZone1FeeCents}
        freeDeliveryThresholdCents={settings.freeDeliveryThresholdCents}
      />
      <AreasMap locale={locale} dict={dict} businessStatus={settings.businessStatus} showMailIn={false} />
      <AboutTeaser locale={locale} dict={dict} businessStatus={settings.businessStatus} variant="home" />
      <FaqAccordion dict={dict} />
      <CtaBand
        locale={locale}
        dict={dict}
        whatsappNumber={settings.whatsappNumber}
        businessStatus={settings.businessStatus}
      />
    </>
  );
}
