/**
 * Shared pricing helpers used by both the booking UI (client) and the
 * server action that stores bookings. Keep this file free of server-only code.
 */

export type PublicPackage = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  knifeCount: number;
  features: string[];
  highlighted: boolean;
};

export type KnifeTypes = {
  standard: number;
  serrated: number;
  specialty: number;
  damaged: boolean;
};

export function totalKnives(types: KnifeTypes) {
  return types.standard + types.serrated + types.specialty;
}

export function perKnifeCents(pkg: { priceCents: number; knifeCount: number }) {
  return Math.round(pkg.priceCents / pkg.knifeCount);
}

/** Savings compared to paying the single-knife price for every knife. */
export function savingsCents(pkg: { priceCents: number; knifeCount: number }, singlePriceCents: number) {
  return Math.max(0, pkg.knifeCount * singlePriceCents - pkg.priceCents);
}

/**
 * Estimated total = package price + extra knives (beyond those included) at the
 * single-knife price. Specialty/damaged surcharges and delivery are confirmed
 * manually and are intentionally not part of the estimate.
 */
export function estimateTotalCents(pkg: { priceCents: number; knifeCount: number }, knives: number, extraKnifePriceCents: number) {
  const extra = Math.max(0, knives - pkg.knifeCount);
  return pkg.priceCents + extra * extraKnifePriceCents;
}

/** Pick the cheapest package that covers the given number of knives (or the largest). */
export function suggestPackage(packages: PublicPackage[], knives: number) {
  const sorted = [...packages].sort((a, b) => a.knifeCount - b.knifeCount);
  return sorted.find((p) => p.knifeCount >= knives) ?? sorted[sorted.length - 1];
}
