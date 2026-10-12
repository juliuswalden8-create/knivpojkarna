import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { utcToISODate } from "@/lib/dates";
import { getSettings } from "@/lib/site";
import { InquiryFilters } from "@/components/admin/inquiry-filters";
import { parseInquiryFilters, bookingWhere, bookingOrderBy } from "@/lib/admin-query";
import { BOOKING_STATUSES, BOOKING_STATUS_LABELS, normalizeBookingStatus } from "@/lib/inquiry-status";

export const metadata = { title: "Household inquiries | KNIVPOJKARNA", robots: { index: false } };

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; from?: string; to?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const filters = parseInquiryFilters(params);
  const [bookings, settings] = await Promise.all([
    prisma.booking.findMany({
      where: bookingWhere(filters),
      orderBy: bookingOrderBy(filters.sort),
      take: 200,
    }),
    getSettings(),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Household inquiries</h1>
          <p className="mt-1 text-sm text-stone">
            {settings.businessStatus === "PRELAUNCH"
              ? "Pre-launch interest only. Do not treat these as confirmed appointments."
              : "Requests are not appointments until you confirm pickup."}
          </p>
          {settings.pickupFeeCents == null ? (
            <p className="mt-2 text-sm text-ember">Pickup/return fee is not configured. Do not tell customers the service is free.</p>
          ) : null}
        </div>
        <Link href="/admin/export?type=bookings" className="text-xs uppercase tracking-[0.14em] text-forest">
          Export CSV
        </Link>
      </div>
      <InquiryFilters
        action="/admin/bookings"
        values={filters}
        statusOptions={BOOKING_STATUSES.map((status) => ({ value: status, label: BOOKING_STATUS_LABELS[status] }))}
        sortOptions={[
          { value: "newest", label: "Newest" },
          { value: "oldest", label: "Oldest" },
          { value: "status", label: "Status" },
          { value: "town", label: "Town" },
        ]}
      />
      <div className="mt-6 overflow-x-auto border border-line">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="text-[11px] uppercase tracking-[0.14em] text-stone">
            <tr>
              <th className="px-4 py-2">Ref</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Address</th>
              <th className="px-4 py-2">Package</th>
              <th className="px-4 py-2">Pickup</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Price</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const status = normalizeBookingStatus(b.status);
              return (
                <tr key={b.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <Link href={`/admin/bookings/${b.id}`} className="text-forest">
                      {b.reference}
                    </Link>
                    <span className="mt-1 block text-[11px] text-stone">{formatDateTime(b.createdAt)}</span>
                  </td>
                  <td className="px-4 py-3">
                    {b.customerName}
                    <a href={`tel:${b.phone}`} className="mt-1 block text-sm text-forest">
                      {b.phone}
                    </a>
                    <a href={`mailto:${b.email}`} className="block text-xs text-stone">
                      {b.email}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block">{b.addressLine || "—"}</span>
                    <span className="block text-xs text-stone">
                      {[b.postalCode, b.areaName].filter(Boolean).join(" · ")}
                      {b.inServiceArea ? "" : " · outside area"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {b.packageName}
                    <span className="block text-xs text-stone">{b.knifeCount} knives</span>
                  </td>
                  <td className="px-4 py-3">
                    {b.preferredDate ? (
                      <>
                        {utcToISODate(b.preferredDate)}
                        {b.preferredTimeSlot ? <span className="block text-xs text-stone">{b.preferredTimeSlot}</span> : null}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">{BOOKING_STATUS_LABELS[status]}</td>
                  <td className="px-4 py-3">{formatPrice(b.estimatedTotalCents)}</td>
                </tr>
              );
            })}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-stone">
                  No matching inquiries.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
