import type { Metadata } from "next";
import { resolveLocale } from "@/i18n/locale";
import { localizedPath } from "@/i18n/routes";
import { getSettings, siteUrl } from "@/lib/site";
import { QuoteForm } from "@/components/business/quote-form";
import { EditorialPhoto } from "@/components/media/editorial-photo";
import { ButtonLink } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, dict } = await resolveLocale(params);
  return {
    title: dict.meta.business.title,
    description: dict.meta.business.description,
    alternates: { canonical: `${siteUrl()}${localizedPath(locale, "business")}` },
  };
}

export default async function BusinessPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, dict } = await resolveLocale(params);
  const settings = await getSettings();
  const paused = settings.businessStatus === "PAUSED";
  const prelaunch = settings.businessStatus === "PRELAUNCH";

  return (
    <>
      <section className="container-x grid items-end gap-12 py-16 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-6">
          <p className="kicker">{dict.business.kicker}</p>
          <h1 className="display mt-4 text-[2.4rem] sm:text-5xl lg:text-[3.2rem]">{dict.business.title}</h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-stone">{dict.business.sub}</p>
          <ButtonLink href="#quote" className="mt-8">
            {dict.business.formSubmit}
          </ButtonLink>
        </div>
        <EditorialPhoto
          src="/images/business-kitchen.jpg"
          alt={dict.business.imageAlt}
          caption={dict.hero.photoCredit}
          className="aspect-[4/3] lg:col-span-5 lg:col-start-8"
        />
      </section>

      <section className="border-t border-line bg-soft">
        <div className="container-x py-16 lg:py-20">
          <p className="kicker">{dict.business.benefitsKicker}</p>
          <h2 className="display mt-3 max-w-xl text-3xl sm:text-4xl">{dict.business.benefitsTitle}</h2>
          <dl className="mt-10 max-w-3xl divide-y divide-line">
            {dict.business.benefits.map((item) => (
              <div key={item.title} className="grid gap-2 py-5 sm:grid-cols-[13rem_1fr] sm:items-baseline">
                <dt className="font-medium">{item.title}</dt>
                <dd className="text-[15px] leading-relaxed text-stone">{item.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="quote" className="border-t border-line bg-ivory">
        <div className="container-x py-16 lg:py-28">
          <header>
            <p className="kicker">{dict.business.formKicker}</p>
            <h2 className="display mt-5 max-w-3xl text-[2.35rem] sm:text-5xl lg:text-[3.15rem]">{dict.business.formTitle}</h2>
            <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-stone sm:text-[17px]">{dict.business.formText}</p>
          </header>

          <ul className="mt-10 divide-y divide-line border-y border-line text-[14px] text-ink md:flex md:flex-wrap md:gap-x-8 md:divide-y-0 md:py-5">
            {dict.business.forList.map((item) => (
              <li key={item} className="py-3 md:py-0">
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-12 max-w-3xl lg:mt-16">
            <p className="mb-10 max-w-2xl text-[14px] leading-relaxed text-stone">
              {paused ? dict.mode.pausedText : prelaunch ? dict.mode.bookingIntro : dict.business.formNote}
            </p>
            {paused ? null : <QuoteForm locale={locale} dict={dict} businessStatus={settings.businessStatus} />}
          </div>
        </div>
      </section>
    </>
  );
}
