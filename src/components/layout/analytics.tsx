"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";

const KEY = "kp_cookie_consent";

export function VercelAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => {
      try {
        const raw = localStorage.getItem(KEY);
        setEnabled(Boolean(raw && JSON.parse(raw).analytics));
      } catch {
        setEnabled(false);
      }
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("kp:analytics", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("kp:analytics", sync);
    };
  }, []);

  if (!enabled) return null;
  return <Analytics />;
}
