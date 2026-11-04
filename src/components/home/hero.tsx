import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import type { BusinessStatus } from "@/lib/business-status";
import { localizedPath } from "@/i18n/routes";
import { ButtonLink } from "@/components/ui/button";

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
    <section className="relative isolate overflow-hidden bg-ivory">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div
          className="costa-map-underlay absolute left-1/2 top-[8%] h-[78%] w-[150%] max-w-none -translate-x-1/2 opacity-[0.34] sm:top-[2%] sm:h-[92%] sm:w-[120%] sm:opacity-[0.4] lg:left-[58%] lg:w-[105%] lg:opacity-[0.45]"
          style={{
            backgroundImage: "url(/images/costa-del-sol-map.svg)",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center center",
            backgroundSize: "cover",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(248,246,242,0.15)_0%,rgba(248,246,242,0.78)_52%,rgba(248,246,242,0.96)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ivory to-transparent" />
      </div>

      <div className="container-x relative flex min-h-[78vh] flex-col items-center justify-center py-16 text-center sm:min-h-[84vh] sm:py-24 lg:py-28">
        <p className="kicker text-stone">{dict.hero.kicker}</p>
        <h1 className="display mt-6 max-w-4xl text-balance text-[2.75rem] leading-[1.05] sm:text-6xl lg:text-[4.35rem]">
          {dict.hero.headlineLines?.[0] ?? dict.hero.headline}
          {dict.hero.headlineLines?.[1] ? (
            <>
              <br />
              {dict.hero.headlineLines[1]}
            </>
          ) : null}
        </h1>
        <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-stone sm:text-[18px]">{dict.hero.sub}</p>
        {prelaunch ? (
          <p className="mt-5 max-w-lg font-display text-[1.15rem] font-semibold leading-snug tracking-[-0.02em] text-ink sm:text-[1.25rem]">
            {dict.mode.ctaTitle}
          </p>
        ) : null}
        <div className="mt-9 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:w-auto sm:flex-row sm:items-center sm:justify-center">
          <ButtonLink
            href={localizedPath(locale, "book")}
            size="lg"
            className="h-auto min-h-12 w-full whitespace-normal px-8 py-3.5 text-center leading-snug sm:w-auto"
          >
            {cta}
          </ButtonLink>
          <ButtonLink
            href={localizedPath(locale, "how")}
            variant="secondary"
            size="lg"
            className="h-auto min-h-12 w-full whitespace-normal px-8 py-3.5 text-center leading-snug sm:w-auto"
          >
            {dict.hero.secondary}
          </ButtonLink>
        </div>
        <p className="mt-6 max-w-lg text-[13px] leading-relaxed text-stone sm:text-[14px]">
          {prelaunch ? dict.mode.ctaSub : dict.hero.trust}
        </p>
      </div>
    </section>
  );
}
