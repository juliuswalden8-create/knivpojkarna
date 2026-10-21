import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import type { BusinessStatus } from "@/lib/business-status";
import type { PublicPackage } from "@/lib/pricing";
import { perKnifeCents, savingsCents } from "@/lib/pricing";
import { formatPrice, interpolate } from "@/lib/utils";
import { localizedPath } from "@/i18n/routes";
import Link from "next/link";
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
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="kicker">{dict.pricing.kicker}</p>
            <h2 className="display mt-3 text-[2rem] sm:text-4xl">{dict.pricing.title}</h2>
            <p className="mt-4 text-[16px] leading-relaxed text-stone">{dict.pricing.intro}</p>
          </div>
          <Link href={localizedPath(locale, "prices")} className="text-sm text-ink underline-offset-4 hover:underline">
            {dict.pricing.viewAll}
          </Link>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {packages.map((pkg) => {
            const save = savingsCents(pkg, singlePriceCents);
            const per = perKnifeCents(pkg);
            const featured = pkg.highlighted;
            return (
              <article
                key={pkg.id}
                className={cn(
                  "flex h-full min-h-full flex-col border p-6 sm:p-7",
                  featured ? "border-forest bg-forest text-soft" : "border-line bg-soft text-ink",
                )}
              >
                <p className={cn("text-[11px] uppercase tracking-[0.16em]", featured ? "text-sage" : "text-stone")}>
                  {featured ? dict.pricing.mostPopular : dict.pricing.kicker}
                </p>
                <h3 className="mt-4 min-h-[2.4em] font-serif text-[1.65rem] leading-tight">{pkg.name}</h3>
                <p className="mt-5 font-serif text-4xl tracking-[-0.03em]">{formatPrice(pkg.priceCents, locale)}</p>
                <p className={cn("mt-2 text-sm leading-relaxed", featured ? "text-soft/75" : "text-stone")}>
                  {pkg.knifeCount === 1 ? dict.pricing.knifeOne : interpolate(dict.pricing.knifeMany, { n: pkg.knifeCount })}
                </p>
                <p className={cn("mt-4 text-sm leading-relaxed", featured ? "text-soft/75" : "text-stone")}>
                  {formatPrice(per, locale)} {dict.pricing.perKnife}
                </p>
                <div className="mt-3 min-h-7">
                  {save > 0 ? (
                    <span
                      className={cn(
                        "inline-flex whitespace-nowrap border px-2.5 py-1 text-[12px] leading-none",
                        featured ? "border-soft/30 text-soft" : "border-line text-ink",
                      )}
                    >
                      {dict.pricing.save} {formatPrice(save, locale)}
                    </span>
                  ) : null}
                </div>
                {pkg.features.length > 0 ? (
                  <ul className={cn("mt-5 space-y-2 text-sm leading-relaxed", featured ? "text-soft/80" : "text-stone")}>
                    {pkg.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                ) : null}
                <div className="mt-auto pt-8">
                  <ButtonLink
                    href={`${localizedPath(locale, "book")}?package=${pkg.slug}`}
                    size="sm"
                    variant={featured ? "light" : "primary"}
                    className="h-auto min-h-11 w-full whitespace-normal px-3 py-2.5 text-center leading-snug"
                  >
                    {bookLabel}
                  </ButtonLink>
                </div>
              </article>
            );
          })}
        </div>
        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-stone">{dict.pricing.note}</p>
      </div>
    </section>
  );
}
