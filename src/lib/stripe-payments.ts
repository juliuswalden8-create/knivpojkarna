import type Stripe from "stripe";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/safe-log";
import { sendBookingEmail } from "@/lib/email/send";
import { getStripe } from "@/lib/stripe";

export type CheckoutBookingSnapshot = {
  id: string;
  reference: string;
  estimatedTotalCents: number;
  stripeCheckoutSessionId: string | null;
};

export type CheckoutValidationOk = {
  ok: true;
  amountCents: number;
  paidAt: Date;
  paymentIntentId: string | null;
};

export type CheckoutValidationFail = {
  ok: false;
  reason:
    | "missing_metadata"
    | "not_paid"
    | "bad_amount"
    | "bad_currency"
    | "booking_mismatch"
    | "session_mismatch"
    | "reference_mismatch"
    | "amount_mismatch";
};

export type CheckoutValidationResult = CheckoutValidationOk | CheckoutValidationFail;

export type CheckoutTerminalOutcome =
  | { kind: "ignore"; reason: "not_terminal" }
  | { kind: "paid_candidate" }
  | { kind: "failed"; reason: "async_payment_failed" }
  | { kind: "expired"; reason: "expired" }
  | { kind: "unpaid_complete"; reason: "complete_unpaid" };

/** Classify a Checkout Session without writing anything. Never treats unpaid as paid. */
export function classifyCheckoutSession(
  session: Pick<Stripe.Checkout.Session, "status" | "payment_status">,
): CheckoutTerminalOutcome {
  if (session.status === "expired") return { kind: "expired", reason: "expired" };
  if (session.payment_status === "paid") return { kind: "paid_candidate" };
  // After the paid check, remaining statuses are unpaid / no_payment_required.
  if (session.status === "complete") {
    return { kind: "unpaid_complete", reason: "complete_unpaid" };
  }
  return { kind: "ignore", reason: "not_terminal" };
}

/**
 * Server-side gate before recording a Stripe payment.
 * Requires payment_status === "paid" and a hard link to the booking (id, reference, session id, EUR amount).
 */
export type CheckoutSessionFields = {
  id: string;
  status: Stripe.Checkout.Session.Status | null;
  payment_status: Stripe.Checkout.Session.PaymentStatus;
  amount_total: number | null;
  currency: string | null;
  metadata: Stripe.Metadata | null;
  created: number;
  payment_intent?: string | { id: string } | null;
};

export function validatePaidCheckoutSession(
  session: CheckoutSessionFields,
  booking: CheckoutBookingSnapshot,
  options?: { expectedReference?: string | null },
): CheckoutValidationResult {
  const bookingId = session.metadata?.bookingId?.trim() || "";
  const reference = session.metadata?.reference?.trim() || "";
  if (!bookingId || !reference) return { ok: false, reason: "missing_metadata" };

  if (session.payment_status !== "paid") return { ok: false, reason: "not_paid" };

  if (bookingId !== booking.id) return { ok: false, reason: "booking_mismatch" };
  if (reference !== booking.reference) return { ok: false, reason: "reference_mismatch" };

  const expectedReference = options?.expectedReference?.trim();
  if (expectedReference && expectedReference !== booking.reference) {
    return { ok: false, reason: "reference_mismatch" };
  }
  if (expectedReference && expectedReference !== reference) {
    return { ok: false, reason: "reference_mismatch" };
  }

  if (booking.stripeCheckoutSessionId && booking.stripeCheckoutSessionId !== session.id) {
    return { ok: false, reason: "session_mismatch" };
  }

  const currency = (session.currency || "").toLowerCase();
  if (currency !== "eur") return { ok: false, reason: "bad_currency" };

  const amountTotal = session.amount_total;
  if (amountTotal == null || amountTotal <= 0) return { ok: false, reason: "bad_amount" };
  if (amountTotal !== booking.estimatedTotalCents) return { ok: false, reason: "amount_mismatch" };

  const paidAt = session.created ? new Date(session.created * 1000) : new Date();
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;
  return {
    ok: true,
    amountCents: amountTotal,
    paidAt,
    paymentIntentId,
  };
}

