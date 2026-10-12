import { defaultLocale, type Locale } from "./config";

/**
 * Localised URL slugs. The file-system route uses the English slug; the proxy
 * rewrites localised slugs to it, and `localizedPath` builds public URLs.
 */
export const routeSlugs = {
  home: { en: "", es: "", sv: "" },
  book: { en: "book", es: "reservar", sv: "boka" },
  prices: { en: "prices", es: "precios", sv: "priser" },
  business: { en: "business", es: "empresas", sv: "foretag" },
  areas: { en: "service-areas", es: "zonas-de-servicio", sv: "serviceomraden" },
  about: { en: "about", es: "sobre-nosotros", sv: "om-oss" },
  privacy: { en: "privacy", es: "privacidad", sv: "integritet" },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteKey = keyof typeof routeSlugs;

/** Public URL for a route in a given locale, e.g. localizedPath("es", "book") → "/es/reservar". */
export function localizedPath(locale: Locale, key: RouteKey, suffix: string = "") {
  const slug = routeSlugs[key][locale];
  return `/${locale}${slug ? `/${slug}` : ""}${suffix}`;
}

/** Internal (file-system) path for a route, always using English slugs. */
export function internalPath(locale: Locale, key: RouteKey, suffix: string = "") {
  const slug = routeSlugs[key][defaultLocale];
  return `/${locale}${slug ? `/${slug}` : ""}${suffix}`;
}

/** Find the route key whose slug matches `slug` in the given locale. */
export function routeKeyForSlug(locale: Locale, slug: string): RouteKey | null {
  for (const key of Object.keys(routeSlugs) as RouteKey[]) {
    if (routeSlugs[key][locale] === slug) return key;
  }
  return null;
}

/**
 * Translate a public pathname from one locale to another while keeping any
 * trailing segments (e.g. /es/reservar?x → /en/book?x handled by caller).
 */
export function switchLocalePath(pathname: string, from: Locale, to: Locale) {
  const prefix = `/${from}`;
  let rest = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : pathname;
  if (rest.startsWith("/")) rest = rest.slice(1);
  const [first = "", ...others] = rest.split("/");
  const key = routeKeyForSlug(from, first);
  const tail = others.length ? `/${others.join("/")}` : "";
  if (key) return localizedPath(to, key, tail);
  return `/${to}${rest ? `/${rest}` : ""}`;
}
