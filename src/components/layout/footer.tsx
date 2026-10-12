import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/routes";
import { WordmarkLockup } from "@/components/brand/logo";
import { CookieSettingsButton } from "./cookie-settings-button";
import { whatsappLink } from "@/lib/site";
import type { BusinessStatus } from "@/lib/business-status";

export function Footer({
  locale,
  dict,
  whatsappNumber,
  contactEmail,
  instagramUrl,
  businessStatus,
}: {
  locale: Locale;
  dict: Dictionary;
  whatsappNumber: string;
  contactEmail: string;
  instagramUrl: string;
  businessStatus: BusinessStatus;
}) {
  const wa = whatsappLink(whatsappNumber, dict.whatsapp.message);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-soft">
      <div className="container-x grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link href={localizedPath(locale, "home")} aria-label="KNIVPOJKARNA" className="inline-flex">
            <WordmarkLockup />
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-stone">
            {dict.footer.location}
            <br />
            {dict.footer.seoLine}
          </p>
        </div>
        <div>
          <p className="kicker">{dict.footer.servicesTitle}</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href={localizedPath(locale, "book")} className="hover:text-forest">
                {businessStatus === "PRELAUNCH" ? dict.mode.registerCta : dict.nav.book}
              </Link>
            </li>
            <li>
              <Link href={localizedPath(locale, "prices")} className="hover:text-forest">
                {dict.nav.prices}
              </Link>
            </li>
            <li>
              <Link href={localizedPath(locale, "business")} className="hover:text-forest">
                {dict.nav.business}
              </Link>
            </li>
            <li>
              <Link href={localizedPath(locale, "areas")} className="hover:text-forest">
                {dict.nav.areas}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="kicker">{dict.footer.companyTitle}</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href={localizedPath(locale, "about")} className="hover:text-forest">
                {dict.nav.about}
              </Link>
            </li>
            {wa && (
              <li>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="hover:text-forest">
                  {dict.footer.whatsapp}
                </a>
              </li>
            )}
            {contactEmail && (
              <li>
                <a href={`mailto:${contactEmail}`} className="hover:text-forest">
                  {dict.footer.email}
                </a>
              </li>
            )}
            {instagramUrl && (
              <li>
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-forest">
                  Instagram
                </a>
              </li>
            )}
          </ul>
        </div>
        <div>
          <p className="kicker">{dict.footer.legalTitle}</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href={localizedPath(locale, "privacy")} className="hover:text-forest">
                {dict.footer.privacy}
              </Link>
            </li>
            <li>
              <CookieSettingsButton label={dict.footer.cookieSettings} className="hover:text-forest" />
            </li>
            <li>
              <Link href="/admin/login" className="text-stone hover:text-ink">
                {dict.footer.admin}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="container-x flex flex-col gap-2 border-t border-line py-6 text-xs text-stone sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} KNIVPOJKARNA UF. {dict.footer.rights}
        </p>
        <p>KNIVPOJKARNA UF — We Bring Back the Edge.</p>
      </div>
    </footer>
  );
}
