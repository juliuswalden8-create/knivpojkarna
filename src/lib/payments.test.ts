import assert from "node:assert/strict";
import { test } from "node:test";
import {
  eurCentsFromSek,
  formatExchangeRate,
  parseExchangeRateE4,
  parsePaymentDraft,
  paymentOwnedByBooking,
  paymentSummary,
  paymentWritesAllowed,
} from "./payments";

const now = new Date("2026-11-02T12:00:00.000Z");

function draft(overrides: Partial<Parameters<typeof parsePaymentDraft>[0]> = {}) {
  return parsePaymentDraft(
    {
      method: "SWISH",
      currency: "EUR",
      amount: "10.50",
      exchangeRate: "",
      paidAt: "2026-11-02T11:30",
      note: "",
      idempotencyKey: "8d8a5f3e-1c2b-4a9e-8f7d-6c5b4a392817",
      ...overrides,
    },
    now,
  );
}

test("EUR payments stay in cents and do not use an exchange rate", () => {
  const saved = draft();
  assert.equal(saved.ok, true);
  if (!saved.ok) return;
  assert.equal(saved.draft.amountMinor, 1050);
  assert.equal(saved.draft.eurCents, 1050);
  assert.equal(saved.draft.exchangeRateE4, null);
  assert.equal(saved.draft.method, "SWISH");
});

test("SEK converts with the entered rate and stores that rate", () => {
  const saved = draft({ method: "CASH", currency: "SEK", amount: "112.50", exchangeRate: "11.25" });
  assert.equal(saved.ok, true);
  if (!saved.ok) return;
  assert.equal(saved.draft.amountMinor, 11250);
  assert.equal(saved.draft.exchangeRateE4, 112500);
  assert.equal(saved.draft.eurCents, 1000);
});

test("SEK conversion rounds half up without floating-point money", () => {
  assert.equal(eurCentsFromSek(100, 112500), 9);
  assert.equal(eurCentsFromSek(1, 20000), 1);
  assert.equal(eurCentsFromSek(1, 20000), eurCentsFromSek(1, 20000));
});

test("the entered SEK rate and both amounts stay auditable", () => {
  const saved = draft({ currency: "SEK", amount: "112.50", exchangeRate: "11.2500" });
  assert.equal(saved.ok, true);
  if (!saved.ok) return;
  assert.equal(parseExchangeRateE4("11.25"), 112500);
  assert.equal(saved.draft.exchangeRateE4, 112500);
  assert.equal(formatExchangeRate(saved.draft.exchangeRateE4), "11.25");
  assert.equal(saved.draft.amountMinor, 11250);
  assert.equal(saved.draft.eurCents, 1000);
});

test("€30 on a €27 booking is Paid with €3 overpaid and no negative balance", () => {
  const summary = paymentSummary(2700, [{ eurCents: 3000, voided: false }]);
  assert.equal(summary.status, "Paid");
  assert.equal(summary.paidCents, 3000);
  assert.equal(summary.remainingCents, 0);
  assert.equal(summary.overpaidCents, 300);
  assert.equal(summary.bookingTotalCents, 2700);
});

test("€20 then €29 on a €49 booking moves from Partially paid to Paid", () => {
  const first = paymentSummary(4900, [{ eurCents: 2000, voided: false }]);
  assert.equal(first.status, "Partially paid");
  assert.equal(first.remainingCents, 2900);
  assert.equal(first.overpaidCents, 0);
  const second = paymentSummary(4900, [
    { eurCents: 2000, voided: false },
    { eurCents: 2900, voided: false },
  ]);
  assert.equal(second.status, "Paid");
  assert.equal(second.paidCents, 4900);
  assert.equal(second.remainingCents, 0);
});

test("a correction changes the balance and keeps the original row", () => {
  const before = paymentSummary(4900, [{ eurCents: 2000, voided: false }]);
  const history = [
    { eurCents: 2000, voided: true },
    { eurCents: 4900, voided: false },
  ];
  const after = paymentSummary(4900, history);
  assert.equal(before.status, "Partially paid");
  assert.equal(after.status, "Paid");
  assert.equal(after.paidCents, 4900);
  assert.equal(history.length, 2);
  assert.equal(history[0].voided, true);
});

test("rejects negative, zero, and imprecise amounts", () => {
  for (const amount of ["0", "-1", "10.555", "10,50", "abc"]) {
    assert.equal(draft({ amount }).ok, false, amount);
  }
});

test("requires an explicit SEK rate and rejects a rate on EUR", () => {
  assert.equal(draft({ currency: "SEK", amount: "100", exchangeRate: "" }).ok, false);
  assert.equal(draft({ currency: "EUR", exchangeRate: "11.25" }).ok, false);
  assert.equal(draft({ currency: "SEK", amount: "100", exchangeRate: "0" }).ok, false);
});

test("rejects unknown methods and a repeated form key that is not a uuid", () => {
  assert.equal(draft({ method: "CARD" }).ok, false);
  assert.equal(draft({ idempotencyKey: "same-form" }).ok, false);
});

test("payment status is calculated from active EUR amounts only", () => {
  const payments = [
    { eurCents: 2000, voided: false },
    { eurCents: 5000, voided: true },
  ];
  assert.deepEqual(paymentSummary(4900, []), {
    bookingTotalCents: 4900,
    paidCents: 0,
    remainingCents: 4900,
    overpaidCents: 0,
    status: "Unpaid",
  });
  assert.equal(paymentSummary(4900, payments).status, "Partially paid");
  assert.equal(paymentSummary(4900, payments).paidCents, 2000);
  assert.equal(paymentSummary(4900, payments).remainingCents, 2900);
  assert.equal(paymentSummary(4900, [{ eurCents: 4900, voided: false }]).status, "Paid");
  assert.equal(paymentSummary(4900, [{ eurCents: 5000, voided: false }]).remainingCents, 0);
  assert.equal(paymentSummary(4900, [{ eurCents: 5000, voided: false }]).overpaidCents, 100);
  assert.equal(paymentSummary(4900, payments).bookingTotalCents, 4900);
});

test("PRELAUNCH blocks payment writes and a payment cannot be moved to another booking", () => {
  assert.equal(paymentWritesAllowed("PRELAUNCH"), false);
  assert.equal(paymentWritesAllowed("ACTIVE"), true);
  assert.equal(paymentWritesAllowed("PAUSED"), true);
  assert.equal(paymentOwnedByBooking("booking-a", "booking-a"), true);
  assert.equal(paymentOwnedByBooking("booking-a", "booking-b"), false);
  assert.equal(paymentOwnedByBooking("", "booking-a"), false);
});
