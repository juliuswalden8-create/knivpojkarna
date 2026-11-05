/** Waitlist rows reuse the Booking table without inventing package/address data. */

export const WAITLIST_SERVICE_TYPE = "WAITLIST";

export const WAITLIST_PACKAGE_NAME = {
  en: "Waitlist interest",
  es: "Interés en lista de espera",
} as const;

export function isWaitlistBooking(booking: {
  serviceType?: string | null;
  knifeCount?: number | null;
  packageId?: string | null;
}) {
  if (booking.serviceType === WAITLIST_SERVICE_TYPE) return true;
  return booking.packageId == null && (booking.knifeCount ?? 0) === 0;
}

export function waitlistLockKey(contact: string, areaName: string) {
  return `waitlist:${JSON.stringify([contact.trim().toLowerCase(), areaName.trim().toLowerCase()])}`;
}
