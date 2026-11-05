export const BUSINESS_STATUSES = ["PRELAUNCH", "ACTIVE", "PAUSED"] as const;
export type BusinessStatus = (typeof BUSINESS_STATUSES)[number];

export function parseBusinessStatus(value: string | null | undefined): BusinessStatus {
  if (value === "ACTIVE" || value === "PAUSED" || value === "PRELAUNCH") return value;
  return "PRELAUNCH";
}

/**
 * Preview-only override so Stripe Checkout can be tested without flipping
 * production SiteSettings.businessStatus away from PRELAUNCH.
 *
 * Active only when ALL of:
 * - VERCEL_ENV === "preview" (never production / development)
 * - PREVIEW_FORCE_BUSINESS_STATUS is a known status (typically ACTIVE)
 *
 * Production ignores this variable even if it is somehow set.
 */
export function resolveBusinessStatus(
  stored: string | null | undefined,
  env: NodeJS.ProcessEnv = process.env,
): BusinessStatus {
  const parsed = parseBusinessStatus(stored);
  if (env.VERCEL_ENV !== "preview") return parsed;
  const forced = env.PREVIEW_FORCE_BUSINESS_STATUS?.trim();
  if (forced === "ACTIVE" || forced === "PAUSED" || forced === "PRELAUNCH") return forced;
  return parsed;
}

export function acceptsPublicRequests(status: BusinessStatus) {
  return status === "PRELAUNCH" || status === "ACTIVE";
}