function isUniqueViolation(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

/**
 * Idempotently record a paid Checkout Session against its booking.
 * Uses the session id as the payment idempotency key.
 * Does not change booking operational status (NEW / PICKUP_CONFIRMED / …).
 */
export async function recordStripeCheckoutPayment(
  session: Stripe.Checkout.Session,
  options?: { expectedReference?: string | null },
) {
  const bookingId = session.metadata?.bookingId?.trim() || "";
  const reference = session.metadata?.reference?.trim() || "";
  if (!bookingId || !reference) return { ok: false as const, reason: "missing_metadata" as const };

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId },
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
  if (!booking) return { ok: false as const, reason: "booking_missing" as const };

  const validated = validatePaidCheckoutSession(session, booking, options);
  if (!validated.ok) {
    if (validated.reason === "amount_mismatch" || validated.reason === "session_mismatch") {
      logError(`stripe.${validated.reason}`, new Error(validated.reason));
    }
    return { ok: false as const, reason: validated.reason };
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const existing = await tx.bookingPayment.findFirst({
        where: { bookingId: booking.id, idempotencyKey: session.id },
        select: { id: true },
      });
      if (existing) return { created: false as const, paymentId: existing.id };

      if (!booking.stripeCheckoutSessionId) {
        await tx.booking.update({
          where: { id: booking.id },
          data: { stripeCheckoutSessionId: session.id },
        });
      } else if (booking.stripeCheckoutSessionId !== session.id) {
        return { created: false as const, paymentId: null, rejected: "session_mismatch" as const };
      }

      try {
        const payment = await tx.bookingPayment.create({
          data: {
            bookingId: booking.id,
            method: "STRIPE",
            currency: "EUR",
            amountMinor: validated.amountCents,
            exchangeRateE4: null,
            eurCents: validated.amountCents,
            paidAt: validated.paidAt,
            note: validated.paymentIntentId
              ? `Stripe PI ${validated.paymentIntentId}`
              : `Stripe session ${session.id}`,
            idempotencyKey: session.id,
          },
          select: { id: true },
        });
        return { created: true as const, paymentId: payment.id };
      } catch (error) {
        if (!isUniqueViolation(error)) throw error;
        const raced = await tx.bookingPayment.findFirst({
          where: { bookingId: booking.id, idempotencyKey: session.id },
          select: { id: true },
        });
        if (raced) return { created: false as const, paymentId: raced.id };
        throw error;
      }
    });

    if ("rejected" in created && created.rejected) {
      return { ok: false as const, reason: created.rejected };
    }

    if (created.created) {
      await sendBookingEmail({
        template: "booking_request_received",
        locale: booking.locale,
        to: booking.email,
        name: booking.customerName,
        reference: booking.reference,
        bookingId: booking.id,
        totalCents: validated.amountCents,
      });
    }

    return { ok: true as const, bookingId: booking.id, created: created.created };
  } catch (err) {
    logError("stripe.record_payment", err);
    return { ok: false as const, reason: "save_failed" as const };
  }
}

/**
 * Failed / expired Checkout — acknowledge without recording a payment or changing job status.
 * Payment state stays derived from BookingPayment rows only.
 */
export function acknowledgeNonPaidCheckout(
  session: Pick<Stripe.Checkout.Session, "id" | "status" | "payment_status">,
  eventType?: string,
): { ok: true; recordedPayment: false; outcome: CheckoutTerminalOutcome["kind"] | "async_payment_failed" } {
  if (eventType === "checkout.session.async_payment_failed") {
    return { ok: true, recordedPayment: false, outcome: "async_payment_failed" };
  }
  const classified = classifyCheckoutSession(session);
  if (classified.kind === "expired") {
    return { ok: true, recordedPayment: false, outcome: "expired" };
  }
  if (classified.kind === "unpaid_complete") {
    return { ok: true, recordedPayment: false, outcome: "unpaid_complete" };
  }
  return { ok: true, recordedPayment: false, outcome: classified.kind };
}

/** Success-page fallback when the webhook has not run yet. */
export async function syncCheckoutSessionById(sessionId: string, expectedReference?: string | null) {
  if (!sessionId.startsWith("cs_")) return { ok: false as const, reason: "bad_id" as const };
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    return recordStripeCheckoutPayment(session, { expectedReference });
  } catch (err) {
    logError("stripe.sync_session", err);
    return { ok: false as const, reason: "retrieve_failed" as const };
  }
}
