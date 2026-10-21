import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, isEnabledLocale, LOCALE_COOKIE } from "@/i18n/config";
import { routeKeyForSlug, routeSlugs } from "@/i18n/routes";
import { legacyHostRedirect } from "@/lib/legacy-host-redirect";

export function proxy(request: NextRequest) {
  const moved = legacyHostRedirect(request.headers.get("host"), request.nextUrl.pathname, request.nextUrl.search);
  if (moved) return NextResponse.redirect(moved, 308);

  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  if (!first) {
    const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
    const locale = isEnabledLocale(cookie) ? cookie : defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  if (!isEnabledLocale(first)) {
    return NextResponse.next();
  }

  const locale = first;
  const rest = segments.slice(1);
  const slug = rest[0] ?? "";
  const key = slug ? routeKeyForSlug(locale, slug) : "home";

  const headers = new Headers(request.headers);
  headers.set("x-locale", locale);

  const englishSlug = key ? routeSlugs[key][defaultLocale] : slug;
  const publicSlug = key ? routeSlugs[key][locale] : slug;
  const needsRewrite = Boolean(key) && publicSlug !== englishSlug;

  if (needsRewrite) {
    const tail = rest.slice(1).join("/");
    const rewritePath = `/${locale}${englishSlug ? `/${englishSlug}` : ""}${tail ? `/${tail}` : ""}`;
    const url = request.nextUrl.clone();
    url.pathname = rewritePath;
    return NextResponse.rewrite(url, { request: { headers } });
  }

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
