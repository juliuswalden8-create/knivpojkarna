import assert from "node:assert/strict";
import { test } from "node:test";
import { customerWhatsAppHref, normalizeCustomerPhone } from "./customer-whatsapp";

test("normalizes Spanish national numbers to country code 34", () => {
  assert.equal(normalizeCustomerPhone("600 000 000"), "34600000000");
  assert.equal(normalizeCustomerPhone("+34 600-000-000"), "34600000000");
  assert.equal(normalizeCustomerPhone("0034 600000000"), "34600000000");
});

test("keeps an existing international number and rejects invalid ones", () => {
  assert.equal(normalizeCustomerPhone("+46 70 123 45 67"), "46701234567");
  assert.equal(normalizeCustomerPhone(""), null);
  assert.equal(normalizeCustomerPhone("call me"), null);
  assert.equal(normalizeCustomerPhone("123"), null);
  assert.equal(normalizeCustomerPhone("000000000"), null);
});

test("builds a draft link in the customer language with the reference", () => {
  const en = customerWhatsAppHref("600000000", "en", "KP-AB23CD");
  assert.ok(en);
  const enUrl = new URL(en!);
  assert.equal(enUrl.origin + enUrl.pathname, "https://wa.me/34600000000");
  assert.match(enUrl.searchParams.get("text") ?? "", /knife sharpening request/);
  assert.match(enUrl.searchParams.get("text") ?? "", /KP-AB23CD/);

  const es = customerWhatsAppHref("600000000", "es", "KP-AB23CD");
  assert.match(new URL(es!).searchParams.get("text") ?? "", /solicitud de afilado/);

  const sv = customerWhatsAppHref("600000000", "sv", "KP-AB23CD");
  assert.match(new URL(sv!).searchParams.get("text") ?? "", /knife sharpening request/);
});

test("hides the link when the phone or reference is unusable", () => {
  assert.equal(customerWhatsAppHref("", "en", "KP-AB23CD"), null);
  assert.equal(customerWhatsAppHref("600000000", "en", "notes: internal"), null);
});
