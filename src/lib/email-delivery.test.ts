import assert from "node:assert/strict";
import { test } from "node:test";
import { confirmationDetailsChanged, shouldAttemptCustomerEmail, type EmailDeliveryRecord } from "./email-delivery";
import { confirmationDetailsComplete, renderCustomerEmail, type CustomerEmailFacts } from "./email/templates";
import { fromISODate, formatPrice } from "./utils";

const pickupFacts: CustomerEmailFacts = {
  name: "Ada",
  reference: "KP-1",
  packageName: "Complete Collection",
  knifeCount: 10,
  totalCents: 4900,
  pickupDate: fromISODate("2026-11-02"),
  pickupWindow: "09:00-12:00",
};

const returnFacts: CustomerEmailFacts = {
  ...pickupFacts,
  returnDate: fromISODate("2026-11-05"),
  returnWindow: "15:00-18:00",
};

const before = {
  scheduledDate: null as Date | null,
  scheduledTimeSlot: null as string | null,
  scheduledReturnDate: null as Date | null,
  scheduledReturnTimeSlot: null as string | null,
};

const pickupSchedule = {
  ...before,
  scheduledDate: fromISODate("2026-11-02"),
  scheduledTimeSlot: "09:00-12:00",
};

const returnSchedule = {
  ...pickupSchedule,
  scheduledReturnDate: fromISODate("2026-11-05"),
  scheduledReturnTimeSlot: "15:00-18:00",
};

function decide(input: {
  previousStatus: string;
  nextStatus: string;
  facts: CustomerEmailFacts;
  relevantDetailsChanged: boolean;
  logs?: EmailDeliveryRecord[];
}) {
  return shouldAttemptCustomerEmail({
    previousStatus: input.previousStatus,
    nextStatus: input.nextStatus,
    factsComplete: confirmationDetailsComplete(
      input.nextStatus === "RETURN_SCHEDULED" ? "return_arranged" : "pickup_confirmed",
      input.facts,
    ),
    relevantDetailsChanged: input.relevantDetailsChanged,
    logs: input.logs ?? [],
  });
}

test("missing pickup details are not confirmed, and a later save does not retry until they exist", () => {
  const missing = { ...pickupFacts, pickupDate: null, pickupWindow: null };
  assert.equal(confirmationDetailsComplete("pickup_confirmed", missing), false);
  assert.equal(
    decide({ previousStatus: "NEW", nextStatus: "PICKUP_CONFIRMED", facts: missing, relevantDetailsChanged: false }),
    "pickup_confirmed",
  );
  assert.equal(
    decide({
      previousStatus: "PICKUP_CONFIRMED",
      nextStatus: "PICKUP_CONFIRMED",
      facts: missing,
      relevantDetailsChanged: false,
      logs: [{ template: "pickup_confirmed", status: "SKIPPED", errorName: "missing_details" }],
    }),
    null,
  );
});

test("missing return details are not confirmed, and a later save does not retry until they exist", () => {
  const missing = { ...returnFacts, returnDate: null, returnWindow: " " };
  assert.equal(confirmationDetailsComplete("return_arranged", missing), false);
  assert.equal(
    decide({
      previousStatus: "READY_FOR_RETURN",
      nextStatus: "RETURN_SCHEDULED",
      facts: missing,
      relevantDetailsChanged: false,
    }),
    "return_arranged",
  );
  assert.equal(
    decide({
      previousStatus: "RETURN_SCHEDULED",
      nextStatus: "RETURN_SCHEDULED",
      facts: missing,
      relevantDetailsChanged: false,
      logs: [{ template: "return_arranged", status: "SKIPPED", errorName: "missing_details" }],
    }),
    null,
  );
});

test("adding the pickup date later sends one English or Spanish confirmation", () => {
  const skipped: EmailDeliveryRecord[] = [{ template: "pickup_confirmed", status: "SKIPPED", errorName: "missing_details" }];
  assert.equal(
    decide({
      previousStatus: "PICKUP_CONFIRMED",
      nextStatus: "PICKUP_CONFIRMED",
      facts: pickupFacts,
      relevantDetailsChanged: true,
      logs: skipped,
    }),
    "pickup_confirmed",
  );
  const en = renderCustomerEmail("pickup_confirmed", "en", pickupFacts);
  const es = renderCustomerEmail("pickup_confirmed", "es", pickupFacts);
  assert.ok(en);
  assert.ok(es);
  assert.match(en.text, /Monday, 2 November 2026/);
  assert.match(en.text, /09:00–12:00/);
  assert.ok(en.text.includes(formatPrice(4900, "en")));
  assert.match(es.text, /lunes, 2 de noviembre de 2026/);
  assert.ok(es.text.includes(formatPrice(4900, "es")));
  assert.equal(pickupFacts.totalCents, 4900);
});

