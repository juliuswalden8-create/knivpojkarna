import assert from "node:assert/strict";
import { test } from "node:test";
import { SignJWT } from "jose";
import { readSessionVersion, sessionStillValid, signAdminToken, verifyAdminToken } from "./auth";

const TEST_SECRET = "unit-test-auth-secret";

test("a session remains valid until the password generation changes", async () => {
  process.env.AUTH_SECRET = TEST_SECRET;
  const token = await signAdminToken({ id: "admin-1", email: "admin@example.com", sessionVersion: 2 });
  const payload = await verifyAdminToken(token);
  assert.ok(payload);
  assert.equal(payload.sub, "admin-1");
  assert.equal(readSessionVersion(payload.sv), 2);
  assert.equal(sessionStillValid(readSessionVersion(payload.sv), 2), true);
  assert.equal(sessionStillValid(readSessionVersion(payload.sv), 3), false);
});

test("a session issued before versioning ends when the password changes", async () => {
  process.env.AUTH_SECRET = TEST_SECRET;
  const legacy = await new SignJWT({ email: "admin@example.com" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin-1")
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(TEST_SECRET));
  const payload = await verifyAdminToken(legacy);
  assert.ok(payload);
  assert.equal(readSessionVersion(payload.sv), 0);
  assert.equal(sessionStillValid(readSessionVersion(payload.sv), 1), false);
});

test("a malformed session version does not match a changed password", () => {
  assert.equal(readSessionVersion("0"), 0);
  assert.equal(readSessionVersion(-1), 0);
  assert.equal(readSessionVersion(1.5), 0);
  assert.equal(sessionStillValid(readSessionVersion("nope"), 1), false);
});
