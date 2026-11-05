"use server";

import { headers } from "next/headers";
import { bookingSchema } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";
import { generateReference } from "@/lib/utils";
import { getAvailability, getSettings, siteUrl } from "@/lib/site";
import { isDateAvailable, parseTimeSlots, parseWeekdays, fromISODate } from "@/lib/dates";
import { clientKey, rateLimitPersistent } from "@/lib/rate-limit";
import { logError } from "@/lib/safe-log";
import { bookingLockKey, decideBookingWrite, duplicateBookingWhere } from "@/lib/booking-duplicate";
import { resolveServiceArea } from "@/lib/service-area";
import { calculateDeliveryQuote, deliveryFeesFromSettings } from "@/lib/delivery-zones";
import { localizedPath } from "@/i18n/routes";
import type { Locale } from "@/i18n/config";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import { buildCheckoutLineItems, checkoutLineItemsToStripe, isPayableQuote } from "@/lib/stripe-checkout";

export type CheckoutResult =
  | { ok: true; reference: string; checkoutUrl: string }
  | { ok: false; error: string; field?: string };

/**
 * Create a household booking and a Stripe Checkout Session for the server-quoted total.
 * Zone and price are never taken from the client.
 */
export async function createCheckoutBooking(input: unknown): Promise<CheckoutResult> {
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

  if (!stripeConfigured()) return { ok: false, error: "payment" };

  const data = parsed.data;
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip");
  const limited = await rateLimitPersistent(clientKey("checkout", ip), 8, 60 * 60 * 1000);
  if (!limited.ok) return { ok: false, error: "rate" };

  try {
    const settings = await getSettings();
    if (settings.businessStatus !== "ACTIVE") return { ok: false, error: "paused" };

    const pkg = await prisma.package.findFirst({ where: { id: data.packageId, active: true } });
    if (!pkg) return { ok: false, error: "package", field: "packageId" };

    const area = resolveServiceArea(data.areaName, data.areaDetail, {
      addressLine: data.addressLine,
      postalCode: data.postalCode,
    });
    const quote = calculateDeliveryQuote(pkg.priceCents, area, deliveryFeesFromSettings(settings));
    if (!isPayableQuote(quote)) return { ok: false, error: "zone", field: "areaName" };

    const availability = await getAvailability();
    const avail = {
      openWeekdays: parseWeekdays(availability.openWeekdays),
      timeSlots: parseTimeSlots(availability.timeSlots),
      leadTimeDays: Math.max(1, availability.leadTimeDays),
      bookingWindowDays: availability.bookingWindowDays,
      blocked: availability.blocked,
    };

    if (!data.preferredDate || !isDateAvailable(data.preferredDate, avail)) {
      return { ok: false, error: "date", field: "preferredDate" };
    }
    if (data.preferredTimeSlot && !avail.timeSlots.includes(data.preferredTimeSlot)) {
      return { ok: false, error: "time", field: "preferredTimeSlot" };
    }
    const preferredDate = fromISODate(data.preferredDate);
    const preferredTimeSlot = data.preferredTimeSlot;

    const packageName = data.locale === "es" ? pkg.nameEs : data.locale === "sv" && pkg.nameSv ? pkg.nameSv : pkg.nameEn;
    const knifeTypes = JSON.stringify({
      standard: pkg.knifeCount,
      serrated: 0,
      specialty: 0,
      damaged: false,
    });

    const deliveryLabel =
      data.locale === "es" ? "Recogida y devolución (ida y vuelta)" : "Pickup & return (roundtrip)";

    const lineItems = buildCheckoutLineItems(packageName, quote, { delivery: deliveryLabel });
    if (!lineItems) return { ok: false, error: "payment" };

    const saved = await prisma.$transaction(async (tx) => {
      const lockKey = bookingLockKey(data.email, pkg.id, data.addressLine);
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey})::bigint)`;
      const duplicate = await tx.booking.findFirst({
        where: duplicateBookingWhere(data.email, pkg.id, data.addressLine, new Date()),
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          reference: true,
          estimatedTotalCents: true,
          payments: { where: { voidedAt: null }, select: { id: true }, take: 1 },
        },
      });
      if (decideBookingWrite(duplicate) === "reuse" && duplicate?.reference) {
        if (duplicate.payments.length > 0) {
          return { created: false as const, id: duplicate.id, reference: duplicate.reference, alreadyPaid: true as const };
        }
        if (duplicate.estimatedTotalCents === quote.estimatedTotalCents) {
          return { created: false as const, id: duplicate.id, reference: duplicate.reference, alreadyPaid: false as const };
        }
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
          inServiceArea: quote.inServiceArea,
          sharpeningSubtotalCents: quote.sharpeningSubtotalCents,
          deliveryFeeCents: quote.deliveryFeeCents,
          deliveryZone: quote.deliveryZone,
          deliveryNeedsReview: quote.deliveryNeedsReview,
          deliveryFeeWaived: quote.deliveryFeeWaived,
          estimatedTotalCents: quote.estimatedTotalCents,
          locale: data.locale,
          consentAt: new Date(),
        },
        select: { id: true, reference: true, status: true },
      });
      if (!created.id || created.status !== "NEW" || !created.reference) return null;
      return { created: true as const, id: created.id, reference: created.reference, alreadyPaid: false as const };
    });

    if (!saved?.reference) return { ok: false, error: "save" };
    if (saved.alreadyPaid) {
      return { ok: false, error: "paid" };
    }

    const origin = siteUrl();
    const locale = data.locale as Locale;
    const successPath = `${localizedPath(locale, "book")}/success`;
    const cancelPath = localizedPath(locale, "book");

    const session = await getStripe().checkout.sessions.create(
      {
        mode: "payment",
        customer_email: data.email,
        client_reference_id: saved.reference,
        line_items: checkoutLineItemsToStripe(lineItems),
        success_url: `${origin}${successPath}?ref=${encodeURIComponent(saved.reference)}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}${cancelPath}?cancelled=1`,
        metadata: {
          bookingId: saved.id,
          reference: saved.reference,
        },
        payment_intent_data: {
          metadata: {
            bookingId: saved.id,
            reference: saved.reference,
          },
        },
      },
      { idempotencyKey: `checkout:${saved.id}:${quote.estimatedTotalCents}` },
    );

    if (!session.url) return { ok: false, error: "payment" };

    await prisma.booking.update({
      where: { id: saved.id },
      data: { stripeCheckoutSessionId: session.id },
    });

    return { ok: true, reference: saved.reference, checkoutUrl: session.url };
  } catch (err) {
    logError("createCheckoutBooking", err);
    return { ok: false, error: "save" };
  }
}
