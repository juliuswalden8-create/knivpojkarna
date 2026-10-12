"use client";

export function CookieSettingsButton({ label, className }: { label: string; className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event("kp:cookies"))}>
      {label}
    </button>
  );
}
