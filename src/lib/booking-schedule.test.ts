import assert from "node:assert/strict";
import { test } from "node:test";
import { scheduleFields } from "./booking-schedule";
import { utcToISODate } from "./dates";
import { fromISODate } from "./utils";

test("return date does not replace the pickup date", () => {
  const saved = scheduleFields({
    prelaunch: false,
    pickupDate: "2026-11-02",
    pickupWindow: "09:00-12:00",
    returnDate: "2026-11-05",
    returnWindow: "15:00-18:00",
  });
  assert.equal(saved.scheduledDate ? utcToISODate(saved.scheduledDate) : null, "2026-11-02");
  assert.equal(saved.scheduledTimeSlot, "09:00-12:00");
  assert.equal(saved.scheduledReturnDate ? utcToISODate(saved.scheduledReturnDate) : null, "2026-11-05");
  assert.equal(saved.scheduledReturnTimeSlot, "15:00-18:00");
});

test("clearing the return leaves the pickup date in place", () => {
  const saved = scheduleFields({
    prelaunch: false,
    pickupDate: "2026-11-02",
    pickupWindow: "09:00-12:00",
    returnDate: "",
    returnWindow: "",
  });
  assert.equal(saved.scheduledDate ? utcToISODate(saved.scheduledDate) : null, "2026-11-02");
  assert.equal(saved.scheduledReturnDate, null);
  assert.equal(saved.scheduledReturnTimeSlot, null);
});

test("prelaunch stores no confirmed pickup or return", () => {
  const saved = scheduleFields({
    prelaunch: true,
    pickupDate: "2026-11-02",
    pickupWindow: "09:00-12:00",
    returnDate: "2026-11-05",
    returnWindow: "15:00-18:00",
  });
  assert.equal(saved.scheduledDate, null);
  assert.equal(saved.scheduledTimeSlot, null);
  assert.equal(saved.scheduledReturnDate, null);
  assert.equal(saved.scheduledReturnTimeSlot, null);
});

test("prelaunch keeps stored pickup and return dates on an unrelated save", () => {
  const existing = {
    scheduledDate: fromISODate("2026-11-02"),
    scheduledTimeSlot: "09:00-12:00",
    scheduledReturnDate: fromISODate("2026-11-05"),
    scheduledReturnTimeSlot: "15:00-18:00",
  };
  const saved = scheduleFields({
    prelaunch: true,
    pickupDate: "",
    pickupWindow: "",
    returnDate: "2026-12-01",
    returnWindow: "10:00-11:00",
    existing,
  });
  assert.equal(saved.scheduledDate, existing.scheduledDate);
  assert.equal(saved.scheduledTimeSlot, existing.scheduledTimeSlot);
  assert.equal(saved.scheduledReturnDate, existing.scheduledReturnDate);
  assert.equal(saved.scheduledReturnTimeSlot, existing.scheduledReturnTimeSlot);
});

test("an active save can still change the confirmed schedule", () => {
  const saved = scheduleFields({
    prelaunch: false,
    pickupDate: "2026-11-03",
    pickupWindow: "12:00-15:00",
    returnDate: "2026-11-06",
    returnWindow: "09:00-12:00",
    existing: {
      scheduledDate: fromISODate("2026-11-02"),
      scheduledTimeSlot: "09:00-12:00",
      scheduledReturnDate: fromISODate("2026-11-05"),
      scheduledReturnTimeSlot: "15:00-18:00",
    },
  });
  assert.equal(saved.scheduledDate ? utcToISODate(saved.scheduledDate) : null, "2026-11-03");
  assert.equal(saved.scheduledTimeSlot, "12:00-15:00");
  assert.equal(saved.scheduledReturnDate ? utcToISODate(saved.scheduledReturnDate) : null, "2026-11-06");
  assert.equal(saved.scheduledReturnTimeSlot, "09:00-12:00");
});
