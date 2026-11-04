import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import type { BusinessStatus } from "@/lib/business-status";
import { localizedPath } from "@/i18n/routes";
import { ButtonLink } from "@/components/ui/button";
import { HowTimeline } from "./how-timeline";

export function HowPage({
  locale,
  dict,
  businessStatus,
}: {
  locale: Locale;
  dict: Dictionary;
  businessStatus: BusinessStatus;
}) {
  const cta = businessStatus === "PRELAUNCH" ? dict.mode.registerCta : dict.howPage.cta;

  return (
    <div className="bg-ivory">
      <section className="border-b border-line">
        <div className="container-x py-16 sm:py-20 lg:py-28">
          <p className="kicker">{dict.howPage.kicker}</p>
          <h1 className="display mt-5 max-w-3xl text-[2.6rem] sm:text-5xl lg:text-[3.6rem]">{dict.howPage.title}</h1>
          <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-stone sm:text-[18px]">{dict.howPage.intro}</p>
        </div>
      </section>

      <section className="container-x py-16 lg:py-24">
        <HowTimeline dict={dict} />
      </section>

      <section className="border-t border-line">
        <div className="container-x py-16 lg:py-24">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {dict.howPage.features.map((feature) => (
              <div key={feature.title} className="border-t border-line pt-5">
                <h3 className="font-display text-[1.15rem] font-semibold tracking-[-0.02em] text-ink">{feature.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-stone">{feature.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col items-start gap-4 sm:mt-16 sm:flex-row sm:items-center">
            <ButtonLink href={localizedPath(locale, "book")} size="lg" className="h-auto min-h-12 px-8 py-3.5">
              {cta}
            </ButtonLink>
            <p className="max-w-md text-[14px] leading-relaxed text-stone">{dict.howPage.ctaNote}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
