import { fromISODate, toISODate } from "./utils";

export function parseWeekdays(value: string): number[] {
  return value
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => n >= 0 && n <= 6);
}

export function parseTimeSlots(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export type Availability = {
  openWeekdays: number[];
  timeSlots: string[];
  leadTimeDays: number;
  bookingWindowDays: number;
  blocked: string[]; // YYYY-MM-DD
};

/** Local-time weekday of a YYYY-MM-DD date (0 = Sunday). */
export function weekdayOfISO(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

export function isDateAvailable(iso: string, availability: Availability) {
  const today = toISODate(new Date());
  if (iso < today) return false;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + availability.leadTimeDays);
  if (iso < toISODate(start)) return false;
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + availability.bookingWindowDays);
  if (iso > toISODate(end)) return false;
  if (!availability.openWeekdays.includes(weekdayOfISO(iso))) return false;
  if (availability.blocked.includes(iso)) return false;
  return true;
}

export function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startWeekday = (first.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ iso: string; inMonth: boolean; date: number } | null> = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = toISODate(new Date(year, month, d));
    cells.push({ iso, inMonth: true, date: d });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** Normalise a Date stored at UTC midnight to YYYY-MM-DD. */
export function utcToISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export { fromISODate, toISODate };
