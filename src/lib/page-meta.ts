import type { Metadata } from "next";
import { defaultLocale, enabledLocales, type Locale } from "@/i18n/config";
import { localizedPath, type RouteKey } from "@/i18n/routes";
import { siteUrl } from "@/lib/site";

/** EN/ES alternates plus x-default. Swedish stays out until it is in enabledLocales. */
export function publicLanguageAlternates(origin: string, key: RouteKey): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of enabledLocales) {
    languages[locale] = `${origin}${localizedPath(locale, key)}`;
  }
  languages["x-default"] = `${origin}${localizedPath(defaultLocale, key)}`;
  return languages;
}

/** The dictionary title is used exactly. The root title template must not add a second brand suffix. */
export function publicPageMeta(locale: string, key: RouteKey, title: string, description: string): Metadata {
  const origin = siteUrl();
  const canonical = `${origin}${localizedPath(locale as Locale, key)}`;
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical,
      languages: publicLanguageAlternates(origin, key),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: locale === "es" ? "es_ES" : "en_GB",
      type: "website",
      siteName: "BladeBud",
    },
  };
}
