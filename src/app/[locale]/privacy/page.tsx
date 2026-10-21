import type { Metadata } from "next";
import { resolveLocale } from "@/i18n/locale";
import { publicPageMeta } from "@/lib/page-meta";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, dict } = await resolveLocale(params);
  return publicPageMeta(locale, "privacy", dict.meta.privacy.title, dict.meta.privacy.description);
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { dict } = await resolveLocale(params);
  return (
    <article className="container-x max-w-2xl py-16 sm:py-24">
      <h1 className="display text-4xl sm:text-5xl">{dict.privacy.title}</h1>
      <p className="mt-4 text-sm text-stone">
        {dict.privacy.updated}: 2026-10-09
      </p>
      {dict.privacy.sections.map((section) => (
        <section key={section.title} className="mt-10">
          <h2 className="font-serif text-2xl">{section.title}</h2>
          {section.body.map((p) => (
            <p key={p.slice(0, 40)} className="mt-3 text-[15px] leading-relaxed text-stone">
              {p}
            </p>
          ))}
        </section>
      ))}
    </article>
  );
}
