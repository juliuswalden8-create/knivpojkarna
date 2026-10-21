import { formatPrice } from "@/lib/utils";
import { logError } from "@/lib/safe-log";

export type AdminNotice = {
  kind: "booking" | "inquiry";
  reference: string;
  name: string;
  packageName?: string | null;
  knifeCount?: number | null;
  area?: string | null;
  deliveryZone?: string | null;
  estimatedTotalCents?: number | null;
  adminPath: string;
};

type TelegramEnv = {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
};

function readTelegramEnv(env: TelegramEnv | NodeJS.ProcessEnv = process.env): TelegramEnv {
  return {
    TELEGRAM_BOT_TOKEN: env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: env.TELEGRAM_CHAT_ID,
  };
}

type SendDeps = {
  fetch?: typeof fetch;
  env?: TelegramEnv;
};

export function escapeTelegramHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll(/[\r\n]+/g, " ");
}

export function telegramConfig(env: TelegramEnv | NodeJS.ProcessEnv = process.env) {
  const read = readTelegramEnv(env);
  const token = read.TELEGRAM_BOT_TOKEN?.trim() ?? "";
  const chatId = read.TELEGRAM_CHAT_ID?.trim() ?? "";
  if (!token || !chatId) return null;
  return { token, chatId };
}

export function renderAdminNotice(notice: AdminNotice, origin: string) {
  const lines = [
    notice.kind === "booking" ? "BladeBud · New household request" : "BladeBud · New business inquiry",
    `Reference: ${escapeTelegramHtml(notice.reference)}`,
    `Name: ${escapeTelegramHtml(notice.name)}`,
  ];
  if (notice.packageName) lines.push(`Package: ${escapeTelegramHtml(notice.packageName)}`);
  if (notice.knifeCount != null) lines.push(`Knives: ${notice.knifeCount}`);
  if (notice.area) lines.push(`Area: ${escapeTelegramHtml(notice.area)}`);
  if (notice.deliveryZone) lines.push(`Zone: ${escapeTelegramHtml(notice.deliveryZone.replaceAll("_", " "))}`);
  if (notice.estimatedTotalCents != null) {
    lines.push(`Estimated total: ${escapeTelegramHtml(formatPrice(notice.estimatedTotalCents))}`);
  }
  const path = notice.adminPath.startsWith("/") ? notice.adminPath : `/${notice.adminPath}`;
  lines.push(`Admin: ${escapeTelegramHtml(`${origin.replace(/\/$/, "")}${path}`)}`);
  return lines.join("\n");
}

/** Never throws. Missing Telegram settings skip the send. */
export async function sendTelegramMessage(text: string, deps: SendDeps = {}) {
  const config = telegramConfig(deps.env ?? readTelegramEnv());
  if (!config) return { status: "SKIPPED" as const };
  const fetchImpl = deps.fetch ?? fetch;
  try {
    const res = await fetchImpl(`https://api.telegram.org/bot${config.token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: config.chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) {
      console.error(`[telegram.send] HTTP${res.status}`);
      return { status: "FAILED" as const };
    }
    return { status: "SENT" as const };
  } catch (err) {
    logError("telegram.send", err);
    return { status: "FAILED" as const };
  }
}

/** Called only after the booking or inquiry row has been saved. */
export async function notifyAdmin(notice: AdminNotice, origin: string, deps: SendDeps = {}) {
  try {
    return await sendTelegramMessage(renderAdminNotice(notice, origin), deps);
  } catch (err) {
    logError("telegram.notify", err);
    return { status: "FAILED" as const };
  }
}
