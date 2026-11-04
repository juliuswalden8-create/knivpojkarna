import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import type { BusinessStatus } from "@/lib/business-status";
import { localizedPath } from "@/i18n/routes";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export function AreasMap({
  locale,
  dict,
  headingAs = "h2",
  businessStatus,
  showMailIn = true,
}: {
  locale: Locale;
  dict: Dictionary;
  headingAs?: "h1" | "h2";
  businessStatus: BusinessStatus;
  showMailIn?: boolean;
}) {
  const Heading = headingAs;

  return (
    <section id="areas" className="border-t border-line bg-ivory">
      <div className="container-x py-14 lg:py-24">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="kicker">{dict.areas.kicker}</p>
          <Heading className="display mt-4 text-[2.15rem] sm:text-4xl lg:text-[2.9rem]">{dict.areas.title}</Heading>
          <p className="mt-6 text-[16px] leading-relaxed text-stone sm:text-[17px]">{dict.areas.intro}</p>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
          {dict.areas.examples.map((town, index) => (
            <article key={town} className="rounded-[1.25rem] border border-line bg-soft p-5 sm:p-6">
              <p className="font-display text-[13px] font-semibold tracking-[0.16em] text-orange">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 font-display text-[1.2rem] font-semibold tracking-[-0.02em] text-ink">{town}</h3>
              <p className="mt-2 text-[13px] text-stone">{dict.areas.pickupAvailable}</p>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-[14px] leading-relaxed text-stone">{dict.areas.pickupNote}</p>
        <p className="mx-auto mt-3 max-w-2xl text-center text-[14px] leading-relaxed text-stone">{dict.areas.notListed}</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12">
          {dict.areas.methods.map((method) => (
            <div key={method.title} className="rounded-[1.25rem] border border-line bg-soft p-6">
              <p className="kicker">{method.kicker}</p>
              <h3 className="mt-3 font-display text-[1.35rem] font-semibold tracking-[-0.02em]">{method.title}</h3>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-stone">{method.text}</p>
            </div>
          ))}
        </div>

        {showMailIn ? (
          <div className="mt-16 border-t border-line pt-14 lg:mt-20">
            <p className="kicker">{dict.areas.mailInKicker}</p>
            <h3 className="display mt-3 max-w-2xl text-[1.85rem] sm:text-3xl">{dict.areas.mailInTitle}</h3>
            <ol className="mt-10 divide-y divide-line border-y border-line">
              {dict.areas.mailInSteps.map((step) => (
                <li key={step.num} className="grid gap-3 py-6 sm:grid-cols-[4.5rem_1fr_1.5fr] sm:items-baseline">
                  <span className="font-display text-2xl font-semibold text-stone">{step.num}</span>
                  <h4 className="font-display text-xl font-semibold tracking-[-0.02em] sm:text-[1.45rem]">{step.title}</h4>
                  <p className="max-w-md text-[15px] leading-relaxed text-stone">{step.text}</p>
                </li>
              ))}
            </ol>
            <p className="mt-8 max-w-2xl text-[14px] leading-relaxed text-stone">{dict.areas.mailInShipping}</p>
            <ButtonLink href={localizedPath(locale, "book")} className="mt-10">
              {businessStatus === "PRELAUNCH" ? dict.mode.registerCta : dict.areas.cta}
            </ButtonLink>
          </div>
        ) : (
          <div className="mt-10 flex justify-center">
            <ButtonLink href={localizedPath(locale, "book")} className="h-auto min-h-12 px-7 py-3">
              {businessStatus === "PRELAUNCH" ? dict.mode.registerCta : dict.areas.cta}
            </ButtonLink>
          </div>
        )}
      </div>
    </section>
  );
}
