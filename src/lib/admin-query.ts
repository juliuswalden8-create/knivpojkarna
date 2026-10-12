import { bookingStatusWhere } from "./inquiry-status";

export type InquiryFilters = {
  q?: string;
  status?: string;
  from?: string;
  to?: string;
  sort?: string;
};

function parseDay(value: string | undefined, endOfDay: boolean): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  return endOfDay
    ? new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999))
    : new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

export function parseInquiryFilters(input: {
  q?: string;
  status?: string;
  from?: string;
  to?: string;
  sort?: string;
}): InquiryFilters {
  return {
    q: input.q?.trim() || undefined,
    status: input.status?.trim() || undefined,
    from: input.from?.trim() || undefined,
    to: input.to?.trim() || undefined,
    sort: input.sort?.trim() || undefined,
  };
}

type StringFilter = { contains: string; mode: "insensitive" };

function searchOr(q: string, fields: string[]) {
  const clause: StringFilter = { contains: q, mode: "insensitive" };
  return fields.map((field) => ({ [field]: clause }));
}

export function bookingWhere(filters: InquiryFilters) {
  const AND: Record<string, unknown>[] = [];
  if (filters.status) AND.push({ status: bookingStatusWhere(filters.status) });
  const from = parseDay(filters.from, false);
  const to = parseDay(filters.to, true);
  if (from || to) {
    AND.push({ createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } });
  }
  if (filters.q) {
    AND.push({
      OR: searchOr(filters.q, ["customerName", "email", "phone", "reference", "addressLine", "areaName", "postalCode"]),
    });
  }
  return AND.length ? { AND } : {};
}

export function bookingOrderBy(sort?: string): { createdAt?: "asc" | "desc"; status?: "asc" | "desc"; areaName?: "asc" | "desc" } {
  if (sort === "oldest") return { createdAt: "asc" };
  if (sort === "status") return { status: "asc" };
  if (sort === "town") return { areaName: "asc" };
  return { createdAt: "desc" };
}

export function inquiryWhere(filters: InquiryFilters) {
  const AND: Record<string, unknown>[] = [];
  if (filters.status) AND.push({ status: filters.status });
  const from = parseDay(filters.from, false);
  const to = parseDay(filters.to, true);
  if (from || to) {
    AND.push({ createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } });
  }
  if (filters.q) {
    AND.push({
      OR: searchOr(filters.q, ["businessName", "contactName", "email", "phone", "reference"]),
    });
  }
  return AND.length ? { AND } : {};
}
