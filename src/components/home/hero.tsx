import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import type { BusinessStatus } from "@/lib/business-status";
import { localizedPath } from "@/i18n/routes";
import { ButtonLink } from "@/components/ui/button";
import { EditorialPhoto } from "@/components/media/editorial-photo";

export function Hero({
  locale,
  dict,
  businessStatus,
}: {
  locale: Locale;
  dict: Dictionary;
  businessStatus: BusinessStatus;
}) {
  const prelaunch = businessStatus === "PRELAUNCH";
  const cta = prelaunch ? dict.mode.registerCta : dict.hero.primary;
  return (
    <section className="bg-ivory">
      <div className="container-x grid items-center gap-5 py-6 sm:gap-8 sm:py-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-12 lg:py-10">
        <div className="max-w-xl">
          <p className="kicker">{dict.hero.location}</p>
          <h1 className="display mt-2 text-balance text-[2.45rem] leading-[1.02] sm:mt-3 sm:text-5xl sm:leading-[1.05] lg:text-[3.75rem] lg:leading-[1.04]">
            {dict.hero.headline}
          </h1>
          <p className="mt-3 max-w-md text-[16px] leading-snug text-stone sm:text-[17px] sm:leading-relaxed">{dict.hero.sub}</p>
          {prelaunch ? (
            <p className="mt-2 max-w-md font-serif text-[1.25rem] leading-snug text-ink sm:text-[1.4rem]">{dict.mode.ctaTitle}</p>
          ) : null}
          <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row sm:flex-wrap sm:items-center">
            <ButtonLink
              href={localizedPath(locale, "book")}
              size="lg"
              className="h-auto min-h-12 w-full whitespace-normal px-6 py-3 text-center leading-snug sm:w-auto"
            >
              {cta}
            </ButtonLink>
            <ButtonLink
              href="#pricing"
              variant="secondary"
              size="lg"
              className="h-auto min-h-12 w-full whitespace-normal px-6 py-3 text-center leading-snug sm:w-auto"
            >
              {dict.hero.viewPrices}
            </ButtonLink>
          </div>
          <p className="mt-3 max-w-md text-[13px] leading-relaxed text-stone">
            {prelaunch ? dict.mode.ctaSub : dict.hero.trust}
          </p>
        </div>
        <EditorialPhoto
          src="/images/hero-sharpening.jpg"
          alt={dict.hero.imageAlt}
          caption={dict.hero.photoCredit}
          className="aspect-[12/5] w-full sm:aspect-[2/1] lg:aspect-[3/2]"
          imageClassName="origin-[82%_58%] scale-[1.55] object-[82%_58%] lg:scale-110"
          priority
          sizes="(min-width: 1024px) 42vw, 100vw"
        />
      </div>
    </section>
  );
}
