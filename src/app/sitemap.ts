import type { MetadataRoute } from "next";
import { enabledLocales } from "@/i18n/config";
import { localizedPath, type RouteKey } from "@/i18n/routes";
import { publicLanguageAlternates } from "@/lib/page-meta";
import { siteUrl } from "@/lib/site";

const keys: RouteKey[] = ["home", "book", "prices", "business", "areas", "about", "privacy"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return enabledLocales.flatMap((locale) =>
    keys.map((key) => ({
      url: `${base}${localizedPath(locale, key)}`,
      lastModified: new Date(),
      changeFrequency: key === "home" || key === "book" ? "weekly" : "monthly",
      priority: key === "home" ? 1 : key === "book" || key === "prices" ? 0.9 : 0.7,
      alternates: {
        languages: publicLanguageAlternates(base, key),
      },
    })),
  );
}
