import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/routes";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export function HowItWorks({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section id="how" className="border-t border-line bg-soft">
      <div className="container-x py-14 lg:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="kicker">{dict.how.kicker}</p>
          <h2 className="display mt-3 text-[2rem] sm:text-4xl">{dict.how.title}</h2>
        </Reveal>
        <ol className="mt-10 grid gap-8 sm:mt-12 sm:grid-cols-3 sm:gap-10">
          {dict.how.steps.map((step, i) => (
            <li key={step.num}>
              <Reveal delay={i * 0.05}>
                <article className="h-full border-t border-line pt-5">
                  <span className="font-display text-[13px] font-semibold tracking-[0.16em] text-orange">
                    {step.num}
                  </span>
                  <h3 className="mt-4 font-display text-[1.35rem] font-semibold tracking-[-0.02em] text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-stone">{step.text}</p>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex justify-center">
          <ButtonLink href={localizedPath(locale, "how")} variant="secondary" className="h-auto min-h-11 px-6 py-2.5">
            {dict.nav.howItWorks}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
