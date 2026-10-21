"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import { localizedPath } from "@/i18n/routes";
import type { Locale } from "@/i18n/config";
import { Button } from "@/components/ui/button";

const KEY = "kp_cookie_consent";

type Consent = { necessary: true; analytics: boolean; at: string };

function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}

export function CookieBanner({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const reopen = () => {
      const current = readConsent();
      setAnalytics(current?.analytics ?? false);
      setOpen(true);
    };
    const timer = window.setTimeout(() => {
      const existing = readConsent();
      if (!existing) setOpen(true);
      else setAnalytics(existing.analytics);
    }, 0);
    window.addEventListener("kp:cookies", reopen);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("kp:cookies", reopen);
    };
  }, []);

  function save(next: boolean) {
    const value: Consent = { necessary: true, analytics: next, at: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(value));
    setAnalytics(next);
    setOpen(false);
    window.dispatchEvent(new Event("kp:analytics"));
  }

  if (!open) return null;

  return (
    <div className="max-h-[45dvh] shrink-0 overflow-y-auto border-t border-line bg-ivory p-4 sm:p-5">
      <div className="mx-auto max-w-2xl border border-line bg-soft p-5 sm:p-6">
        <p className="kicker">{dict.cookie.title}</p>
        <p className="mt-3 text-sm leading-relaxed text-stone">{dict.cookie.text}</p>
        <label className="mt-4 flex items-start gap-3 text-sm">
          <input type="checkbox" checked disabled className="mt-1 accent-forest" />
          <span>
            <strong className="font-medium">{dict.cookie.necessary.label}</strong> — {dict.cookie.necessary.text}
          </span>
        </label>
        <label className="mt-2 flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={analytics}
            onChange={(e) => setAnalytics(e.target.checked)}
            className="mt-1 accent-forest"
          />
          <span>
            <strong className="font-medium">{dict.cookie.analytics.label}</strong> — {dict.cookie.analytics.text}
          </span>
        </label>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button size="sm" onClick={() => save(true)}>
            {dict.cookie.acceptAll}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => save(false)}>
            {dict.cookie.necessaryOnly}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => save(analytics)}>
            {dict.cookie.save}
          </Button>
          <Link href={localizedPath(locale, "privacy")} className="text-xs text-stone hover:text-ink">
            {dict.cookie.learnMore}
          </Link>
        </div>
      </div>
    </div>
  );
}
