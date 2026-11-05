import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import type { BusinessStatus } from "@/lib/business-status";
import { localizedPath } from "@/i18n/routes";
import { ButtonLink } from "@/components/ui/button";
import { EditorialPhoto } from "@/components/media/editorial-photo";
import { Reveal } from "@/components/ui/reveal";

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
    <section className="relative overflow-hidden bg-ivory">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_20%_0%,rgba(201,87,50,0.06),transparent_42%),radial-gradient(ellipse_at_90%_20%,rgba(32,32,32,0.04),transparent_45%)]"
        aria-hidden="true"
      />

      <div className="container-x grid items-center gap-10 py-12 sm:gap-12 sm:py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:py-20">
        <Reveal className="max-w-xl">
          <p className="kicker">{dict.hero.kicker}</p>
          <h1 className="display mt-5 text-balance text-[2.55rem] leading-[1.05] sm:text-5xl lg:text-[3.65rem]">
            {dict.hero.headlineLines?.[0] ?? dict.hero.headline}
            {dict.hero.headlineLines?.[1] ? (
              <>
                <br />
                {dict.hero.headlineLines[1]}
              </>
            ) : null}
          </h1>
          <p className="mt-5 max-w-md text-[16px] leading-relaxed text-stone sm:text-[17px]">{dict.hero.sub}</p>
          {prelaunch ? (
            <p className="mt-4 max-w-md font-display text-[1.15rem] font-semibold leading-snug tracking-[-0.02em] text-ink sm:text-[1.25rem]">
              {dict.mode.ctaTitle}
            </p>
          ) : null}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
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
          <p className="mt-5 max-w-md text-[13px] leading-relaxed text-stone sm:text-[14px]">
            {prelaunch ? dict.mode.ctaSub : dict.hero.trust}
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <EditorialPhoto
            src="/images/pexels-emanuele-ricciardi-2149743726-37989788.jpg"
            alt={dict.hero.imageAlt}
            caption={dict.hero.photoCredit || undefined}
            className="aspect-[4/5] w-full overflow-hidden sm:aspect-[5/4] lg:aspect-[4/5]"
            imageClassName="object-cover object-[58%_42%] grayscale contrast-[1.05]"
            priority
            sizes="(min-width: 1024px) 42vw, 100vw"
          />
        </Reveal>
      </div>
    </section>
  );
}
