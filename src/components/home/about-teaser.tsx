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
}: {
  locale: Locale;
  dict: Dictionary;
  businessStatus: BusinessStatus;
}) {
  return (
    <section id="about" className="border-t border-line bg-soft">
      <div className="container-x grid items-end gap-12 py-20 lg:grid-cols-12 lg:py-28">
        <Reveal className="lg:col-span-6 lg:col-start-1">
          <p className="kicker">{dict.about.kicker}</p>
          <h2 className="display mt-4 text-[2rem] sm:text-4xl lg:text-[2.8rem]">{dict.about.title}</h2>
          <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-stone sm:text-[17px]">{dict.about.body}</p>
          <ul className="mt-10 max-w-lg space-y-6">
            {dict.about.values.map((v) => (
              <li key={v.title} className="border-t border-line pt-4">
                <p className="font-medium">{v.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-stone">{v.text}</p>
              </li>
            ))}
          </ul>
          <ButtonLink href={localizedPath(locale, "book")} className="mt-10">
            {businessStatus === "PRELAUNCH" ? dict.mode.registerCta : dict.about.cta}
          </ButtonLink>
        </Reveal>
        <Reveal delay={0.08} className="lg:col-span-5 lg:col-start-8">
          <EditorialPhoto
            src="/images/julius-walden.jpg"
            alt={dict.about.photoAlt}
            className="aspect-[4/5]"
            imageClassName="object-[center_18%]"
            sizes="(min-width: 1024px) 40vw, 100vw"
          />
          <p className="mt-4 font-serif text-[1.15rem] leading-none text-ink">{dict.about.founderName}</p>
          <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-stone">{dict.about.founderRole}</p>
        </Reveal>
      </div>
    </section>
  );
}
