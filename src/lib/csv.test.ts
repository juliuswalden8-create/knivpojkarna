import assert from "node:assert/strict";
import { test } from "node:test";
import { csvCell, toCsv } from "./csv";

test("csvCell quotes commas and doubled quotes", () => {
  assert.equal(csvCell('a,b'), '"a,b"');
  assert.equal(csvCell('say "hi"'), '"say ""hi"""');
});

test("csvCell prefixes formula characters", () => {
  assert.equal(csvCell("=CMD()"), "'=CMD()");
  assert.equal(csvCell("+1+1"), "'+1+1");
  assert.equal(csvCell("-2"), "'-2");
  assert.equal(csvCell("@SUM(A1)"), "'@SUM(A1)");
});

test("toCsv writes header and rows", () => {
  const out = toCsv(["name", "email"], [["Jane", "jane@example.com"]]);
  assert.equal(out, "name,email\nJane,jane@example.com");
});
