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
      <div className="container-x grid items-center gap-10 py-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-16 lg:py-20">
        <div className="max-w-xl">
          <p className="kicker">{dict.hero.location}</p>
          <h1 className="display mt-5 text-[2.35rem] sm:text-5xl lg:text-[3.35rem]">{dict.hero.headline}</h1>
          <p className="mt-6 text-[16px] leading-relaxed text-stone sm:text-[17px]">{dict.hero.sub}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href={localizedPath(locale, "book")} size="lg">
              {cta}
            </ButtonLink>
            <ButtonLink href={`${localizedPath(locale, "home")}#how`} variant="secondary" size="lg">
              {dict.hero.secondary}
            </ButtonLink>
          </div>
        </div>
        <EditorialPhoto
          src="/images/stone.jpg"
          alt={dict.hero.imageAlt}
          className="aspect-[4/5] w-full lg:aspect-[4/5]"
          priority
        />
      </div>
    </section>
  );
}
