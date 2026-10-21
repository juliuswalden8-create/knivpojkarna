import { LOCALE_COOKIE, type Locale } from "@/i18n/config";

/** Persist the public locale. Kept outside the component so the cookie write is not a render mutation. */
export function writeLocaleCookie(next: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}
