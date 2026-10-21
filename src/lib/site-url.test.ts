import assert from "node:assert/strict";
import { test } from "node:test";
import sitemap from "../app/sitemap";
import robots from "../app/robots";
import { enabledLocales } from "../i18n/config";
import { publicPageMeta } from "./page-meta";
import { CANONICAL_SITE_URL, siteUrl } from "./site";

const CANONICAL = "https://www.bladebud.com";

function withEnv(values: Record<string, string | undefined>, run: () => void) {
  const previous = new Map<string, string | undefined>();
  for (const key of Object.keys(values)) previous.set(key, process.env[key]);
  try {
    for (const [key, value] of Object.entries(values)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    run();
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("production site URL ignores deployment hosts and local defaults", () => {
  assert.equal(CANONICAL_SITE_URL, CANONICAL);
  const cases: Array<[string | undefined, string]> = [
    [undefined, CANONICAL],
    ["", CANONICAL],
    ["http://localhost:3000", CANONICAL],
    ["http://127.0.0.1:3000", CANONICAL],
    ["https://knivpojkarna.vercel.app", CANONICAL],
    ["https://knivpojkarna.vercel.app/", CANONICAL],
    ["https://knivpojkarna-git-preview.vercel.app", CANONICAL],
    ["https://bladebud.com", CANONICAL],
    ["https://www.bladebud.com", CANONICAL],
    ["https://www.bladebud.com/", CANONICAL],
    ["https://knifepost.com", CANONICAL],
    ["https://www.knifepost.com", CANONICAL],
  ];
  for (const [configured, expected] of cases) {
    withEnv({ NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: configured }, () => {
      assert.equal(siteUrl(), expected, `configured ${configured ?? "(unset)"}`);
    });
  }
});

test("local development keeps a localhost site URL", () => {
  withEnv({ NODE_ENV: "development", NEXT_PUBLIC_SITE_URL: "http://localhost:3000" }, () => {
    assert.equal(siteUrl(), "http://localhost:3000");
  });
  withEnv({ NODE_ENV: "development", NEXT_PUBLIC_SITE_URL: "https://knivpojkarna.vercel.app" }, () => {
    assert.equal(siteUrl(), CANONICAL);
  });
});

test("public pages declare self-canonical bladebud URLs and EN/ES alternates", () => {
  withEnv({ NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://knivpojkarna.vercel.app" }, () => {
    assert.deepEqual(enabledLocales, ["en", "es"]);

    const en = publicPageMeta("en", "home", "Home", "English home");
    assert.equal(en.alternates?.canonical, "https://www.bladebud.com/en");
    assert.deepEqual(en.alternates?.languages, {
      en: "https://www.bladebud.com/en",
      es: "https://www.bladebud.com/es",
      "x-default": "https://www.bladebud.com/en",
    });
    assert.equal(en.openGraph?.url, "https://www.bladebud.com/en");

    const es = publicPageMeta("es", "home", "Inicio", "Spanish home");
    assert.equal(es.alternates?.canonical, "https://www.bladebud.com/es");
    assert.equal(es.alternates?.languages?.es, "https://www.bladebud.com/es");
    assert.equal(es.alternates?.languages?.en, "https://www.bladebud.com/en");

    const prices = publicPageMeta("en", "prices", "Prices", "Prices");
    assert.equal(prices.alternates?.canonical, "https://www.bladebud.com/en/prices");
    assert.equal(prices.alternates?.languages?.es, "https://www.bladebud.com/es/precios");
    assert.equal(prices.alternates?.languages?.["x-default"], "https://www.bladebud.com/en/prices");

    const book = publicPageMeta("es", "book", "Reservar", "Reservar");
    assert.equal(book.alternates?.canonical, "https://www.bladebud.com/es/reservar");
    assert.equal(book.alternates?.languages?.en, "https://www.bladebud.com/en/book");

    const urls = sitemap().map((entry) => entry.url);
    assert.equal(urls.includes("https://www.bladebud.com/en"), true);
    assert.equal(urls.includes("https://www.bladebud.com/es"), true);
    assert.equal(urls.includes("https://www.bladebud.com/en/prices"), true);
    assert.equal(urls.includes("https://www.bladebud.com/es/precios"), true);
    assert.equal(urls.some((url) => url.includes("/sv")), false);
    assert.equal(urls.some((url) => url.includes("vercel.app")), false);
    assert.equal(urls.every((url) => url.startsWith("https://www.bladebud.com/")), true);
    assert.equal(robots().sitemap, "https://www.bladebud.com/sitemap.xml");
  });
});
