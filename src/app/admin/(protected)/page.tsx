import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { getSettings } from "@/lib/site";
import { ACTIVE_JOB_STATUSES, BOOKING_STATUS_LABELS, normalizeBookingStatus } from "@/lib/inquiry-status";

export const metadata = { title: "Dashboard | BladeBud", robots: { index: false } };

export default async function AdminHome() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [settings, newBookings, confirmed, completedMonth, inquiries, recent] = await Promise.all([
    getSettings(),
    prisma.booking.count({ where: { status: "NEW" } }),
    prisma.booking.count({ where: { status: { in: [...ACTIVE_JOB_STATUSES] } } }),
    prisma.booking.findMany({
      where: { status: "COMPLETED", updatedAt: { gte: monthStart } },
      select: { estimatedTotalCents: true },
    }),
    prisma.businessInquiry.count({ where: { status: "NEW" } }),
    prisma.booking.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);
  const revenue = completedMonth.reduce((sum, b) => sum + b.estimatedTotalCents, 0);

  return (
    <div>
      <h1 className="font-serif text-3xl">Overview</h1>
      <p className="mt-1 text-sm text-stone">Incoming requests and estimated completed revenue this month.</p>
      <p className="mt-4 border border-line bg-soft px-4 py-3 text-sm">
        Site mode: <strong>{settings.businessStatus}</strong>
        {" · "}
        <Link href="/admin/settings" className="text-forest">
          Change in Settings
        </Link>
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="New household inquiries" value={String(newBookings)} href="/admin/bookings" />
        <Stat label="Active jobs" value={String(confirmed)} href="/admin/bookings" />
        <Stat label="New business inquiries" value={String(inquiries)} href="/admin/inquiries" />
        <Stat label="Est. revenue this month" value={formatPrice(revenue)} href="/admin/bookings" />
      </div>
      <div className="mt-10 overflow-hidden border border-line">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.16em]">Latest bookings</h2>
          <Link href="/admin/export" className="text-xs uppercase tracking-[0.14em] text-forest">
            Export CSV
          </Link>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="text-[11px] uppercase tracking-[0.14em] text-stone">
            <tr>
              <th className="px-4 py-2">Ref</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Estimate</th>
              <th className="px-4 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((b) => (
              <tr key={b.id} className="border-t border-line hover:bg-soft">
                <td className="px-4 py-3">
                  <Link href={`/admin/bookings/${b.id}`} className="text-forest">
                    {b.reference}
                  </Link>
                </td>
                <td className="px-4 py-3">{b.customerName}</td>
                <td className="px-4 py-3">{BOOKING_STATUS_LABELS[normalizeBookingStatus(b.status)]}</td>
                <td className="px-4 py-3">{formatPrice(b.estimatedTotalCents)}</td>
                <td className="px-4 py-3 text-stone">{formatDateTime(b.createdAt)}</td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-stone">
                  No bookings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link href={href} className="border border-line bg-soft p-5 hover:border-ink">
      <p className="text-[11px] uppercase tracking-[0.16em] text-stone">{label}</p>
      <p className="mt-2 font-serif text-3xl">{value}</p>
    </Link>
  );
}
