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
  const cta = businessStatus === "PRELAUNCH" ? dict.mode.registerCta : dict.hero.primary;
  return (
    <section className="bg-ivory">
      <div className="container-x grid items-end gap-12 py-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:py-24">
        <div className="max-w-2xl">
          <p className="kicker">{dict.hero.location}</p>
          <h1 className="display mt-5 text-[2.75rem] sm:text-6xl lg:text-[4.25rem]">{dict.hero.headline}</h1>
          <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-stone sm:text-lg">{dict.hero.sub}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href={localizedPath(locale, "book")} size="lg" className="h-auto min-h-12 whitespace-normal px-6 py-3 text-center leading-snug">
              {cta}
            </ButtonLink>
            <ButtonLink href="#pricing" variant="secondary" size="lg" className="h-auto min-h-12 whitespace-normal px-6 py-3 text-center leading-snug">
              {dict.nav.prices}
            </ButtonLink>
          </div>
          <p className="mt-6 text-sm text-stone">{dict.hero.trust}</p>
        </div>
        <EditorialPhoto
          src="/images/hero-sharpening.jpg"
          alt={dict.hero.imageAlt}
          caption={dict.hero.photoCredit}
          className="aspect-[4/5] w-full"
          priority
          sizes="(min-width: 1024px) 42vw, 100vw"
        />
      </div>
    </section>
  );
}
