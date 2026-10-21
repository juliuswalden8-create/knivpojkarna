import { emailTemplateForStatus, normalizeBookingStatus } from "@/lib/inquiry-status";

export type EmailDeliveryRecord = {
  template: string;
  status: string;
  errorName?: string | null;
};

export type ConfirmationSchedule = {
  scheduledDate: Date | null;
  scheduledTimeSlot: string | null;
  scheduledReturnDate: Date | null;
  scheduledReturnTimeSlot: string | null;
};

const DETAIL_GATED = new Set(["pickup_confirmed", "return_arranged"]);

function sameInstant(left: Date | null, right: Date | null) {
  if (!left && !right) return true;
  if (!left || !right) return false;
  return left.getTime() === right.getTime();
}

/** Only the facts that belong in that confirmation count. Notes and the other visit do not. */
export function confirmationDetailsChanged(
  template: "pickup_confirmed" | "return_arranged",
  before: ConfirmationSchedule,
  after: ConfirmationSchedule,
) {
  if (template === "pickup_confirmed") {
    return (
      !sameInstant(before.scheduledDate, after.scheduledDate) ||
      (before.scheduledTimeSlot ?? "").trim() !== (after.scheduledTimeSlot ?? "").trim()
    );
  }
  return (
    !sameInstant(before.scheduledReturnDate, after.scheduledReturnDate) ||
    (before.scheduledReturnTimeSlot ?? "").trim() !== (after.scheduledReturnTimeSlot ?? "").trim()
  );
}

/**
 * Pickup and return wait until the required details exist.
 * A later save sends that confirmation once. A SENT record blocks another copy.
 * FAILED and not_configured can be retried. A missing-details skip is retried only once the details exist.
 * Other customer emails still send only when the status changes.
 */
export function shouldAttemptCustomerEmail(input: {
  previousStatus: string;
  nextStatus: string;
  factsComplete: boolean;
  relevantDetailsChanged: boolean;
  logs: EmailDeliveryRecord[];
}) {
  const template = emailTemplateForStatus(input.nextStatus);
  if (!template) return null;

  const statusChanged = normalizeBookingStatus(input.previousStatus) !== normalizeBookingStatus(input.nextStatus);
  if (!DETAIL_GATED.has(template)) return statusChanged ? template : null;

  const history = input.logs.filter((log) => log.template === template);
  if (history.some((log) => log.status === "SENT")) return null;

  if (!input.factsComplete) return statusChanged ? template : null;
  if (statusChanged) return template;

  const last = history.at(-1);
  if (!last) return input.relevantDetailsChanged ? template : null;
  if (last.status === "FAILED") return template;
  if (last.status === "SKIPPED" && last.errorName === "missing_details") return template;
  if (last.status === "SKIPPED" && last.errorName === "not_configured") return template;
  return null;
}
