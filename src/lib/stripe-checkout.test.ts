import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCheckoutLineItems, isPayableQuote } from "./stripe-checkout";
import type { DeliveryQuote } from "./delivery-zones";

function quote(overrides: Partial<DeliveryQuote> = {}): DeliveryQuote {
  return {
    sharpeningSubtotalCents: 2700,
    deliveryFeeCents: 500,
    listedDeliveryFeeCents: 500,
    deliveryZone: "ZONE_1",
    deliveryNeedsReview: false,
    deliveryFeeWaived: false,
    estimatedTotalCents: 3200,
    inServiceArea: true,
    ...overrides,
  };
}

test("payable quotes need a firm in-area delivery fee", () => {
  assert.equal(isPayableQuote(quote()), true);
  assert.equal(isPayableQuote(quote({ deliveryFeeCents: 0, deliveryFeeWaived: true, estimatedTotalCents: 2700 })), true);
  assert.equal(isPayableQuote(quote({ deliveryFeeCents: null, deliveryNeedsReview: true, estimatedTotalCents: 2700 })), false);
  assert.equal(isPayableQuote(quote({ inServiceArea: false, deliveryFeeCents: null, deliveryZone: "OUTSIDE", estimatedTotalCents: 2700 })), false);
});

test("line items match the server total and never invent a cheaper zone fee", () => {
  const items = buildCheckoutLineItems("Kitchen Essentials", quote(), { delivery: "Pickup & return" });
  assert.ok(items);
  assert.deepEqual(items, [
    { name: "Kitchen Essentials", amountCents: 2700 },
    { name: "Pickup & return", amountCents: 500 },
  ]);
});

test("waived delivery is package-only and still matches the total", () => {
  const items = buildCheckoutLineItems(
    "Complete Collection",
    quote({
      sharpeningSubtotalCents: 4900,
      deliveryFeeCents: 0,
      deliveryFeeWaived: true,
      estimatedTotalCents: 4900,
    }),
    { delivery: "Pickup & return" },
  );
  assert.deepEqual(items, [{ name: "Complete Collection", amountCents: 4900 }]);
});

test("mismatched totals are refused", () => {
  const items = buildCheckoutLineItems(
    "Kitchen Essentials",
    quote({ estimatedTotalCents: 9999 }),
    { delivery: "Pickup & return" },
  );
  assert.equal(items, null);
});
