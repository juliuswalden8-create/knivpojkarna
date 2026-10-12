import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { utcToISODate } from "@/lib/dates";
import { updateBookingStatus } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { getSettings } from "@/lib/site";
import {
  allowedBookingStatuses,
  BOOKING_STATUS_LABELS,
  canSetBookingStatus,
  normalizeBookingStatus,
} from "@/lib/inquiry-status";

export default async function BookingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [booking, settings] = await Promise.all([
    prisma.booking.findUnique({ where: { id }, include: { emails: { orderBy: { createdAt: "desc" }, take: 20 } } }),
    getSettings(),
  ]);
  if (!booking) notFound();
  const status = normalizeBookingStatus(booking.status);
  const statusOptions = allowedBookingStatuses(settings.businessStatus);
  const fullAddress = [booking.addressLine, booking.postalCode, booking.areaName].filter(Boolean).join(", ");

  return (
    <div className="max-w-3xl">
      <p className="kicker">{booking.reference}</p>
      <h1 className="mt-2 font-serif text-3xl">{booking.customerName}</h1>
      <p className="mt-2 text-sm text-stone">{formatDateTime(booking.createdAt)}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <a href={`tel:${booking.phone}`} className="border border-line bg-soft px-4 py-4 text-sm">
          <span className="kicker block">Phone</span>
          <span className="mt-1 block text-lg text-forest">{booking.phone}</span>
        </a>
        <a href={`mailto:${booking.email}`} className="border border-line bg-soft px-4 py-4 text-sm">
          <span className="kicker block">Email</span>
          <span className="mt-1 block break-all text-forest">{booking.email}</span>
        </a>
      </div>

      <div className="mt-3 border border-line bg-soft px-4 py-4 text-sm">
        <span className="kicker block">Pickup address</span>
        <p className="mt-2 text-lg leading-snug">{fullAddress || "—"}</p>
        {booking.pickupNotes ? <p className="mt-2 text-stone">{booking.pickupNotes}</p> : null}
        {!booking.inServiceArea ? <p className="mt-2 text-ember">Outside launch area — do not confirm pickup availability.</p> : null}
      </div>

      <dl className="mt-8 grid gap-3 border border-line p-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-stone">Package</dt>
          <dd>{booking.packageName}</dd>
        </div>
        <div>
          <dt className="text-stone">Knife quantity</dt>
          <dd>{booking.knifeCount}</dd>
        </div>
        <div>
          <dt className="text-stone">Price</dt>
          <dd>{formatPrice(booking.estimatedTotalCents)}</dd>
        </div>
        <div>
          <dt className="text-stone">Service</dt>
          <dd>Pickup & return delivery</dd>
        </div>
        <div>
          <dt className="text-stone">Requested pickup</dt>
          <dd>
            {booking.preferredDate ? utcToISODate(booking.preferredDate) : "—"}{" "}
            {booking.preferredTimeSlot || ""}
          </dd>
        </div>
        <div>
          <dt className="text-stone">Status</dt>
          <dd>{BOOKING_STATUS_LABELS[status]}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-stone">Customer comments</dt>
          <dd>{booking.comments || "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-stone">Internal notes</dt>
          <dd>{booking.adminNotes || "—"}</dd>
        </div>
      </dl>

      <form action={updateBookingStatus} className="mt-8 grid gap-4 border border-line p-5">
        <input type="hidden" name="id" value={booking.id} />
        {settings.businessStatus === "PRELAUNCH" && (
          <p className="text-sm text-stone">
            Site is in PRELAUNCH. Operational pickup stages cannot be activated until the mode is set to ACTIVE.
          </p>
        )}
        <label>
          <span className="kicker">Status</span>
          <select
            name="status"
            defaultValue={canSetBookingStatus(settings.businessStatus, status) ? status : "NEW"}
            className="field mt-2"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {BOOKING_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        {settings.businessStatus !== "PRELAUNCH" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="kicker">Confirmed pickup date</span>
              <input
                type="date"
                name="scheduledDate"
                defaultValue={booking.scheduledDate ? utcToISODate(booking.scheduledDate) : ""}
                className="field mt-2"
              />
            </label>
            <label>
              <span className="kicker">Confirmed slot</span>
              <input
                name="scheduledTimeSlot"
                defaultValue={booking.scheduledTimeSlot ?? ""}
                className="field mt-2"
              />
            </label>
          </div>
        )}
        <label>
          <span className="kicker">Internal notes</span>
          <textarea name="adminNotes" rows={4} defaultValue={booking.adminNotes ?? ""} className="field mt-2" />
        </label>
        <Button type="submit">Save booking</Button>
      </form>

      <div className="mt-8 border border-line p-5">
        <h2 className="font-serif text-xl">Email log</h2>
        <p className="mt-1 text-sm text-stone">Delivery outcomes only. Message bodies are not stored.</p>
        <ul className="mt-4 space-y-2 text-sm">
          {booking.emails.map((row) => (
            <li key={row.id} className="flex flex-wrap justify-between gap-2 border-t border-line pt-2">
              <span>
                {row.template} · {row.status}
                {row.errorName ? ` · ${row.errorName}` : ""}
              </span>
              <span className="text-stone">{formatDateTime(row.createdAt)}</span>
            </li>
          ))}
          {booking.emails.length === 0 && <li className="text-stone">No email attempts yet.</li>}
        </ul>
      </div>
    </div>
  );
}
