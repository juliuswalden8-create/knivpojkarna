import assert from "node:assert/strict";
import { test } from "node:test";
import { shouldBootstrapAdmin } from "./admin-bootstrap";

test("a fresh database can create the first admin account", () => {
  assert.equal(shouldBootstrapAdmin(0, false), true);
});

test("an existing admin account is not recreated", () => {
  assert.equal(shouldBootstrapAdmin(1, false), false);
  assert.equal(shouldBootstrapAdmin(1, true), false);
});

test("deleting the admin account does not allow the bootstrap password to recreate it", () => {
  assert.equal(shouldBootstrapAdmin(0, true), false);
});
