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
      <div className="container-x grid items-center gap-8 py-10 sm:gap-10 sm:py-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14 lg:py-20">
        <div className="max-w-xl">
          <p className="kicker">{dict.hero.location}</p>
          <h1 className="display mt-4 text-balance text-[2.55rem] sm:text-5xl lg:text-[3.6rem]">
            {dict.hero.headline}
          </h1>
          <p className="mt-5 max-w-md text-[16px] leading-relaxed text-stone sm:text-[17px]">{dict.hero.sub}</p>
          {prelaunch ? (
            <p className="mt-4 max-w-md font-display text-[1.2rem] font-semibold leading-snug tracking-[-0.02em] text-ink">
              {dict.mode.ctaTitle}
            </p>
          ) : null}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <ButtonLink
              href={localizedPath(locale, "book")}
              size="lg"
              className="h-auto min-h-12 w-full whitespace-normal px-7 py-3 text-center leading-snug sm:w-auto"
            >
              {cta}
            </ButtonLink>
            <ButtonLink
              href="#how"
              variant="secondary"
              size="lg"
              className="h-auto min-h-12 w-full whitespace-normal px-7 py-3 text-center leading-snug sm:w-auto"
            >
              {dict.hero.secondary}
            </ButtonLink>
          </div>
          <p className="mt-5 max-w-md text-[13px] leading-relaxed text-stone">
            {prelaunch ? dict.mode.ctaSub : dict.hero.trust}
          </p>
        </div>
        <EditorialPhoto
          src="/images/hero-sharpening.jpg"
          alt={dict.hero.imageAlt}
          caption={dict.hero.photoCredit}
          className="aspect-[5/4] w-full overflow-hidden rounded-[1.25rem] sm:aspect-[4/3] lg:aspect-[5/4]"
          imageClassName="origin-[82%_58%] scale-[1.45] object-[82%_58%] lg:scale-110"
          priority
          sizes="(min-width: 1024px) 42vw, 100vw"
        />
      </div>
    </section>
  );
}
