import assert from "node:assert/strict";
import { test } from "node:test";
import { isWaitlistBooking, WAITLIST_SERVICE_TYPE, waitlistLockKey } from "./waitlist";

test("waitlist bookings are detected by service type or empty package snapshot", () => {
  assert.equal(isWaitlistBooking({ serviceType: WAITLIST_SERVICE_TYPE, knifeCount: 0 }), true);
  assert.equal(isWaitlistBooking({ serviceType: "PICKUP", packageId: null, knifeCount: 0 }), true);
  assert.equal(isWaitlistBooking({ serviceType: "PICKUP", packageId: "pkg", knifeCount: 5 }), false);
});

test("waitlist lock keys normalize contact and town", () => {
  assert.equal(waitlistLockKey(" Ada@Example.com ", " Marbella "), waitlistLockKey("ada@example.com", "marbella"));
  assert.notEqual(waitlistLockKey("ada@example.com", "Marbella"), waitlistLockKey("ada@example.com", "Fuengirola"));
});
