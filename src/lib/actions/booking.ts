"use server";

import { headers } from "next/headers";
import { bookingSchema } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";
import { generateReference } from "@/lib/utils";
import { getAvailability, getSettings } from "@/lib/site";
import { isDateAvailable, parseTimeSlots, parseWeekdays, fromISODate } from "@/lib/dates";
import { clientKey, rateLimitPersistent } from "@/lib/rate-limit";
import { acceptsPublicRequests } from "@/lib/inquiry-status";
import { logError } from "@/lib/safe-log";
import { duplicateWindowMs, resolveServiceArea } from "@/lib/service-area";
import { sendBookingEmail } from "@/lib/email/send";

export type BookingResult =
  | { ok: true; reference: string }
  | { ok: false; error: string; field?: string };

export async function submitBooking(input: unknown): Promise<BookingResult> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue?.path.join(".") ?? "";
    if (path === "addressLine") return { ok: false, error: "address", field: "addressLine" };
    if (path === "postalCode") return { ok: false, error: "postal", field: "postalCode" };
    if (path === "areaName") return { ok: false, error: "area", field: "areaName" };
    if (path === "customerName") return { ok: false, error: "name", field: "customerName" };
    if (path === "email") return { ok: false, error: "email", field: "email" };
    if (path === "phone") return { ok: false, error: "phone", field: "phone" };
    if (path === "packageId") return { ok: false, error: "package", field: "packageId" };
    return { ok: false, error: "invalid", field: path };
  }

  const data = parsed.data;
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip");
  const limited = await rateLimitPersistent(clientKey("book", ip), 8, 60 * 60 * 1000);
  if (!limited.ok) return { ok: false, error: "rate" };

  try {
    const settings = await getSettings();
    if (!acceptsPublicRequests(settings.businessStatus)) return { ok: false, error: "paused" };

    const pkg = await prisma.package.findFirst({ where: { id: data.packageId, active: true } });
    if (!pkg) return { ok: false, error: "package", field: "packageId" };

    const area = resolveServiceArea(data.areaName, data.areaDetail);
    const prelaunch = settings.businessStatus === "PRELAUNCH";
    const availability = await getAvailability();
    const avail = {
      openWeekdays: parseWeekdays(availability.openWeekdays),
      timeSlots: parseTimeSlots(availability.timeSlots),
      leadTimeDays: Math.max(1, availability.leadTimeDays),
      bookingWindowDays: availability.bookingWindowDays,
      blocked: availability.blocked,
    };

    let preferredDate: Date | null = null;
    let preferredTimeSlot: string | null = null;
    if (!prelaunch && area.inServiceArea) {
      if (!data.preferredDate || !isDateAvailable(data.preferredDate, avail)) {
        return { ok: false, error: "date", field: "preferredDate" };
      }
      if (data.preferredTimeSlot && !avail.timeSlots.includes(data.preferredTimeSlot)) {
        return { ok: false, error: "time", field: "preferredTimeSlot" };
      }
      preferredDate = fromISODate(data.preferredDate);
      preferredTimeSlot = data.preferredTimeSlot;
    }

    const since = new Date(Date.now() - duplicateWindowMs());
    const duplicate = await prisma.booking.findFirst({
      where: {
        email: data.email,
        packageId: pkg.id,
        addressLine: data.addressLine,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "desc" },
      select: { reference: true },
    });
    if (duplicate?.reference) return { ok: true, reference: duplicate.reference };

    const packageName = data.locale === "es" ? pkg.nameEs : data.locale === "sv" && pkg.nameSv ? pkg.nameSv : pkg.nameEn;
    const knifeTypes = JSON.stringify({
      standard: pkg.knifeCount,
      serrated: 0,
      specialty: 0,
      damaged: false,
    });

    let reference = generateReference("KP");
    for (let i = 0; i < 4; i++) {
      const clash = await prisma.booking.findUnique({ where: { reference } });
      if (!clash) break;
      reference = generateReference("KP");
    }

    const created = await prisma.booking.create({
      data: {
        reference,
        status: "NEW",
        packageId: pkg.id,
        packageName,
        knifeCount: pkg.knifeCount,
        knifeTypes,
        serviceType: "PICKUP",
        addressLine: data.addressLine,
        postalCode: data.postalCode,
        areaName: area.areaName,
        preferredDate,
        preferredTimeSlot,
        customerName: data.customerName,
        email: data.email,
        phone: data.phone,
        comments: data.comments,
        pickupNotes: data.pickupNotes,
        inServiceArea: area.inServiceArea,
        estimatedTotalCents: pkg.priceCents,
        locale: data.locale,
        consentAt: new Date(),
      },
      select: { id: true, reference: true, status: true, customerName: true, email: true, locale: true },
    });

    if (!created.id || created.status !== "NEW") {
      return { ok: false, error: "save" };
    }

    const verified = await prisma.booking.findUnique({
      where: { id: created.id },
      select: { id: true, reference: true },
    });
    if (!verified?.reference) return { ok: false, error: "save" };

    await sendBookingEmail({
      template: prelaunch ? "interest_received" : "booking_request_received",
      locale: created.locale,
      to: created.email,
      name: created.customerName,
      reference: verified.reference,
      bookingId: verified.id,
    });

    return { ok: true, reference: verified.reference };
  } catch (err) {
    logError("submitBooking", err);
    return { ok: false, error: "save" };
  }
}
