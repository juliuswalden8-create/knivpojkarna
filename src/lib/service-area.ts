import { resolveDeliveryLocation, type DeliveryLocation } from "./delivery-zones";

export const AREA_OTHER_IN_CORRIDOR = "__IN_CORRIDOR__";
export const AREA_OUTSIDE = "__OUTSIDE__";

export type ServiceAreaChoice = DeliveryLocation;

export function isListedLaunchTown(name: string) {
  const resolved = resolveDeliveryLocation({ areaName: name });
  return resolved.inServiceArea && !resolved.needsReview && resolved.zone !== "REVIEW";
}

/**
 * Towns on the launch list, or another neighborhood in the Marbella–Fuengirola
 * corridor, count as inside the service area. Explicit "outside" does not.
 * Unknown or boundary locations stay in-area but are flagged for review.
 */
export function resolveServiceArea(
  areaName: string,
  areaDetail?: string | null,
  extras?: { addressLine?: string | null; postalCode?: string | null },
): ServiceAreaChoice {
  return resolveDeliveryLocation({
    areaName,
    areaDetail,
    addressLine: extras?.addressLine,
    postalCode: extras?.postalCode,
  });
}

export function duplicateWindowMs() {
  return 2 * 60 * 1000;
}

export function isWithinDuplicateWindow(createdAt: Date, now = new Date(), windowMs = duplicateWindowMs()) {
  return now.getTime() - createdAt.getTime() < windowMs;
}
