import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import type { BusinessStatus } from "@/lib/business-status";
import { localizedPath } from "@/i18n/routes";
import { ButtonLink } from "@/components/ui/button";
import { EditorialPhoto } from "@/components/media/editorial-photo";
import { Reveal } from "@/components/ui/reveal";

export function AboutTeaser({
  locale,
  dict,
  businessStatus,
  variant = "full",
  headingAs = "h2",
}: {
  locale: Locale;
  dict: Dictionary;
  businessStatus: BusinessStatus;
  variant?: "home" | "full";
  headingAs?: "h1" | "h2";
}) {
  const home = variant === "home";
  const Heading = headingAs;
  return (
    <section id="about" className="border-t border-line bg-soft">
      <div className="container-x py-14 lg:py-28">
        <Reveal className="max-w-2xl">
          <p className="kicker">{dict.about.kicker}</p>
          <Heading className="display mt-3 text-[2rem] sm:text-4xl lg:text-[2.8rem]">{home ? dict.about.meetTitle : dict.about.title}</Heading>
          <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-stone sm:text-[17px]">{dict.about.body}</p>
        </Reveal>

        <div className="mt-8 grid gap-8 lg:mt-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <EditorialPhoto
              src="/images/julius-walden.jpg"
              alt={dict.about.photoAlt}
              className="aspect-[4/5] max-w-sm"
              imageClassName="object-[center_18%]"
              sizes="(min-width: 1024px) 24vw, 80vw"
            />
            <p className="mt-4 font-serif text-[1.15rem] leading-none text-ink">{dict.about.founderName}</p>
            <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-stone">{dict.about.founderRole}</p>
          </Reveal>
          <Reveal delay={0.08} className="flex flex-col justify-end">
            <div className="border border-line bg-ivory p-6 sm:p-8">
              <p className="font-serif text-[1.65rem] leading-none text-ink">{dict.about.oliverName}</p>
              <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.18em] text-stone">{dict.about.oliverRole}</p>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone">{dict.about.oliverNote}</p>
            </div>
          </Reveal>
        </div>

        {!home ? (
          <>
            <ul className="mt-10 max-w-lg space-y-6">
              {dict.about.values.map((v) => (
                <li key={v.title} className="border-t border-line pt-4">
                  <p className="font-medium">{v.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone">{v.text}</p>
                </li>
              ))}
            </ul>
            <ButtonLink href={localizedPath(locale, "book")} className="mt-8 h-auto min-h-12 whitespace-normal px-6 py-3">
              {businessStatus === "PRELAUNCH" ? dict.mode.registerCta : dict.about.cta}
            </ButtonLink>
          </>
        ) : null}
      </div>
    </section>
  );
}
