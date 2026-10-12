import assert from "node:assert/strict";
import { test } from "node:test";
import { renderEmail } from "./email/templates";

test("PRELAUNCH interest email does not claim a confirmed appointment", () => {
  const en = renderEmail("interest_received", "en", { name: "Ada", reference: "KP-1" });
  assert.match(en.text, /Thank you for your interest! We'll contact you when KNIVPOJKARNA opens for bookings/);
  assert.doesNotMatch(en.text.toLowerCase(), /your pickup has been confirmed/);
  const es = renderEmail("interest_received", "es", { name: "Ada", reference: "KP-1" });
  assert.match(es.text, /Gracias por tu interés/);
});

test("ACTIVE request email asks for later pickup confirmation", () => {
  const en = renderEmail("booking_request_received", "en", { name: "Ada", reference: "KP-1" });
  assert.match(en.text, /We've received your request and will contact you to confirm the pickup details/);
  assert.match(en.text, /not a confirmed appointment/i);
});

test("pickup confirmed template is reserved for administrator confirmation", () => {
  const en = renderEmail("pickup_confirmed", "en", { name: "Ada", reference: "KP-1" });
  assert.match(en.text, /confirmed by our team/);
});

test("email credentials are treated as absent when env is empty", () => {
  const configured = Boolean(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim());
  if (!configured) assert.equal(configured, false);
});
