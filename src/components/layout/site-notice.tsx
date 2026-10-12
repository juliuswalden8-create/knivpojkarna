import type { Dictionary } from "@/i18n/dictionaries";
import type { BusinessStatus } from "@/lib/business-status";

export function SiteNotice({ status, dict }: { status: BusinessStatus; dict: Dictionary }) {
  if (status === "ACTIVE") return null;
  const text = status === "PAUSED" ? dict.mode.pausedBanner : dict.mode.prelaunchBanner;
  return (
    <div className="border-b border-line bg-soft">
      <p className="container-x py-3 text-[13px] leading-relaxed text-ink">{text}</p>
    </div>
  );
}
