"use client";

import { usePathname, useRouter } from "next/navigation";
import { enabledLocales, localeNames, type Locale } from "@/i18n/config";
import { writeLocaleCookie } from "@/i18n/locale-cookie";
import { switchLocalePath } from "@/i18n/routes";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ locale, className }: { locale: Locale; className?: string }) {
  const pathname = usePathname() || `/${locale}`;
  const router = useRouter();

  function switchTo(next: Locale) {
    writeLocaleCookie(next);
    router.push(switchLocalePath(pathname, locale, next));
  }

  return (
    <div className={cn("flex items-center gap-3 text-[12px]", className)} role="group" aria-label="Language">
      {enabledLocales.map((code, i) => (
        <span key={code} className="flex items-center gap-3">
          {i > 0 && <span className="text-line">/</span>}
          <button
            type="button"
            onClick={() => switchTo(code)}
            className={cn("uppercase tracking-[0.12em]", code === locale ? "text-ink" : "text-stone hover:text-ink")}
            aria-pressed={code === locale}
          >
            {code}
            <span className="sr-only"> {localeNames[code]}</span>
          </button>
        </span>
      ))}
    </div>
  );
}
