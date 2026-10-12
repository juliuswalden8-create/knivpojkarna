import assert from "node:assert/strict";
import { test } from "node:test";
import {
  acceptsPublicRequests,
  allowedBookingStatuses,
  allowedInquiryStatuses,
  canSetBookingStatus,
  canSetInquiryStatus,
  emailTemplateForStatus,
  normalizeBookingStatus,
} from "./inquiry-status";

test("PRELAUNCH and ACTIVE accept public requests; PAUSED does not", () => {
  assert.equal(acceptsPublicRequests("PRELAUNCH"), true);
  assert.equal(acceptsPublicRequests("ACTIVE"), true);
  assert.equal(acceptsPublicRequests("PAUSED"), false);
});

test("PRELAUNCH cannot activate operational pickup stages", () => {
  assert.deepEqual(allowedBookingStatuses("PRELAUNCH"), ["NEW", "CONTACTED", "CANCELLED"]);
  assert.equal(canSetBookingStatus("PRELAUNCH", "CONFIRMED"), false);
  assert.equal(canSetBookingStatus("PRELAUNCH", "PICKUP_CONFIRMED"), false);
  assert.equal(canSetBookingStatus("PRELAUNCH", "IN_PROGRESS"), false);
  assert.equal(canSetBookingStatus("PRELAUNCH", "SHARPENING"), false);
  assert.equal(canSetBookingStatus("PRELAUNCH", "COMPLETED"), false);
  assert.equal(canSetBookingStatus("PRELAUNCH", "NEW"), true);
  assert.equal(canSetBookingStatus("PRELAUNCH", "CONTACTED"), true);
  assert.equal(canSetBookingStatus("ACTIVE", "PICKUP_CONFIRMED"), true);
  assert.equal(canSetBookingStatus("ACTIVE", "CONFIRMED"), false);
});

test("legacy booking statuses map explicitly", () => {
  assert.equal(normalizeBookingStatus("CONFIRMED"), "PICKUP_CONFIRMED");
  assert.equal(normalizeBookingStatus("IN_PROGRESS"), "SHARPENING");
  assert.equal(normalizeBookingStatus("NEW"), "NEW");
});

test("status emails never claim pickup confirmed for NEW", () => {
  assert.equal(emailTemplateForStatus("NEW"), null);
  assert.equal(emailTemplateForStatus("CONTACTED"), null);
  assert.equal(emailTemplateForStatus("PICKUP_CONFIRMED"), "pickup_confirmed");
  assert.equal(emailTemplateForStatus("CONFIRMED"), "pickup_confirmed");
});

test("PRELAUNCH business follow-up cannot be marked won", () => {
  assert.deepEqual(allowedInquiryStatuses("PRELAUNCH"), ["NEW", "CONTACTED", "CLOSED"]);
  assert.equal(canSetInquiryStatus("PRELAUNCH", "WON"), false);
  assert.equal(canSetInquiryStatus("PRELAUNCH", "QUOTED"), false);
  assert.equal(canSetInquiryStatus("ACTIVE", "WON"), true);
});
