import assert from "node:assert/strict";
import { test } from "node:test";
import { NextRequest } from "next/server";
import sitemap from "../app/sitemap";
import { spanishCanonicalRedirect } from "../i18n/routes";
import { proxy } from "../proxy";

const duplicates = [
  ["/es/book", "/es/reservar"],
  ["/es/prices", "/es/precios"],
  ["/es/business", "/es/empresas"],
  ["/es/about", "/es/sobre-nosotros"],
  ["/es/service-areas", "/es/zonas-de-servicio"],
  ["/es/privacy", "/es/privacidad"],
] as const;

test("English slugs under /es map to the canonical Spanish path", () => {
  for (const [from, to] of duplicates) {
    assert.equal(spanishCanonicalRedirect(from), to);
    assert.equal(spanishCanonicalRedirect(to), null);
    assert.equal(spanishCanonicalRedirect(`${to}?x=1`), null);
  }
  assert.equal(spanishCanonicalRedirect("/es/book/success"), "/es/reservar/success");
  assert.equal(spanishCanonicalRedirect("/es/reservar/success"), null);
  assert.equal(spanishCanonicalRedirect("/en/book"), null);
  assert.equal(spanishCanonicalRedirect("/en/reservar"), null);
  assert.equal(spanishCanonicalRedirect("/es/boka"), null);
  assert.equal(spanishCanonicalRedirect("/es"), null);
});

test("duplicate Spanish URLs redirect permanently and keep the query string", () => {
  for (const [from, to] of duplicates) {
    const response = proxy(new NextRequest(`https://www.bladebud.com${from}?ref=audit&n=1`));
    assert.equal(response.status, 308, from);
    assert.equal(response.headers.get("location"), `https://www.bladebud.com${to}?ref=audit&n=1`);
    const again = proxy(new NextRequest(response.headers.get("location")!));
    assert.notEqual(again.status, 308, to);
  }

  const nested = proxy(new NextRequest("https://www.bladebud.com/es/book/success?ref=1"));
  assert.equal(nested.status, 308);
  assert.equal(nested.headers.get("location"), "https://www.bladebud.com/es/reservar/success?ref=1");
  assert.notEqual(proxy(new NextRequest("https://www.bladebud.com/es/reservar/success?ref=1")).status, 308);
  assert.notEqual(proxy(new NextRequest("https://www.bladebud.com/en/reservar")).status, 308);
  assert.notEqual(proxy(new NextRequest("https://www.bladebud.com/en/book")).status, 308);
});

test("sitemap stays on the canonical localized URLs", () => {
  const keys = ["NODE_ENV", "NEXT_PUBLIC_SITE_URL"];
  const previous = new Map(keys.map((key) => [key, process.env[key]]));
  const values: Record<string, string> = { NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://www.bladebud.com" };
  for (const [key, value] of Object.entries(values)) process.env[key] = value;
  try {
    const urls = sitemap().map((entry) => entry.url);
    assert.equal(urls.length, 14);
    for (const [, to] of duplicates) {
      assert.equal(urls.includes(`https://www.bladebud.com${to}`), true);
    }
    for (const [from] of duplicates) {
      assert.equal(urls.includes(`https://www.bladebud.com${from}`), false);
    }
  } finally {
    for (const key of keys) {
      const value = previous.get(key);
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
