/** The previous public Vercel hostname. Preview hosts must not match this. */
export const LEGACY_VERCEL_HOST = "knivpojkarna.vercel.app";

export const BLADEBUD_ORIGIN = "https://www.bladebud.com";

function hostnameOf(hostHeader: string | null) {
  return (hostHeader ?? "").trim().toLowerCase().replace(/:\d+$/, "");
}

/**
 * Permanent move from the old project hostname only.
 * Paths and query strings stay. BladeBud and every other host are left alone.
 */
export function legacyHostRedirect(hostHeader: string | null, pathname: string, search = "") {
  if (hostnameOf(hostHeader) !== LEGACY_VERCEL_HOST) return null;
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const query = search ? (search.startsWith("?") ? search : `?${search}`) : "";
  return `${BLADEBUD_ORIGIN}${path}${query}`;
}

export function legacyHostRedirectRules() {
  const has = [{ type: "host" as const, value: LEGACY_VERCEL_HOST }];
  return [
    {
      source: "/",
      has,
      destination: `${BLADEBUD_ORIGIN}/`,
      statusCode: 308 as const,
    },
    {
      source: "/:path*",
      has,
      destination: `${BLADEBUD_ORIGIN}/:path*`,
      statusCode: 308 as const,
    },
  ];
}
