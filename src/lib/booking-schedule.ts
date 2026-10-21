import { fromISODate } from "@/lib/utils";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const WINDOW_MAX = 40;

export type ScheduleInput = {
  prelaunch: boolean;
  pickupDate: string;
  pickupWindow: string;
  returnDate: string;
  returnWindow: string;
  existing?: ScheduleFields;
};

export type ScheduleFields = {
  scheduledDate: Date | null;
  scheduledTimeSlot: string | null;
  scheduledReturnDate: Date | null;
  scheduledReturnTimeSlot: string | null;
};

function dateOrNull(value: string): Date | null {
  const trimmed = value.trim();
  return ISO_DATE.test(trimmed) ? fromISODate(trimmed) : null;
}

function windowOrNull(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, WINDOW_MAX);
}

/**
 * Pickup and return are written from their own fields.
 * A return date never replaces the pickup date.
 * PRELAUNCH ignores submitted dates. An empty or unrelated save keeps the stored schedule.
 */
export function scheduleFields(input: ScheduleInput): ScheduleFields {
  if (input.prelaunch) {
    return {
      scheduledDate: input.existing?.scheduledDate ?? null,
      scheduledTimeSlot: input.existing?.scheduledTimeSlot ?? null,
      scheduledReturnDate: input.existing?.scheduledReturnDate ?? null,
      scheduledReturnTimeSlot: input.existing?.scheduledReturnTimeSlot ?? null,
    };
  }
  return {
    scheduledDate: dateOrNull(input.pickupDate),
    scheduledTimeSlot: windowOrNull(input.pickupWindow),
    scheduledReturnDate: dateOrNull(input.returnDate),
    scheduledReturnTimeSlot: windowOrNull(input.returnWindow),
  };
}
