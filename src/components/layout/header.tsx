"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/routes";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { LanguageSwitcher } from "./language-switcher";

export function Header({
  locale,
  dict,
  bookLabel,
}: {
  locale: Locale;
  dict: Dictionary;
  bookLabel?: string;
}) {
  const cta = bookLabel ?? dict.nav.book;
  const pathname = usePathname();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const open = menuPath === pathname;

  useEffect(() => {
    const scroller = document.querySelector("[data-scroll-root]");
    if (!(scroller instanceof HTMLElement)) return;
    scroller.style.overflow = open ? "hidden" : "";
    return () => {
      scroller.style.overflow = "";
    };
  }, [open]);

  const links = [
    { href: `${localizedPath(locale, "home")}#how`, label: dict.nav.howItWorks },
    { href: localizedPath(locale, "prices"), label: dict.nav.prices },
    { href: localizedPath(locale, "business"), label: dict.nav.business },
    { href: localizedPath(locale, "areas"), label: dict.nav.areas },
    { href: localizedPath(locale, "about"), label: dict.nav.about },
  ];

  return (
    <header className="z-50 shrink-0 border-b border-line bg-ivory/95 backdrop-blur-sm">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-forest focus:px-3 focus:py-2 focus:text-soft"
      >
        {dict.nav.skip}
      </a>
      <div className="container-x flex min-h-16 items-center justify-between gap-4 sm:min-h-[4.5rem]">
        <Link href={localizedPath(locale, "home")} className="relative z-10 shrink-0" aria-label="BladeBud">
          <Logo variant="header" />
        </Link>
        <nav className="hidden items-center gap-6 xl:flex" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-[13px] text-stone transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-4 xl:flex">
          <LanguageSwitcher locale={locale} />
          <ButtonLink
            href={localizedPath(locale, "book")}
            size="sm"
            className="h-auto min-h-10 whitespace-normal px-4 py-2 text-center leading-snug"
          >
            {cta}
          </ButtonLink>
        </div>
        <button
          type="button"
          className="relative z-10 inline-flex h-11 w-11 items-center justify-center text-ink xl:hidden"
          aria-expanded={open}
          aria-label={open ? dict.nav.close : dict.nav.menu}
          onClick={() => setMenuPath(open ? null : pathname)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className={cn("fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-ivory sm:top-[4.5rem] xl:hidden", open ? "block" : "hidden")}>
        <nav className="container-x flex min-h-full flex-col py-8" aria-label="Mobile">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="border-b border-line py-4 font-serif text-3xl text-ink"
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-8 flex flex-col gap-6">
            <LanguageSwitcher locale={locale} />
            <ButtonLink
              href={localizedPath(locale, "book")}
              size="lg"
              className="h-auto min-h-12 w-full whitespace-normal px-6 py-3 text-center leading-snug"
            >
              {cta}
            </ButtonLink>
          </div>
        </nav>
      </div>
    </header>
  );
}
