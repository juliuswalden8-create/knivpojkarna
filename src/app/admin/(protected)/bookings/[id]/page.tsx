import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { utcToISODate } from "@/lib/dates";
import { updateBookingStatus } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { getSettings } from "@/lib/site";
import { customerWhatsAppHref } from "@/lib/customer-whatsapp";
import { BookingPayments } from "@/components/admin/booking-payments";
import {
  allowedBookingStatuses,
  BOOKING_STATUS_LABELS,
  canSetBookingStatus,
  normalizeBookingStatus,
} from "@/lib/inquiry-status";
import { COLLECTORS, collectionQuantityWarning, MAX_KNIVES_COLLECTED } from "@/lib/knife-collection";

function ScheduleCard({
  title,
  date,
  timeWindow,
  address,
}: {
  title: string;
  date: Date | null;
  timeWindow: string | null;
  address: string;
}) {
  return (
    <div className="border border-line bg-soft px-4 py-4 text-sm">
      <span className="kicker block">{title}</span>
      <p className="mt-2 text-lg">{date ? utcToISODate(date) : "Not scheduled"}</p>
      <p className="mt-1 text-stone">{timeWindow || "No time window"}</p>
      <p className="mt-3 leading-snug">{address || "—"}</p>
    </div>
  );
}

function ScheduleEditor({
  title,
  address,
  dateName,
  dateValue,
  windowName,
  windowValue,
}: {
  title: string;
  address: string;
  dateName: string;
  dateValue: string;
  windowName: string;
  windowValue: string;
}) {
  return (
    <div>
      <p className="kicker">{title}</p>
      <p className="mt-2 text-sm leading-snug text-stone">{address || "—"}</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <label>
          <span className="kicker">Date</span>
          <input type="date" name={dateName} defaultValue={dateValue} className="field mt-2" />
        </label>
        <label>
          <span className="kicker">Time window</span>
          <input name={windowName} defaultValue={windowValue} className="field mt-2" />
        </label>
      </div>
    </div>
  );
}

function CollectionSection({
  packageKnives,
  collected,
  notes,
  collectedBy,
  collectedAt,
  prelaunch,
}: {
  packageKnives: number;
  collected: number | null;
  notes: string | null;
  collectedBy: string | null;
  collectedAt: Date | null;
  prelaunch: boolean;
}) {
  const warning = collectionQuantityWarning(packageKnives, collected);
  return (
    <section className="mt-8">
      <h2 className="font-serif text-2xl">Collection</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="border border-line bg-soft px-4 py-4 text-sm">
          <span className="kicker block">Knives in package</span>
          <p className="mt-2 text-lg">{packageKnives}</p>
        </div>
        <div className="border border-line bg-soft px-4 py-4 text-sm">
          <span className="kicker block">Knives collected</span>
          <p className="mt-2 text-lg">{collected ?? "Not recorded"}</p>
        </div>
      </div>
      {warning ? <p className="mt-3 text-sm text-ember">{warning}</p> : null}
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-stone">Collected by</dt>
          <dd>{collectedBy || "—"}</dd>
        </div>
        <div>
          <dt className="text-stone">Collected at</dt>
          <dd>
            {collectedAt ? formatDateTime(collectedAt) : "—"}
            {collectedAt ? <span className="mt-1 block text-xs text-stone">Corrections keep this original time.</span> : null}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-stone">Collection notes</dt>
          <dd>{notes || "—"}</dd>
        </div>
      </dl>
      {prelaunch ? (
        <p className="mt-3 text-sm text-stone">Knife collection cannot be recorded while the site is in PRELAUNCH.</p>
      ) : null}
    </section>
  );
}

