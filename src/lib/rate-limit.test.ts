import assert from "node:assert/strict";
import { test } from "node:test";
import { clientKey, rateLimitMemory } from "./rate-limit";

test("clientKey falls back when IP is missing", () => {
  assert.equal(clientKey("book", null), "book:unknown");
});

test("in-memory limiter blocks after the window is exhausted", () => {
  const key = `test-${Date.now()}`;
  const first = rateLimitMemory(key, 2, 60_000);
  const second = rateLimitMemory(key, 2, 60_000);
  const third = rateLimitMemory(key, 2, 60_000);
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.equal(third.ok, false);
});
