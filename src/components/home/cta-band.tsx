import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import type { BusinessStatus } from "@/lib/business-status";
import { localizedPath } from "@/i18n/routes";
import { ButtonLink } from "@/components/ui/button";
import { whatsappLink } from "@/lib/site";

export function CtaBand({
  locale,
  dict,
  whatsappNumber,
  businessStatus,
}: {
  locale: Locale;
  dict: Dictionary;
  whatsappNumber: string;
  businessStatus: BusinessStatus;
}) {
  const wa = whatsappLink(whatsappNumber, dict.whatsapp.message);
  const prelaunch = businessStatus === "PRELAUNCH";
  return (
    <section className="border-t border-line bg-forest text-soft">
      <div className="container-x py-20 lg:py-28">
        <h2 className="max-w-2xl font-serif text-[2.4rem] leading-[1.12] tracking-[-0.025em] sm:text-5xl">
          {prelaunch ? dict.mode.ctaTitle : dict.cta.title}
        </h2>
        <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-soft/75">{prelaunch ? dict.mode.ctaSub : dict.cta.sub}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href={localizedPath(locale, "book")} size="lg" variant="light">
            {prelaunch ? dict.mode.registerCta : dict.cta.button}
          </ButtonLink>
          {wa && (
            <ButtonLink href={wa} variant="secondary" size="lg" className="border-soft/30 text-soft hover:border-soft">
              {dict.cta.secondary}
            </ButtonLink>
          )}
        </div>
      </div>
    </section>
  );
}
