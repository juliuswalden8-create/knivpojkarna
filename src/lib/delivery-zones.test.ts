import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calculateDeliveryQuote,
  DEFAULT_DELIVERY_FEES,
  resolveDeliveryLocation,
} from "./delivery-zones";
import { AREA_OTHER_IN_CORRIDOR, AREA_OUTSIDE, resolveServiceArea } from "./service-area";

const fees = DEFAULT_DELIVERY_FEES;

function quoteFor(areaName: string, subtotal: number, extra?: { areaDetail?: string; addressLine?: string; postalCode?: string }) {
  const location = resolveDeliveryLocation({
    areaName,
    areaDetail: extra?.areaDetail,
    addressLine: extra?.addressLine,
    postalCode: extra?.postalCode,
  });
  return { location, quote: calculateDeliveryQuote(subtotal, location, fees) };
}

test("zone 1 roundtrip is €5 for Marbella, San Pedro, Puerto Banús and Nueva Andalucía", () => {
  for (const town of ["Marbella", "San Pedro de Alcántara", "Puerto Banús", "Nueva Andalucía"]) {
    const { quote } = quoteFor(town, 2700);
    assert.equal(quote.deliveryZone, "ZONE_1", town);
    assert.equal(quote.deliveryFeeCents, 500, town);
    assert.equal(quote.estimatedTotalCents, 3200, town);
    assert.equal(quote.deliveryFeeWaived, false, town);
  }
});

test("zone 2 roundtrip is €8 for Elviria, Cabopino and Calahonda", () => {
  for (const town of ["Elviria", "Cabopino", "Calahonda"]) {
    const { quote } = quoteFor(town, 2700);
    assert.equal(quote.deliveryZone, "ZONE_2", town);
    assert.equal(quote.deliveryFeeCents, 800, town);
    assert.equal(quote.estimatedTotalCents, 3500, town);
  }
});

test("zone 3 roundtrip is €12 for Mijas Costa and Fuengirola", () => {
  for (const town of ["Mijas Costa", "Fuengirola"]) {
    const { quote } = quoteFor(town, 2700);
    assert.equal(quote.deliveryZone, "ZONE_3", town);
    assert.equal(quote.deliveryFeeCents, 1200, town);
    assert.equal(quote.estimatedTotalCents, 3900, town);
  }
});

test("intermediate corridor neighbourhoods map to the correct zone", () => {
  assert.equal(quoteFor(AREA_OTHER_IN_CORRIDOR, 1800, { areaDetail: "Guadalmina" }).quote.deliveryZone, "ZONE_1");
  assert.equal(quoteFor(AREA_OTHER_IN_CORRIDOR, 1800, { areaDetail: "Artola" }).quote.deliveryZone, "ZONE_2");
  assert.equal(quoteFor(AREA_OTHER_IN_CORRIDOR, 1800, { areaDetail: "La Cala de Mijas" }).quote.deliveryZone, "ZONE_3");
  assert.equal(quoteFor(AREA_OTHER_IN_CORRIDOR, 1800, { areaDetail: "Los Boliches" }).quote.deliveryFeeCents, 1200);
});

test("specific neighbourhood beats parent municipality (Elviria, Marbella is zone 2)", () => {
  const { quote } = quoteFor(AREA_OTHER_IN_CORRIDOR, 1800, { areaDetail: "Elviria, Marbella" });
  assert.equal(quote.deliveryZone, "ZONE_2");
  assert.equal(quote.deliveryFeeCents, 800);
});

test("Calahonda in Mijas Costa stays zone 2, not the generic Mijas Costa fee", () => {
  const { quote } = quoteFor("Mijas Costa", 1800, { addressLine: "Sitio de Calahonda, 42" });
  assert.equal(quote.deliveryZone, "ZONE_2");
  assert.equal(quote.deliveryFeeCents, 800);
});

test("delivery fee includes pickup and return once — never doubled", () => {
  const { quote } = quoteFor("Marbella", 1800);
  assert.equal(quote.deliveryFeeCents, 500);
  assert.notEqual(quote.deliveryFeeCents, 1000);
  assert.equal(quote.estimatedTotalCents, 1800 + 500);
});

test("€49 sharpening subtotal makes delivery free in every zone", () => {
  for (const town of ["Marbella", "Elviria", "Fuengirola"]) {
    const { quote } = quoteFor(town, 4900);
    assert.equal(quote.deliveryFeeCents, 0, town);
    assert.equal(quote.deliveryFeeWaived, true, town);
    assert.equal(quote.estimatedTotalCents, 4900, town);
    assert.equal(quote.sharpeningSubtotalCents, 4900, town);
  }
});

