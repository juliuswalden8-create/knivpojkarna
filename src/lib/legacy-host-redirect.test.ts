import assert from "node:assert/strict";
import { test } from "node:test";
import { legacyHostRedirect, legacyHostRedirectRules, LEGACY_VERCEL_HOST } from "./legacy-host-redirect";

test("the old Vercel host keeps the path and query on a 308 to BladeBud", () => {
  assert.equal(legacyHostRedirect("knivpojkarna.vercel.app", "/"), "https://www.bladebud.com/");
  assert.equal(legacyHostRedirect("knivpojkarna.vercel.app", "/en"), "https://www.bladebud.com/en");
  assert.equal(legacyHostRedirect("knivpojkarna.vercel.app", "/es"), "https://www.bladebud.com/es");
  assert.equal(
    legacyHostRedirect("knivpojkarna.vercel.app", "/en/prices", "?x=1"),
    "https://www.bladebud.com/en/prices?x=1",
  );
  assert.equal(
    legacyHostRedirect("KNIVPOJKARNA.vercel.app:443", "/es/book", "ref=old"),
    "https://www.bladebud.com/es/book?ref=old",
  );
});

test("BladeBud and preview hosts are not redirected", () => {
  assert.equal(legacyHostRedirect("www.bladebud.com", "/en"), null);
  assert.equal(legacyHostRedirect("bladebud.com", "/es"), null);
  assert.equal(legacyHostRedirect("knivpojkarna-git-main.vercel.app", "/en"), null);
  assert.equal(legacyHostRedirect("knivpojkarna-m79t0623r-juliuswalden8-creates-projects.vercel.app", "/"), null);
  assert.equal(legacyHostRedirect("localhost:3000", "/en"), null);
  assert.equal(legacyHostRedirect(null, "/en"), null);
});

test("config rules are permanent 308s limited to the exact old host", () => {
  const rules = legacyHostRedirectRules();
  assert.equal(rules.length, 2);
  for (const rule of rules) {
    assert.equal(rule.statusCode, 308);
    assert.deepEqual(rule.has, [{ type: "host", value: LEGACY_VERCEL_HOST }]);
    assert.equal(rule.destination.startsWith("https://www.bladebud.com"), true);
    assert.equal(rule.destination.includes("knivpojkarna.vercel.app"), false);
  }
});
