/**
 * Locale configuration.
 *
 * `locales` lists every locale the system knows about. `enabledLocales` lists
 * the ones that are publicly routable. To launch Swedish, complete
 * `src/i18n/dictionaries/sv.ts` and add "sv" to `enabledLocales`.
 */
export const locales = ["en", "es", "sv"] as const;
export type Locale = (typeof locales)[number];

export const enabledLocales: readonly Locale[] = ["en", "es"];
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  sv: "Svenska",
};

export const localeHtmlLang: Record<Locale, string> = {
  en: "en",
  es: "es",
  sv: "sv",
};

export const localeOgLocale: Record<Locale, string> = {
  en: "en_GB",
  es: "es_ES",
  sv: "sv_SE",
};

export function isEnabledLocale(value: string | undefined | null): value is Locale {
  return !!value && (enabledLocales as readonly string[]).includes(value);
}

export const LOCALE_COOKIE = "kp_lang";
