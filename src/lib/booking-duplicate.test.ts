import assert from "node:assert/strict";
import { test } from "node:test";
import { createKeyLock } from "./inquiry-duplicate";
import { bookingLockKey, decideBookingWrite, duplicateBookingWhere, shouldSendAdminNotice } from "./booking-duplicate";

test("the same household request shares one lock key", () => {
  assert.equal(
    bookingLockKey("ada@house.test", "pkg-1", "Calle 1"),
    bookingLockKey("ada@house.test", "pkg-1", "Calle 1"),
  );
  assert.notEqual(
    bookingLockKey("ada@house.test", "pkg-1", "Calle 1"),
    bookingLockKey("ada@house.test", "pkg-2", "Calle 1"),
  );
});

test("household duplicates stay inside the two-minute window", () => {
  const now = new Date("2026-10-15T12:00:00.000Z");
  const where = duplicateBookingWhere("ada@house.test", "pkg-1", "Calle 1", now);
  assert.equal(where.email, "ada@house.test");
  assert.equal(where.packageId, "pkg-1");
  assert.equal(where.addressLine, "Calle 1");
  assert.equal(where.createdAt.gte.toISOString(), "2026-10-15T11:58:00.000Z");
});

test("a repeated household booking is reused and a new one is created", () => {
  assert.equal(decideBookingWrite({ reference: "KP-1" }), "reuse");
  assert.equal(decideBookingWrite(null), "create");
});

test("concurrent identical household bookings create one row and one admin notice", async () => {
  const run = createKeyLock();
  const rows: { key: string; reference: string }[] = [];
  const notices: string[] = [];
  const submit = (key: string, reference: string) =>
    run(key, async () => {
      const existing = rows.find((row) => row.key === key) ?? null;
      if (decideBookingWrite(existing) === "reuse") {
        return { created: false, reference: existing!.reference };
      }
      rows.push({ key, reference });
      if (shouldSendAdminNotice(true)) notices.push(reference);
      return { created: true, reference };
    });
  const key = bookingLockKey("ada@house.test", "pkg-1", "Calle 1");
  const [first, second] = await Promise.all([submit(key, "KP-1"), submit(key, "KP-2")]);
  assert.equal(rows.length, 1);
  assert.equal(first.reference, "KP-1");
  assert.equal(second.reference, "KP-1");
  assert.equal(shouldSendAdminNotice(first.created), true);
  assert.equal(shouldSendAdminNotice(second.created), false);
  assert.deepEqual(notices, ["KP-1"]);
});

test("different household requests are not treated as duplicates", async () => {
  const run = createKeyLock();
  const rows: string[] = [];
  const submit = (key: string) =>
    run(key, async () => {
      const existing = rows.find((row) => row === key) ?? null;
      if (decideBookingWrite(existing) === "reuse") return false;
      rows.push(key);
      return true;
    });
  const created = await Promise.all([
    submit(bookingLockKey("a@house.test", "pkg-1", "Calle 1")),
    submit(bookingLockKey("b@house.test", "pkg-1", "Calle 2")),
  ]);
  assert.deepEqual(created, [true, true]);
  assert.equal(rows.length, 2);
});
