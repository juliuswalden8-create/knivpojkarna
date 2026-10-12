import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import type { BusinessStatus } from "@/lib/business-status";
import type { PublicPackage } from "@/lib/pricing";
import { perKnifeCents, savingsCents } from "@/lib/pricing";
import { formatPrice, interpolate } from "@/lib/utils";
import { localizedPath } from "@/i18n/routes";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

export function PricingGrid({
  locale,
  dict,
  packages,
  singlePriceCents,
  businessStatus,
}: {
  locale: Locale;
  dict: Dictionary;
  packages: PublicPackage[];
  singlePriceCents: number;
  businessStatus: BusinessStatus;
}) {
  const bookLabel = businessStatus === "PRELAUNCH" ? dict.mode.registerCta : dict.pricing.book;
  return (
    <section id="pricing" className="border-t border-line bg-ivory">
      <div className="container-x py-20 lg:py-28">
        <Reveal className="max-w-2xl">
          <p className="kicker">{dict.pricing.kicker}</p>
          <h2 className="display mt-3 text-[2rem] sm:text-4xl">{dict.pricing.title}</h2>
          <p className="mt-4 text-[16px] leading-relaxed text-stone">{dict.pricing.intro}</p>
        </Reveal>

        <div className="mt-14 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-[0.16em] text-stone">
                <th className="py-3 pr-4 font-medium">{dict.pricing.kicker}</th>
                <th className="py-3 pr-4 font-medium"> </th>
                <th className="py-3 pr-4 font-medium">{dict.pricing.perKnife}</th>
                <th className="py-3 pr-4 font-medium">{dict.pricing.save}</th>
                <th className="py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => {
                const save = savingsCents(pkg, singlePriceCents);
                const per = perKnifeCents(pkg);
                return (
                  <tr key={pkg.id} className={cn("border-b border-line", pkg.highlighted && "bg-forest/[0.04]")}>
                    <td className="py-6 pr-4 align-top">
                      <p className="font-serif text-2xl">{pkg.name}</p>
                      {pkg.highlighted && <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-ember">{dict.pricing.mostPopular}</p>}
                    </td>
                    <td className="py-6 pr-4 align-top">
                      <p className="font-serif text-3xl">{formatPrice(pkg.priceCents, locale)}</p>
                      <p className="mt-1 text-sm text-stone">
                        {pkg.knifeCount === 1
                          ? dict.pricing.knifeOne
                          : interpolate(dict.pricing.knifeMany, { n: pkg.knifeCount })}
                      </p>
                      {pkg.features.map((f) => (
                        <p key={f} className="text-sm text-stone">
                          {f}
                        </p>
                      ))}
                    </td>
                    <td className="py-6 pr-4 align-top text-stone">{formatPrice(per, locale)}</td>
                    <td className="py-6 pr-4 align-top text-stone">{save > 0 ? formatPrice(save, locale) : "—"}</td>
                    <td className="py-6 align-top text-right">
                      <ButtonLink href={`${localizedPath(locale, "book")}?package=${pkg.slug}`} size="sm" variant={pkg.highlighted ? "primary" : "secondary"}>
                        {bookLabel}
                      </ButtonLink>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-stone">{dict.pricing.note}</p>
      </div>
    </section>
  );
}
