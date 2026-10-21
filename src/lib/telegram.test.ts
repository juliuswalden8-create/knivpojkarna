import assert from "node:assert/strict";
import { test } from "node:test";
import { escapeTelegramHtml, notifyAdmin, renderAdminNotice, sendTelegramMessage } from "./telegram";

const env = { TELEGRAM_BOT_TOKEN: "123456:secret-token", TELEGRAM_CHAT_ID: "-10099" };

test("escapes customer text and builds an admin link without contact details", () => {
  const text = renderAdminNotice(
    {
      kind: "booking",
      reference: "KP-ABC123",
      name: "Ada & <Bob>\nLine",
      packageName: "Kitchen Essentials",
      knifeCount: 5,
      area: "Marbella",
      deliveryZone: "ZONE_1",
      estimatedTotalCents: 3200,
      adminPath: "/admin/bookings/booking-1",
    },
    "https://www.bladebud.com",
  );
  assert.match(text, /BladeBud · New household request/);
  assert.match(text, /Reference: KP-ABC123/);
  assert.match(text, /Name: Ada &amp; &lt;Bob&gt; Line/);
  assert.match(text, /Package: Kitchen Essentials/);
  assert.match(text, /Knives: 5/);
  assert.match(text, /Area: Marbella/);
  assert.match(text, /Zone: ZONE 1/);
  assert.match(text, /Estimated total:/);
  assert.match(text, /https:\/\/www\.bladebud\.com\/admin\/bookings\/booking-1/);
  assert.equal(text.includes("@"), false);
  assert.equal(escapeTelegramHtml("a&b<c>"), "a&amp;b&lt;c&gt;");
});

test("a configured Telegram send posts the escaped notice", async () => {
  let called = "";
  let body = "";
  const result = await notifyAdmin(
    {
      kind: "inquiry",
      reference: "BQ-ZZZZ",
      name: "Cafe <Sol>",
      knifeCount: 40,
      area: "Fuengirola",
      adminPath: "/admin/inquiries/inq-1",
    },
    "https://www.bladebud.com",
    {
      env,
      fetch: async (input, init) => {
        called = String(input);
        body = String(init?.body);
        return new Response("{}", { status: 200 });
      },
    },
  );
  assert.equal(result.status, "SENT");
  assert.match(called, /\/sendMessage$/);
  assert.match(body, /Cafe &lt;Sol&gt;/);
  assert.match(body, /Knives: 40/);
  assert.match(body, /admin\/inquiries\/inq-1/);
  assert.equal(body.includes("secret-token"), false);
});

test("a Telegram HTTP error does not throw or log the bot token", async () => {
  const lines: string[] = [];
  const original = console.error;
  console.error = (...args: unknown[]) => {
    lines.push(args.map(String).join(" "));
  };
  try {
    const result = await sendTelegramMessage("Hello", {
      env,
      fetch: async () => {
        throw new Error("failed https://api.telegram.org/bot123456:secret-token/sendMessage");
      },
    });
    assert.equal(result.status, "FAILED");
  } finally {
    console.error = original;
  }
  assert.equal(lines.some((line) => line.includes("secret-token")), false);
});

test("an unsuccessful Telegram response is a failure without the response body", async () => {
  const lines: string[] = [];
  const original = console.error;
  console.error = (...args: unknown[]) => {
    lines.push(args.map(String).join(" "));
  };
  try {
    const result = await sendTelegramMessage("Hello", {
      env,
      fetch: async () => new Response("chat not found for Ada", { status: 400 }),
    });
    assert.equal(result.status, "FAILED");
  } finally {
    console.error = original;
  }
  assert.match(lines.join("\n"), /HTTP400/);
  assert.equal(lines.some((line) => line.includes("Ada")), false);
});

test("missing Telegram configuration skips the send", async () => {
  let called = false;
  const result = await sendTelegramMessage("Hello", {
    env: {},
    fetch: async () => {
      called = true;
      return new Response("{}", { status: 200 });
    },
  });
  assert.equal(result.status, "SKIPPED");
  assert.equal(called, false);
});
