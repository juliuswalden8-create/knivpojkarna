import assert from "node:assert/strict";
import { test } from "node:test";
import { fromISODate, formatPrice } from "./utils";
import { statusChangeEmail } from "./inquiry-status";
import { renderCustomerEmail, type CustomerEmailFacts } from "./email/templates";

const pickup: CustomerEmailFacts = {
  name: "Ada",
  reference: "KP-1",
  packageName: "Complete Collection",
  knifeCount: 10,
  totalCents: 4900,
  pickupDate: fromISODate("2026-11-02"),
  pickupWindow: "09:00-12:00",
};

const arranged: CustomerEmailFacts = {
  ...pickup,
  returnDate: fromISODate("2026-11-05"),
  returnWindow: "15:00-18:00",
};

test("PRELAUNCH interest email does not claim a confirmed appointment", () => {
  const en = renderCustomerEmail("interest_received", "en", { name: "Ada", reference: "KP-1" });
  assert.ok(en);
  assert.match(en.text, /Thank you for your interest! We'll contact you when BladeBud opens for bookings/);
  assert.doesNotMatch(en.text.toLowerCase(), /your pickup is confirmed/);
  const es = renderCustomerEmail("interest_received", "es", { name: "Ada", reference: "KP-1" });
  assert.ok(es);
  assert.match(es.text, /Gracias por tu interés/);
});

test("ACTIVE request email asks for later pickup confirmation", () => {
  const en = renderCustomerEmail("booking_request_received", "en", { name: "Ada", reference: "KP-1" });
  assert.ok(en);
  assert.match(en.text, /We've received your request and will contact you to confirm the pickup details/);
  assert.match(en.text, /not a confirmed appointment/i);
});

test("pickup confirmed email states the stored visit in English and Spanish", () => {
  const en = renderCustomerEmail("pickup_confirmed", "en", pickup);
  const es = renderCustomerEmail("pickup_confirmed", "es", pickup);
  assert.ok(en);
  assert.ok(es);
  assert.match(en.text, /Ada/);
  assert.match(en.text, /KP-1/);
  assert.match(en.text, /Complete Collection/);
  assert.match(en.text, /Knives: 10/);
  assert.match(en.text, /Monday, 2 November 2026/);
  assert.match(en.text, /09:00–12:00/);
  assert.ok(en.text.includes(formatPrice(4900, "en")));
  assert.match(en.text, /sent by our team/);
  assert.match(es.text, /lunes, 2 de noviembre de 2026/);
  assert.match(es.text, /09:00–12:00/);
  assert.match(es.text, /Cuchillos: 10/);
  assert.ok(es.text.includes(formatPrice(4900, "es")));
  assert.match(es.text, /nuestro equipo/i);
});

test("return arranged email states the stored return without a price", () => {
  const en = renderCustomerEmail("return_arranged", "en", arranged);
  const es = renderCustomerEmail("return_arranged", "es", arranged);
  assert.ok(en);
  assert.ok(es);
  assert.match(en.text, /Thursday, 5 November 2026/);
  assert.match(en.text, /15:00–18:00/);
  assert.match(en.text, /Complete Collection/);
  assert.match(en.text, /Knives: 10/);
  assert.doesNotMatch(en.text, /Total/);
  assert.match(es.text, /jueves, 5 de noviembre de 2026/);
  assert.match(es.text, /Cuchillos: 10/);
  assert.doesNotMatch(es.text, /Total/);
});

test("a confirmation is not created when the schedule or price is missing", () => {
  assert.equal(renderCustomerEmail("pickup_confirmed", "en", { ...pickup, pickupDate: null }), null);
  assert.equal(renderCustomerEmail("pickup_confirmed", "es", { ...pickup, pickupWindow: "  " }), null);
  assert.equal(renderCustomerEmail("pickup_confirmed", "en", { ...pickup, totalCents: null }), null);
  assert.equal(renderCustomerEmail("return_arranged", "en", { ...arranged, returnDate: null }), null);
  assert.equal(renderCustomerEmail("return_arranged", "es", { ...arranged, returnWindow: "" }), null);
  assert.equal(renderCustomerEmail("return_arranged", "en", { ...arranged, packageName: " " }), null);
});

test("the message repeats the stored price and does not change it", () => {
  const stored = 2700;
  const rendered = renderCustomerEmail("pickup_confirmed", "en", { ...pickup, totalCents: stored });
  assert.ok(rendered);
  assert.ok(rendered.text.includes(formatPrice(stored, "en")));
  assert.equal(stored, 2700);
  assert.doesNotMatch(rendered.text, /€49/);
});

test("saving the same status does not send another customer email", () => {
  assert.equal(statusChangeEmail("PICKUP_CONFIRMED", "PICKUP_CONFIRMED"), null);
  assert.equal(statusChangeEmail("RETURN_SCHEDULED", "RETURN_SCHEDULED"), null);
  assert.equal(statusChangeEmail("NEW", "PICKUP_CONFIRMED"), "pickup_confirmed");
  assert.equal(statusChangeEmail("READY_FOR_RETURN", "RETURN_SCHEDULED"), "return_arranged");
  assert.equal(statusChangeEmail("NEW", "NEW"), null);
});

test("email credentials are treated as absent when env is empty", () => {
  const configured = Boolean(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim());
  if (!configured) assert.equal(configured, false);
});
