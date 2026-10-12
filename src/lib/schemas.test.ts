import assert from "node:assert/strict";
import { test } from "node:test";
import { bookingSchema, inquirySchema } from "./schemas";

const validBooking = {
  locale: "en" as const,
  packageId: "pkg_1",
  serviceType: "PICKUP" as const,
  addressLine: "Calle Ejemplo 12",
  postalCode: "29600",
  areaName: "Marbella",
  customerName: "Ada Lovelace",
  email: "ada@example.com",
  phone: "600000000",
  consent: true as const,
};

test("rejects invalid household email and empty package", () => {
  assert.equal(bookingSchema.safeParse({ ...validBooking, email: "not-an-email" }).success, false);
  assert.equal(bookingSchema.safeParse({ ...validBooking, packageId: "" }).success, false);
});

test("rejects MAIL_IN, DROP_OFF and missing area on new household requests", () => {
  assert.equal(bookingSchema.safeParse({ ...validBooking, serviceType: "MAIL_IN" }).success, false);
  assert.equal(bookingSchema.safeParse({ ...validBooking, serviceType: "DROP_OFF" }).success, false);
  assert.equal(bookingSchema.safeParse({ ...validBooking, areaName: "" }).success, false);
});

test("rejects honeypot and pickup without address or postal code", () => {
  assert.equal(bookingSchema.safeParse({ ...validBooking, website: "https://spam.test" }).success, false);
  assert.equal(bookingSchema.safeParse({ ...validBooking, addressLine: "" }).success, false);
  assert.equal(bookingSchema.safeParse({ ...validBooking, postalCode: "" }).success, false);
});

test("accepts a PRELAUNCH interest payload without a date", () => {
  assert.equal(bookingSchema.safeParse(validBooking).success, true);
});

test("accepts an ACTIVE payload with preferred date and optional time", () => {
  const parsed = bookingSchema.safeParse({
    ...validBooking,
    preferredDate: "2026-10-20",
    preferredTimeSlot: "09:00-12:00",
  });
  assert.equal(parsed.success, true);
});

test("empty preferred date becomes null", () => {
  const parsed = bookingSchema.safeParse({ ...validBooking, preferredDate: "" });
  assert.equal(parsed.success, true);
  if (parsed.success) assert.equal(parsed.data.preferredDate, null);
});

const validInquiry = {
  locale: "en" as const,
  businessName: "Caliza",
  businessType: "restaurant",
  contactName: "Chef",
  email: "chef@example.com",
  phone: "600000000",
  estimatedKnives: 40,
  frequency: "weekly",
  needsPickup: true,
  address: "Nueva Andalucía",
  consent: true as const,
};

test("rejects invalid business inquiry input", () => {
  assert.equal(inquirySchema.safeParse({ ...validInquiry, email: "nope" }).success, false);
  assert.equal(inquirySchema.safeParse({ ...validInquiry, estimatedKnives: 0 }).success, false);
  assert.equal(inquirySchema.safeParse({ ...validInquiry, address: "" }).success, false);
  assert.equal(inquirySchema.safeParse({ ...validInquiry, frequency: "" }).success, false);
});

test("accepts a valid business inquiry payload", () => {
  assert.equal(inquirySchema.safeParse(validInquiry).success, true);
});
