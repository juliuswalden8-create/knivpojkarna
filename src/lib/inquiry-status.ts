import type { BusinessStatus } from "./business-status";

export const BOOKING_STATUSES = [
  "NEW",
  "CONTACTED",
  "PICKUP_CONFIRMED",
  "COLLECTED",
  "SHARPENING",
  "READY_FOR_RETURN",
  "RETURN_SCHEDULED",
  "COMPLETED",
  "CANCELLED",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

const LEGACY_STATUS_MAP: Record<string, BookingStatus> = {
  CONFIRMED: "PICKUP_CONFIRMED",
  IN_PROGRESS: "SHARPENING",
};

export const INQUIRY_STATUSES = ["NEW", "CONTACTED", "QUOTED", "WON", "CLOSED"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  PICKUP_CONFIRMED: "Pickup confirmed",
  COLLECTED: "Collected",
  SHARPENING: "Sharpening",
  READY_FOR_RETURN: "Ready for return",
  RETURN_SCHEDULED: "Return scheduled",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUOTED: "Quoted",
  WON: "Won",
  CLOSED: "Closed",
};

export function normalizeBookingStatus(value: string): BookingStatus {
  if ((BOOKING_STATUSES as readonly string[]).includes(value)) return value as BookingStatus;
  if (LEGACY_STATUS_MAP[value]) return LEGACY_STATUS_MAP[value];
  return "NEW";
}

export function isCanonicalBookingStatus(value: string): value is BookingStatus {
  return (BOOKING_STATUSES as readonly string[]).includes(value);
}

export function isInquiryStatus(value: string): value is InquiryStatus {
  return (INQUIRY_STATUSES as readonly string[]).includes(value);
}

/** PRELAUNCH: interest handling only. Operational pickup stages stay off. */
export function allowedBookingStatuses(mode: BusinessStatus): BookingStatus[] {
  if (mode === "PRELAUNCH") return ["NEW", "CONTACTED", "CANCELLED"];
  return [...BOOKING_STATUSES];
}

export function allowedInquiryStatuses(mode: BusinessStatus): InquiryStatus[] {
  if (mode === "PRELAUNCH") return ["NEW", "CONTACTED", "CLOSED"];
  return [...INQUIRY_STATUSES];
}

export function canSetBookingStatus(mode: BusinessStatus, status: string) {
  if (!isCanonicalBookingStatus(status)) return false;
  return allowedBookingStatuses(mode).includes(status);
}

export function canSetInquiryStatus(mode: BusinessStatus, status: string) {
  return allowedInquiryStatuses(mode).includes(status as InquiryStatus);
}

export function acceptsPublicRequests(status: BusinessStatus) {
  return status === "PRELAUNCH" || status === "ACTIVE";
}

export function emailTemplateForStatus(status: string): string | null {
  switch (normalizeBookingStatus(status)) {
    case "PICKUP_CONFIRMED":
      return "pickup_confirmed";
    case "COLLECTED":
      return "knives_collected";
    case "READY_FOR_RETURN":
      return "sharpening_completed";
    case "RETURN_SCHEDULED":
      return "return_arranged";
    case "COMPLETED":
      return "order_completed";
    default:
      return null;
  }
}

/** Template for a status change. Pickup and return retries are decided in email-delivery.ts. */
export function statusChangeEmail(previous: string, next: string) {
  const template = emailTemplateForStatus(next);
  if (!template || previous === next) return null;
  return template;
}

export function bookingStatusWhere(status: string) {
  const mapped = normalizeBookingStatus(status);
  if (mapped === "PICKUP_CONFIRMED") return { in: ["PICKUP_CONFIRMED", "CONFIRMED"] };
  if (mapped === "SHARPENING") return { in: ["SHARPENING", "IN_PROGRESS"] };
  return mapped;
}

export const ACTIVE_JOB_STATUSES = [
  "PICKUP_CONFIRMED",
  "COLLECTED",
  "SHARPENING",
  "READY_FOR_RETURN",
  "RETURN_SCHEDULED",
  "CONFIRMED",
  "IN_PROGRESS",
] as const;
