import type { Locale } from "../config";
import { en, type Dictionary } from "./en";
import { es } from "./es";
import { sv } from "./sv";

const dictionaries: Record<Locale, Dictionary> = { en, es, sv };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? en;
}

export type { Dictionary };