test("adding the return date later sends one English or Spanish confirmation without a price", () => {
  const skipped: EmailDeliveryRecord[] = [{ template: "return_arranged", status: "SKIPPED", errorName: "missing_details" }];
  assert.equal(
    decide({
      previousStatus: "RETURN_SCHEDULED",
      nextStatus: "RETURN_SCHEDULED",
      facts: returnFacts,
      relevantDetailsChanged: true,
      logs: skipped,
    }),
    "return_arranged",
  );
  const en = renderCustomerEmail("return_arranged", "en", returnFacts);
  const es = renderCustomerEmail("return_arranged", "es", returnFacts);
  assert.ok(en);
  assert.ok(es);
  assert.match(en.text, /Thursday, 5 November 2026/);
  assert.match(es.text, /jueves, 5 de noviembre de 2026/);
  assert.doesNotMatch(en.text, /Total/);
  assert.doesNotMatch(es.text, /Total/);
});

test("a repeated save does not send another confirmation after SENT", () => {
  const sent: EmailDeliveryRecord[] = [{ template: "pickup_confirmed", status: "SENT" }];
  assert.equal(
    decide({
      previousStatus: "PICKUP_CONFIRMED",
      nextStatus: "PICKUP_CONFIRMED",
      facts: pickupFacts,
      relevantDetailsChanged: false,
      logs: sent,
    }),
    null,
  );
  assert.equal(
    decide({
      previousStatus: "RETURN_SCHEDULED",
      nextStatus: "RETURN_SCHEDULED",
      facts: returnFacts,
      relevantDetailsChanged: false,
      logs: [{ template: "return_arranged", status: "SENT" }],
    }),
    null,
  );
});

test("a successful confirmation is not sent again when unrelated fields change", () => {
  assert.equal(confirmationDetailsChanged("pickup_confirmed", pickupSchedule, pickupSchedule), false);
  assert.equal(
    confirmationDetailsChanged("pickup_confirmed", pickupSchedule, { ...pickupSchedule, scheduledReturnDate: fromISODate("2026-11-05"), scheduledReturnTimeSlot: "15:00-18:00" }),
    false,
  );
  assert.equal(
    decide({
      previousStatus: "PICKUP_CONFIRMED",
      nextStatus: "PICKUP_CONFIRMED",
      facts: pickupFacts,
      relevantDetailsChanged: false,
      logs: [{ template: "pickup_confirmed", status: "SENT" }],
    }),
    null,
  );
  assert.equal(
    decide({
      previousStatus: "COLLECTED",
      nextStatus: "COLLECTED",
      facts: pickupFacts,
      relevantDetailsChanged: true,
      logs: [],
    }),
    null,
  );
});

test("a failed confirmation is retried once the details are still complete", () => {
  assert.equal(
    decide({
      previousStatus: "PICKUP_CONFIRMED",
      nextStatus: "PICKUP_CONFIRMED",
      facts: pickupFacts,
      relevantDetailsChanged: false,
      logs: [{ template: "pickup_confirmed", status: "FAILED", errorName: "http_500" }],
    }),
    "pickup_confirmed",
  );
  assert.equal(
    decide({
      previousStatus: "RETURN_SCHEDULED",
      nextStatus: "RETURN_SCHEDULED",
      facts: returnFacts,
      relevantDetailsChanged: false,
      logs: [{ template: "return_arranged", status: "FAILED", errorName: "TypeError" }],
    }),
    "return_arranged",
  );
});

test("a sent record blocks a retry even when a later attempt failed", () => {
  assert.equal(
    decide({
      previousStatus: "PICKUP_CONFIRMED",
      nextStatus: "PICKUP_CONFIRMED",
      facts: pickupFacts,
      relevantDetailsChanged: true,
      logs: [
        { template: "pickup_confirmed", status: "SENT" },
        { template: "pickup_confirmed", status: "FAILED", errorName: "http_500" },
      ],
    }),
    null,
  );
});

test("a not_configured skip is retried and a missing-details skip waits for the schedule", () => {
  assert.equal(
    decide({
      previousStatus: "PICKUP_CONFIRMED",
      nextStatus: "PICKUP_CONFIRMED",
      facts: pickupFacts,
      relevantDetailsChanged: false,
      logs: [{ template: "pickup_confirmed", status: "SKIPPED", errorName: "not_configured" }],
    }),
    "pickup_confirmed",
  );
  const stillMissing = { ...returnFacts, returnWindow: null };
  assert.equal(
    decide({
      previousStatus: "RETURN_SCHEDULED",
      nextStatus: "RETURN_SCHEDULED",
      facts: stillMissing,
      relevantDetailsChanged: false,
      logs: [{ template: "return_arranged", status: "SKIPPED", errorName: "not_configured" }],
    }),
    null,
  );
});

test("only the matching visit counts as a relevant change", () => {
  assert.equal(confirmationDetailsChanged("return_arranged", pickupSchedule, returnSchedule), true);
  assert.equal(confirmationDetailsChanged("pickup_confirmed", before, pickupSchedule), true);
  assert.equal(confirmationDetailsChanged("return_arranged", returnSchedule, { ...returnSchedule, scheduledTimeSlot: "10:00-13:00" }), false);
});
