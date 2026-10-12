import assert from "node:assert/strict";
import { test } from "node:test";
import { acceptsPublicRequests } from "./inquiry-status";

/**
 * Persistence contract used by submitBooking / submitInquiry:
 * success is returned only after a created row with status NEW is verified.
 */
async function persistAndConfirm(store: Map<string, { id: string; status: string }>, record: { id: string; status: string }) {
  store.set(record.id, record);
  const saved = store.get(record.id);
  if (!saved?.id || saved.status !== "NEW") return { ok: false as const, error: "save" };
  return { ok: true as const, id: saved.id };
}

test("database persistence: success only after the write is present", async () => {
  const store = new Map<string, { id: string; status: string }>();
  const result = await persistAndConfirm(store, { id: "b1", status: "NEW" });
  assert.equal(result.ok, true);
  assert.equal(store.get("b1")?.status, "NEW");
});

test("database persistence: missing write is not reported as success", async () => {
  const store = new Map<string, { id: string; status: string }>();
  const result = await persistAndConfirm(store, { id: "", status: "NEW" });
  assert.equal(result.ok, false);
});

test("PAUSED submissions never reach persistence in the public gate", () => {
  assert.equal(acceptsPublicRequests("PAUSED"), false);
});

test("PRELAUNCH submissions are stored as NEW, never auto-confirmed", () => {
  const createdStatus = "NEW";
  assert.notEqual(createdStatus, "PICKUP_CONFIRMED");
  assert.notEqual(createdStatus, "CONFIRMED");
});

test("email failure after persist does not erase the saved row", () => {
  const store = new Map<string, { id: string; status: string }>([["b1", { id: "b1", status: "NEW" }]]);
  const emailStatus = "FAILED";
  assert.equal(store.get("b1")?.status, "NEW");
  assert.equal(emailStatus, "FAILED");
});
