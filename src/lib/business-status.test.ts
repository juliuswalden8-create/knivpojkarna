import assert from "node:assert/strict";
import { test } from "node:test";
import { parseBusinessStatus, resolveBusinessStatus } from "./business-status";

test("parseBusinessStatus defaults unknown values to PRELAUNCH", () => {
  assert.equal(parseBusinessStatus("ACTIVE"), "ACTIVE");
  assert.equal(parseBusinessStatus("nope"), "PRELAUNCH");
});

test("PREVIEW_FORCE_BUSINESS_STATUS is ignored outside Vercel Preview", () => {
  assert.equal(
    resolveBusinessStatus("PRELAUNCH", {
      VERCEL_ENV: "production",
      PREVIEW_FORCE_BUSINESS_STATUS: "ACTIVE",
    }),
    "PRELAUNCH",
  );
  assert.equal(
    resolveBusinessStatus("PRELAUNCH", {
      VERCEL_ENV: "development",
      PREVIEW_FORCE_BUSINESS_STATUS: "ACTIVE",
    }),
    "PRELAUNCH",
  );
});

test("Preview can force ACTIVE without changing the stored production setting", () => {
  assert.equal(
    resolveBusinessStatus("PRELAUNCH", {
      VERCEL_ENV: "preview",
      PREVIEW_FORCE_BUSINESS_STATUS: "ACTIVE",
    }),
    "ACTIVE",
  );
  assert.equal(
    resolveBusinessStatus("PRELAUNCH", {
      VERCEL_ENV: "preview",
    }),
    "PRELAUNCH",
  );
});
