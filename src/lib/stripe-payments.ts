import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/safe-log";
import { sendBookingEmail } from "@/lib/email/send";
import { getStripe } from "@/lib/stripe";

/**
 * Idempotently record a paid Checkout Session against its booking.
 * Uses the session id as the payment idempotency key.
 */
export async function recordStripeCheckoutPayment(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.bookingId?.trim() || "";
  const reference = session.metadata?.reference?.trim() || "";
  if (!bookingId && !reference) return { ok: false as const, reason: "missing_metadata" };
  if (session.payment_status !== "paid" && session.status !== "complete") {
    return { ok: false as const, reason: "not_paid" };
  }

  const amountTotal = session.amount_total;
  if (amountTotal == null || amountTotal <= 0) return { ok: false as const, reason: "bad_amount" };

  const booking = await prisma.booking.findFirst({
    where: bookingId ? { id: bookingId } : { reference },
    select: {
      id: true,
      reference: true,
      estimatedTotalCents: true,
      customerName: true,
      email: true,
      locale: true,
      stripeCheckoutSessionId: true,
    },
  });
  if (!booking) return { ok: false as const, reason: "booking_missing" };

  if (amountTotal !== booking.estimatedTotalCents) {
    logError("stripe.amount_mismatch", {
      bookingId: booking.id,
      expected: booking.estimatedTotalCents,
      received: amountTotal,
      sessionId: session.id,
    });
    return { ok: false as const, reason: "amount_mismatch" };
  }

  const paidAt = session.created ? new Date(session.created * 1000) : new Date();
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id || null;

  try {
    const created = await prisma.$transaction(async (tx) => {
      if (!booking.stripeCheckoutSessionId || booking.stripeCheckoutSessionId !== session.id) {
        await tx.booking.update({
          where: { id: booking.id },
          data: { stripeCheckoutSessionId: session.id },
        });
      }

      const existing = await tx.bookingPayment.findFirst({
        where: { bookingId: booking.id, idempotencyKey: session.id },
        select: { id: true },
      });
      if (existing) return { created: false as const, paymentId: existing.id };

      const payment = await tx.bookingPayment.create({
        data: {
          bookingId: booking.id,
          method: "STRIPE",
          currency: "EUR",
          amountMinor: amountTotal,
          exchangeRateE4: null,
          eurCents: amountTotal,
          paidAt,
          note: paymentIntentId ? `Stripe PI ${paymentIntentId}` : `Stripe session ${session.id}`,
          idempotencyKey: session.id,
        },
        select: { id: true },
      });
      return { created: true as const, paymentId: payment.id };
    });

    if (created.created) {
      await sendBookingEmail({
        template: "booking_request_received",
        locale: booking.locale,
        to: booking.email,
        name: booking.customerName,
        reference: booking.reference,
        bookingId: booking.id,
        totalCents: amountTotal,
      });
    }

    return { ok: true as const, bookingId: booking.id, created: created.created };
  } catch (err) {
    logError("stripe.record_payment", err);
    return { ok: false as const, reason: "save_failed" };
  }
}

/** Success-page fallback when the webhook has not run yet. */
export async function syncCheckoutSessionById(sessionId: string) {
  if (!sessionId.startsWith("cs_")) return { ok: false as const, reason: "bad_id" };
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    return recordStripeCheckoutPayment(session);
  } catch (err) {
    logError("stripe.sync_session", err);
    return { ok: false as const, reason: "retrieve_failed" };
  }
}
