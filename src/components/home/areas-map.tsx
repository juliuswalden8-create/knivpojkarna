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
}: {
  locale: Locale;
  dict: Dictionary;
  headingAs?: "h1" | "h2";
  businessStatus: BusinessStatus;
}) {
  const Heading = headingAs;

  return (
    <section id="areas" className="border-t border-line bg-ivory">
      <div className="container-x py-16 lg:py-28">
        <Reveal className="max-w-3xl">
          <p className="kicker">{dict.areas.kicker}</p>
          <Heading className="display mt-4 text-[2.15rem] sm:text-4xl lg:text-[2.9rem]">{dict.areas.title}</Heading>
          <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-stone sm:text-[17px]">{dict.areas.intro}</p>
        </Reveal>

        <div className="mt-14 grid gap-12 border-y border-line py-12 lg:grid-cols-2 lg:gap-20">
          {dict.areas.methods.map((method) => (
            <div key={method.title}>
              <p className="kicker">{method.kicker}</p>
              <h3 className="mt-3 font-serif text-2xl sm:text-[1.85rem]">{method.title}</h3>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-stone">{method.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <p className="kicker">{dict.areas.examplesLabel}</p>
          <p className="mt-5 max-w-4xl font-serif text-[1.35rem] leading-snug text-ink sm:text-[1.55rem]">
            {dict.areas.examples.join("  ·  ")}
          </p>
          <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-stone">{dict.areas.examplesNote}</p>
        </div>

        <div className="mt-16 border-t border-line pt-14 lg:mt-20">
          <p className="kicker">{dict.areas.mailInKicker}</p>
          <h3 className="display mt-3 max-w-2xl text-[1.85rem] sm:text-3xl">{dict.areas.mailInTitle}</h3>
          <ol className="mt-10 divide-y divide-line border-y border-line">
            {dict.areas.mailInSteps.map((step) => (
              <li key={step.num} className="grid gap-3 py-6 sm:grid-cols-[4.5rem_1fr_1.5fr] sm:items-baseline">
                <span className="font-serif text-2xl text-stone">{step.num}</span>
                <h4 className="font-serif text-xl sm:text-[1.45rem]">{step.title}</h4>
                <p className="max-w-md text-[15px] leading-relaxed text-stone">{step.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 max-w-2xl text-[14px] leading-relaxed text-stone">{dict.areas.mailInShipping}</p>
          <ButtonLink href={localizedPath(locale, "book")} className="mt-10">
            {businessStatus === "PRELAUNCH" ? dict.mode.registerCta : dict.areas.cta}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
