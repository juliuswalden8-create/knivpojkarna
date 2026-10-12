import assert from "node:assert/strict";
import { test } from "node:test";
import { canSetBookingStatus } from "./inquiry-status";

test("admin authorization helper denies unauthenticated-equivalent invalid statuses", () => {
  assert.equal(canSetBookingStatus("PRELAUNCH", "CONFIRMED"), false);
  assert.equal(canSetBookingStatus("PRELAUNCH", "not-a-status"), false);
});

test("PAUSED does not change permitted admin booking statuses vs ACTIVE", () => {
  assert.equal(canSetBookingStatus("PAUSED", "NEW"), true);
  assert.equal(canSetBookingStatus("PAUSED", "CANCELLED"), true);
});
