"use server";

import { headers } from "next/headers";
import { waitlistSchema } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";
import { generateReference } from "@/lib/utils";
import { getSettings } from "@/lib/site";
import { clientKey, rateLimitPersistent } from "@/lib/rate-limit";
import { acceptsPublicRequests } from "@/lib/inquiry-status";
import { logError } from "@/lib/safe-log";
import { decideBookingWrite, shouldSendAdminNotice } from "@/lib/booking-duplicate";
import { resolveServiceArea } from "@/lib/service-area";
import { sendBookingEmail } from "@/lib/email/send";
import { siteUrl } from "@/lib/site";
import { notifyAdmin } from "@/lib/telegram";
import { WAITLIST_PACKAGE_NAME, WAITLIST_SERVICE_TYPE, waitlistLockKey } from "@/lib/waitlist";
import type { BookingResult } from "@/lib/actions/booking";

export async function submitWaitlist(input: unknown): Promise<BookingResult> {
  const parsed = waitlistSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue?.path.join(".") ?? "";
    if (path === "customerName") return { ok: false, error: "name", field: "customerName" };
    if (path === "email") return { ok: false, error: "email", field: "email" };
    if (path === "phone") return { ok: false, error: "phone", field: "phone" };
    if (path === "areaName" || path === "areaDetail") return { ok: false, error: "area", field: "areaName" };
    if (issue?.message === "contact") return { ok: false, error: "contact", field: "email" };
    return { ok: false, error: "invalid", field: path };
  }

  const data = parsed.data;
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip");
  const limited = await rateLimitPersistent(clientKey("waitlist", ip), 8, 60 * 60 * 1000);
  if (!limited.ok) return { ok: false, error: "rate" };

  try {
    const settings = await getSettings();
    if (settings.businessStatus !== "PRELAUNCH") return { ok: false, error: "paused" };
    if (!acceptsPublicRequests(settings.businessStatus)) return { ok: false, error: "paused" };

    const area = resolveServiceArea(data.areaName, data.areaDetail, {
      addressLine: null,
      postalCode: null,
    });
    const email = data.email ?? "";
    const phone = data.phone ?? "";
    const packageName = data.locale === "es" ? WAITLIST_PACKAGE_NAME.es : WAITLIST_PACKAGE_NAME.en;

    const saved = await prisma.$transaction(async (tx) => {
      const lockKey = waitlistLockKey(email || phone, area.areaName);
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey})::bigint)`;

      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const duplicate = await tx.booking.findFirst({
        where: {
          serviceType: WAITLIST_SERVICE_TYPE,
          areaName: area.areaName,
          createdAt: { gte: since },
          OR: [
            ...(email ? [{ email }] : []),
            ...(phone ? [{ phone }] : []),
          ],
        },
        orderBy: { createdAt: "desc" },
        select: { id: true, reference: true },
      });
      if (decideBookingWrite(duplicate) === "reuse" && duplicate?.reference) {
        return { created: false as const, id: duplicate.id, reference: duplicate.reference };
      }

      let reference = generateReference("KP");
      for (let i = 0; i < 4; i++) {
        const clash = await tx.booking.findUnique({ where: { reference } });
        if (!clash) break;
        reference = generateReference("KP");
      }

      const created = await tx.booking.create({
        data: {
          reference,
          status: "NEW",
          packageId: null,
          packageName,
          knifeCount: 0,
          knifeTypes: JSON.stringify({ standard: 0, serrated: 0, specialty: 0, damaged: false }),
          serviceType: WAITLIST_SERVICE_TYPE,
          addressLine: null,
          postalCode: null,
          areaName: area.areaName,
          preferredDate: null,
          preferredTimeSlot: null,
          customerName: data.customerName,
          email,
          phone,
          comments: null,
          pickupNotes: null,
          inServiceArea: area.inServiceArea,
          sharpeningSubtotalCents: null,
          deliveryFeeCents: null,
          deliveryZone: area.zone,
          deliveryNeedsReview: area.needsReview,
          deliveryFeeWaived: false,
          estimatedTotalCents: 0,
          locale: data.locale,
          consentAt: new Date(),
        },
        select: { id: true, reference: true, status: true, customerName: true, email: true, locale: true },
      });
      if (!created.id || created.status !== "NEW" || !created.reference) return null;
      return {
        created: true as const,
        id: created.id,
        reference: created.reference,
        customerName: created.customerName,
        email: created.email,
        locale: created.locale,
      };
    });

    if (!saved?.reference) return { ok: false, error: "save" };

    if (saved.created && shouldSendAdminNotice(saved.created)) {
      const verified = await prisma.booking.findUnique({
        where: { id: saved.id },
        select: { id: true, reference: true },
      });
      if (!verified?.reference) return { ok: false, error: "save" };

      if (saved.email.includes("@")) {
        await sendBookingEmail({
          template: "interest_received",
          locale: saved.locale,
          to: saved.email,
          name: saved.customerName,
          reference: verified.reference,
          bookingId: verified.id,
        });
      }

      await notifyAdmin(
        {
          kind: "booking",
          reference: verified.reference,
          name: saved.customerName,
          packageName,
          knifeCount: 0,
          area: area.areaName,
          deliveryZone: area.zone,
          estimatedTotalCents: 0,
          adminPath: `/admin/bookings/${verified.id}`,
        },
        siteUrl(),
      );
    }

    return { ok: true, reference: saved.reference };
  } catch (err) {
    logError("submitWaitlist", err);
    return { ok: false, error: "save" };
  }
}