function CollectionEditor({
  collected,
  notes,
  collectedBy,
}: {
  collected: number | null;
  notes: string | null;
  collectedBy: string | null;
}) {
  return (
    <div>
      <p className="kicker">Knife collection</p>
      <p className="mt-2 text-sm text-stone">Leave the quantity empty until the knives are physically collected. The package quantity is not copied.</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <label>
          <span className="kicker">Knives collected</span>
          <input
            type="number"
            name="knivesCollected"
            min={0}
            max={MAX_KNIVES_COLLECTED}
            step={1}
            inputMode="numeric"
            defaultValue={collected ?? ""}
            className="field mt-2"
          />
        </label>
        <label>
          <span className="kicker">Collected by</span>
          <select name="collectedBy" defaultValue={collectedBy ?? ""} className="field mt-2">
            <option value="">Not recorded</option>
            {COLLECTORS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="mt-4 block">
        <span className="kicker">Collection notes</span>
        <textarea
          name="collectionNotes"
          rows={3}
          maxLength={500}
          defaultValue={notes ?? ""}
          placeholder="Damaged knives, unusual conditions, or customer instructions"
          className="field mt-2"
        />
      </label>
    </div>
  );
}

export default async function BookingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [booking, settings] = await Promise.all([
    prisma.booking.findUnique({
      where: { id },
      include: {
        emails: { orderBy: { createdAt: "desc" }, take: 20 },
        payments: { orderBy: [{ paidAt: "asc" }, { createdAt: "asc" }] },
      },
    }),
    getSettings(),
  ]);
  if (!booking) notFound();
  const status = normalizeBookingStatus(booking.status);
  const statusOptions = allowedBookingStatuses(settings.businessStatus);
  const fullAddress = [booking.addressLine, booking.postalCode, booking.areaName].filter(Boolean).join(", ");
  const whatsappHref = customerWhatsAppHref(booking.phone, booking.locale, booking.reference);

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
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-line bg-soft px-4 py-4 text-sm sm:col-span-2"
          >
            <span className="kicker block">WhatsApp</span>
            <span className="mt-1 block text-lg text-forest">Open draft</span>
            <span className="mt-1 block text-stone">Nothing is sent until you press send in WhatsApp.</span>
          </a>
        ) : null}
      </div>

      <div className="mt-3 border border-line bg-soft px-4 py-4 text-sm">
        <span className="kicker block">Pickup address</span>
        <p className="mt-2 text-lg leading-snug">{fullAddress || "—"}</p>
        {booking.pickupNotes ? <p className="mt-2 text-stone">{booking.pickupNotes}</p> : null}
        {!booking.inServiceArea ? <p className="mt-2 text-ember">Outside launch area — do not confirm pickup availability.</p> : null}
        {booking.deliveryNeedsReview ? (
          <p className="mt-2 text-ember">Delivery zone needs manual review — do not assign the cheapest fee automatically.</p>
        ) : null}
      </div>

      <dl className="mt-8 grid gap-3 border border-line p-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-stone">Package</dt>
          <dd>{booking.packageName}</dd>
        </div>
        <div>
          <dt className="text-stone">Knives in package</dt>
          <dd>{booking.knifeCount}</dd>
        </div>
        <div>
          <dt className="text-stone">Sharpening subtotal</dt>
          <dd>{formatPrice(booking.sharpeningSubtotalCents ?? booking.estimatedTotalCents)}</dd>
        </div>
        <div>
          <dt className="text-stone">Pickup & return</dt>
          <dd>
            {booking.deliveryFeeWaived
              ? "Free (threshold)"
              : booking.deliveryFeeCents == null
                ? booking.deliveryNeedsReview
                  ? "To be confirmed — review area"
                  : "—"
                : `${formatPrice(booking.deliveryFeeCents)} roundtrip`}
          </dd>
        </div>
        <div>
          <dt className="text-stone">Estimated total</dt>
          <dd>{formatPrice(booking.estimatedTotalCents)}</dd>
        </div>
        <div>
          <dt className="text-stone">Delivery zone</dt>
          <dd>{booking.deliveryZone ? booking.deliveryZone.replace("_", " ") : "—"}</dd>
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

      <section className="mt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-serif text-2xl">Schedule</h2>
          <p className="text-sm text-stone">
            {booking.reference} · {formatPrice(booking.estimatedTotalCents)}
          </p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ScheduleCard
            title="Confirmed pickup"
            date={booking.scheduledDate}
            timeWindow={booking.scheduledTimeSlot}
            address={fullAddress}
          />
          <ScheduleCard
            title="Confirmed return"
            date={booking.scheduledReturnDate}
            timeWindow={booking.scheduledReturnTimeSlot}
            address={fullAddress}
          />
        </div>
      </section>

      <CollectionSection
        packageKnives={booking.knifeCount}
        collected={booking.knivesCollected}
        notes={booking.collectionNotes}
        collectedBy={booking.collectedBy}
        collectedAt={booking.collectedAt}
        prelaunch={settings.businessStatus === "PRELAUNCH"}
      />

      <form action={updateBookingStatus} className="mt-8 grid gap-4 border border-line p-5">
        <input type="hidden" name="id" value={booking.id} />
        {settings.businessStatus === "PRELAUNCH" && (
          <p className="text-sm text-stone">
            Site is in PRELAUNCH. Operational pickup stages and knife collection cannot be recorded until the mode is set to ACTIVE.
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
          <div className="grid gap-6">
            <ScheduleEditor
              title="Confirmed pickup"
              address={fullAddress}
              dateName="scheduledDate"
              dateValue={booking.scheduledDate ? utcToISODate(booking.scheduledDate) : ""}
              windowName="scheduledTimeSlot"
              windowValue={booking.scheduledTimeSlot ?? ""}
            />
            <ScheduleEditor
              title="Confirmed return"
              address={fullAddress}
              dateName="scheduledReturnDate"
              dateValue={booking.scheduledReturnDate ? utcToISODate(booking.scheduledReturnDate) : ""}
              windowName="scheduledReturnTimeSlot"
              windowValue={booking.scheduledReturnTimeSlot ?? ""}
            />
            <CollectionEditor
              collected={booking.knivesCollected}
              notes={booking.collectionNotes}
              collectedBy={booking.collectedBy}
            />
          </div>
        )}
        <label>
          <span className="kicker">Internal notes</span>
          <textarea name="adminNotes" rows={4} defaultValue={booking.adminNotes ?? ""} className="field mt-2" />
        </label>
        <Button type="submit">Save booking</Button>
      </form>

      <BookingPayments
        bookingId={booking.id}
        totalCents={booking.estimatedTotalCents}
        payments={booking.payments}
        prelaunch={settings.businessStatus === "PRELAUNCH"}
      />

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