test("€49 still waives delivery when the area needs review, without assigning a cheap zone", () => {
  const { quote } = quoteFor(AREA_OTHER_IN_CORRIDOR, 4900, { areaDetail: "Las Chapas" });
  assert.equal(quote.deliveryNeedsReview, true);
  assert.equal(quote.deliveryZone, "REVIEW");
  assert.equal(quote.deliveryFeeWaived, true);
  assert.equal(quote.deliveryFeeCents, 0);
  assert.equal(quote.estimatedTotalCents, 4900);
});

test("free-delivery threshold ignores the total including delivery", () => {
  const { quote } = quoteFor("Fuengirola", 2700);
  assert.equal(quote.sharpeningSubtotalCents, 2700);
  assert.equal(quote.deliveryFeeCents, 1200);
  assert.equal(quote.estimatedTotalCents, 3900);
  assert.equal(quote.deliveryFeeWaived, false);
  assert.ok(quote.estimatedTotalCents < fees.freeThresholdCents);
});

test("€48.99 subtotal still pays the zone fee", () => {
  const { quote } = quoteFor("Marbella", 4899);
  assert.equal(quote.deliveryFeeWaived, false);
  assert.equal(quote.deliveryFeeCents, 500);
  assert.equal(quote.estimatedTotalCents, 5399);
});

test("unsupported towns are outside the service area and are not given a zone fee", () => {
  for (const town of ["Estepona", "Benalmádena", "Torremolinos", "Málaga"]) {
    const { location, quote } = quoteFor(AREA_OUTSIDE, 2700, { areaDetail: town });
    assert.equal(location.inServiceArea, false, town);
    assert.equal(quote.deliveryZone, "OUTSIDE", town);
    assert.equal(quote.deliveryFeeCents, null, town);
    assert.equal(quote.estimatedTotalCents, 2700, town);
  }
});

test("ambiguous boundary locations are flagged for review and do not get the cheapest zone", () => {
  for (const place of ["Las Chapas", "Los Monteros", "Riviera del Sol", "Mijas"]) {
    const { location, quote } = quoteFor(AREA_OTHER_IN_CORRIDOR, 2700, { areaDetail: place });
    assert.equal(location.needsReview, true, place);
    assert.equal(quote.deliveryZone, "REVIEW", place);
    assert.equal(quote.deliveryFeeCents, null, place);
    assert.notEqual(quote.deliveryFeeCents, 500, place);
    assert.equal(quote.estimatedTotalCents, 2700, place);
  }
});

test("unknown corridor free-text is flagged for review instead of the cheapest zone", () => {
  const { location, quote } = quoteFor(AREA_OTHER_IN_CORRIDOR, 1800, { areaDetail: "Urbanización Inventada 12" });
  assert.equal(location.inServiceArea, true);
  assert.equal(location.needsReview, true);
  assert.equal(quote.deliveryFeeCents, null);
  assert.equal(quote.estimatedTotalCents, 1800);
});

test("shared postal codes without a town are flagged for review", () => {
  const { quote } = quoteFor(AREA_OTHER_IN_CORRIDOR, 1800, { areaDetail: "Urbanización Sol", postalCode: "29649" });
  assert.equal(quote.deliveryZone, "REVIEW");
  assert.equal(quote.deliveryFeeCents, null);
});

test("unique postal code can assign a zone when the town is otherwise unknown", () => {
  const { quote } = quoteFor(AREA_OTHER_IN_CORRIDOR, 1800, { areaDetail: "Calle Luna 4", postalCode: "29670" });
  assert.equal(quote.deliveryZone, "ZONE_1");
  assert.equal(quote.deliveryFeeCents, 500);
});

test("conflicting town and unique postal code is flagged for review", () => {
  const { quote } = quoteFor("Fuengirola", 1800, { postalCode: "29670" });
  assert.equal(quote.deliveryZone, "REVIEW");
  assert.equal(quote.deliveryFeeCents, null);
});

test("stored quotes stay unchanged if admin later raises zone fees", () => {
  const original = quoteFor("Marbella", 2700).quote;
  const laterFees = { ...fees, zone1Cents: 9000, freeThresholdCents: 100 };
  const location = resolveDeliveryLocation({ areaName: "Marbella" });
  const recalculated = calculateDeliveryQuote(2700, location, laterFees);
  assert.equal(original.deliveryFeeCents, 500);
  assert.equal(original.estimatedTotalCents, 3200);
  assert.equal(recalculated.deliveryFeeCents, 0);
  assert.notEqual(original.deliveryFeeCents, recalculated.deliveryFeeCents);
});

test("resolveServiceArea keeps listed towns inside the area", () => {
  assert.equal(resolveServiceArea("Marbella").inServiceArea, true);
  assert.equal(resolveServiceArea("Fuengirola").inServiceArea, true);
  assert.equal(resolveServiceArea("San Pedro de Alcántara").inServiceArea, true);
  assert.equal(resolveServiceArea("Elviria").zone, "ZONE_2");
});
