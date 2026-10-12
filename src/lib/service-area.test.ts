import assert from "node:assert/strict";
import { test } from "node:test";
import {
  AREA_OTHER_IN_CORRIDOR,
  AREA_OUTSIDE,
  isWithinDuplicateWindow,
  resolveServiceArea,
} from "./service-area";

test("listed launch towns are inside the service area", () => {
  assert.deepEqual(resolveServiceArea("Marbella"), { areaName: "Marbella", inServiceArea: true });
  assert.equal(resolveServiceArea("Fuengirola").inServiceArea, true);
  assert.equal(resolveServiceArea("San Pedro de Alcántara").inServiceArea, true);
});

test("other neighbourhoods in the corridor are accepted", () => {
  const area = resolveServiceArea(AREA_OTHER_IN_CORRIDOR, "Elviria");
  assert.equal(area.inServiceArea, true);
  assert.equal(area.areaName, "Elviria");
});

test("outside-area interest is stored without pickup availability", () => {
  const area = resolveServiceArea(AREA_OUTSIDE, "Estepona");
  assert.equal(area.inServiceArea, false);
  assert.equal(area.areaName, "Estepona");
});

test("duplicate window covers repeated clicks within two minutes", () => {
  const now = new Date("2026-10-12T16:00:00Z");
  assert.equal(isWithinDuplicateWindow(new Date("2026-10-12T15:59:00Z"), now), true);
  assert.equal(isWithinDuplicateWindow(new Date("2026-10-12T15:57:00Z"), now), false);
});
