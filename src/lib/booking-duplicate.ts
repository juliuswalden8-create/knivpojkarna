import { duplicateWindowMs } from "./service-area";

export function bookingLockKey(email: string, packageId: string, addressLine: string) {
  return `booking:${JSON.stringify([email, packageId, addressLine])}`;
}

export function duplicateBookingWhere(email: string, packageId: string, addressLine: string, now: Date) {
  return {
    email,
    packageId,
    addressLine,
    createdAt: { gte: new Date(now.getTime() - duplicateWindowMs()) },
  };
}

export function decideBookingWrite<T>(existing: T | null): "reuse" | "create" {
  return existing ? "reuse" : "create";
}

/** Telegram is sent only for the row this request inserted. A reused duplicate stays quiet. */
export function shouldSendAdminNotice(created: boolean) {
  return created;
}
