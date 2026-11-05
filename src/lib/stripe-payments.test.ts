import assert from "node:assert/strict";
import { test } from "node:test";
import {
  acknowledgeNonPaidCheckout,
  classifyCheckoutSession,
  validatePaidCheckoutSession,
  type CheckoutBookingSnapshot,
  type CheckoutSessionFields,
} from "./stripe-payments";

const booking: CheckoutBookingSnapshot = {
  id: "bk_1",
  reference: "KP-ABC123",
  estimatedTotalCents: 3200,
  stripeCheckoutSessionId: "cs_test_abc",
};

function session(overrides: Partial<CheckoutSessionFields> = {}): CheckoutSessionFields {
  return {
    id: "cs_test_abc",
    status: "complete",
    payment_status: "paid",
    amount_total: 3200,
    currency: "eur",
    metadata: { bookingId: "bk_1", reference: "KP-ABC123" },
    created: 1_700_000_000,
    payment_intent: "pi_test_1",
    ...overrides,
  };
}

test("complete + payment_status unpaid must not validate as paid", () => {
  const classified = classifyCheckoutSession({ status: "complete", payment_status: "unpaid" });
  assert.equal(classified.kind, "unpaid_complete");

  const result = validatePaidCheckoutSession(session({ payment_status: "unpaid" }), booking);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "not_paid");

  const ack = acknowledgeNonPaidCheckout(session({ payment_status: "unpaid" }));
  assert.equal(ack.recordedPayment, false);
  assert.equal(ack.outcome, "unpaid_complete");
});

test("complete + payment_status paid validates with matching booking link and EUR amount", () => {
  const result = validatePaidCheckoutSession(session(), booking);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.amountCents, 3200);
  assert.equal(result.paymentIntentId, "pi_test_1");
});

test("async_payment_succeeded path is a paid candidate only when payment_status is paid", () => {
  assert.equal(classifyCheckoutSession({ status: "complete", payment_status: "paid" }).kind, "paid_candidate");
  const result = validatePaidCheckoutSession(session({ payment_status: "paid" }), booking);
  assert.equal(result.ok, true);
});

test("async_payment_failed never records a payment", () => {
  const ack = acknowledgeNonPaidCheckout(
    session({ status: "complete", payment_status: "unpaid" }),
    "checkout.session.async_payment_failed",
  );
  assert.equal(ack.recordedPayment, false);
  assert.equal(ack.outcome, "async_payment_failed");

  const result = validatePaidCheckoutSession(session({ payment_status: "unpaid" }), booking);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "not_paid");
});

test("expired session never records a payment", () => {
  assert.equal(classifyCheckoutSession({ status: "expired", payment_status: "unpaid" }).kind, "expired");
  const ack = acknowledgeNonPaidCheckout(session({ status: "expired", payment_status: "unpaid" }));
  assert.equal(ack.recordedPayment, false);
  assert.equal(ack.outcome, "expired");

  const result = validatePaidCheckoutSession(
    session({ status: "expired", payment_status: "unpaid" }),
    booking,
  );
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "not_paid");
});

test("duplicate webhook validation stays identical — same session still only one logical payment key", () => {
  const first = validatePaidCheckoutSession(session(), booking);
  const second = validatePaidCheckoutSession(session(), booking);
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  if (!first.ok || !second.ok) return;
  assert.equal(first.amountCents, second.amountCents);
  assert.equal(session().id, "cs_test_abc");
});

test("wrong bookingId is rejected", () => {
  const result = validatePaidCheckoutSession(
    session({ metadata: { bookingId: "bk_other", reference: "KP-ABC123" } }),
    booking,
  );
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "booking_mismatch");
});

test("session id that does not match the booking stripeCheckoutSessionId is rejected", () => {
  const result = validatePaidCheckoutSession(session({ id: "cs_test_other" }), booking);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "session_mismatch");
});

test("success-page expectedReference mismatch is rejected", () => {
  const result = validatePaidCheckoutSession(session(), booking, {
    expectedReference: "KP-OTHER",
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "reference_mismatch");
});

test("wrong amount is rejected", () => {
  const result = validatePaidCheckoutSession(session({ amount_total: 9999 }), booking);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "amount_mismatch");
});

test("non-EUR currency is rejected", () => {
  const result = validatePaidCheckoutSession(session({ currency: "usd" }), booking);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "bad_currency");
});

test("missing metadata is rejected", () => {
  const result = validatePaidCheckoutSession(session({ metadata: {} }), booking);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "missing_metadata");
});

test("a new booking may accept the first session id when none is stored yet", () => {
  const unbound: CheckoutBookingSnapshot = { ...booking, stripeCheckoutSessionId: null };
  const result = validatePaidCheckoutSession(session(), unbound);
  assert.equal(result.ok, true);
});

test("status complete alone never proves payment — only payment_status paid does", () => {
  assert.equal(
    validatePaidCheckoutSession(
      session({ status: "complete", payment_status: "no_payment_required" }),
      booking,
    ).ok,
    false,
  );
  assert.equal(
    validatePaidCheckoutSession(session({ status: "open", payment_status: "paid" }), booking).ok,
    true,
  );
});

test("metadata reference must match the booking reference", () => {
  const result = validatePaidCheckoutSession(
    session({ metadata: { bookingId: "bk_1", reference: "KP-WRONG" } }),
    booking,
  );
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "reference_mismatch");
});
