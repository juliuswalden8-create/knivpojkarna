import type { Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/routes";
import { siteUrl } from "@/lib/site";
import { LAUNCH_SERVICE_AREAS } from "@/lib/launch-areas";

export function JsonLd({
  locale,
  description,
}: {
  locale: Locale;
  description: string;
}) {
  const url = siteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "KNIVPOJKARNA UF",
    alternateName: "KNIVPOJKARNA",
    slogan: "We Bring Back the Edge.",
    description,
    url: `${url}${localizedPath(locale, "home")}`,
    image: `${url}/og.png`,
    priceRange: "€7-€49",
    areaServed: LAUNCH_SERVICE_AREAS.map((area) => ({ "@type": "City", name: area.name })),
    knowsLanguage: ["en", "es"],
    serviceType: "Professional knife sharpening",
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
