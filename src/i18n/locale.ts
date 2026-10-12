import { notFound } from "next/navigation";
import { defaultLocale, isEnabledLocale, type Locale } from "./config";
import { getDictionary, type Dictionary } from "./dictionaries";

export async function resolveLocale(params: Promise<{ locale: string }>): Promise<{
  locale: Locale;
  dict: Dictionary;
}> {
  const { locale } = await params;
  if (!isEnabledLocale(locale)) notFound();
  return { locale, dict: getDictionary(locale) };
}

export function localeFromUnknown(value: string | undefined | null): Locale {
  return isEnabledLocale(value) ? value : defaultLocale;
}
