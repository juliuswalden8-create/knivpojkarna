export const BUSINESS_STATUSES = ["PRELAUNCH", "ACTIVE", "PAUSED"] as const;
export type BusinessStatus = (typeof BUSINESS_STATUSES)[number];

export function parseBusinessStatus(value: string | null | undefined): BusinessStatus {
  if (value === "ACTIVE" || value === "PAUSED" || value === "PRELAUNCH") return value;
  return "PRELAUNCH";
}

export function acceptsPublicRequests(status: BusinessStatus) {
  return status === "PRELAUNCH" || status === "ACTIVE";
}
