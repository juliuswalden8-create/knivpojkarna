import type { Metadata } from "next";
import { resolveLocale } from "@/i18n/locale";
import { getPackages, getSettings } from "@/lib/site";
import { publicPageMeta } from "@/lib/page-meta";
import { PricingGrid } from "@/components/home/pricing-grid";
import { CtaBand } from "@/components/home/cta-band";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, dict } = await resolveLocale(params);
  return {
    ...publicPageMeta(locale, "prices", dict.meta.prices.title, dict.meta.prices.description),
    keywords:
      locale === "es"
        ? ["precios afilado de cuchillos Marbella", "afilar cuchillos Marbella"]
        : ["knife sharpening prices Marbella", "knife sharpening Costa del Sol"],
  };
}

export default async function PricesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, dict } = await resolveLocale(params);
  const [packages, settings] = await Promise.all([getPackages(locale), getSettings()]);
  const single = packages.find((p) => p.knifeCount === 1)?.priceCents ?? 700;

  return (
    <>
      <PricingGrid
        locale={locale}
        dict={dict}
        packages={packages}
        singlePriceCents={single}
        businessStatus={settings.businessStatus}
        zone1FeeCents={settings.deliveryZone1FeeCents}
        freeDeliveryThresholdCents={settings.freeDeliveryThresholdCents}
      />
      <section className="border-t border-line bg-soft pb-24">
        <div className="container-x pt-16">
          <h2 className="display text-3xl">{dict.pricing.faqTitle}</h2>
          <dl className="mt-10 max-w-3xl divide-y divide-line">
            {dict.pricing.faq.map((item) => (
              <div key={item.q} className="py-6">
                <dt className="font-medium">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-stone">{item.a}</dd>
              </div>
            ))}
          </dl>
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
