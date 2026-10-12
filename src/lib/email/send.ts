import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/safe-log";
import { isEmailTemplateId, renderEmail, type EmailTemplateId } from "./templates";

type SendInput = {
  template: EmailTemplateId | string;
  locale: string;
  to: string;
  name: string;
  reference: string;
  bookingId?: string;
};

function credentials() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!apiKey || !from) return null;
  return { apiKey, from };
}

export function emailConfigured() {
  return Boolean(credentials());
}

/** Never throws. A failed send must not undo a saved booking. */
export async function sendBookingEmail(input: SendInput) {
  if (!isEmailTemplateId(input.template)) return { status: "SKIPPED" as const };
  const creds = credentials();
  if (!creds) {
    await logOutcome(input, "SKIPPED", "not_configured");
    return { status: "SKIPPED" as const };
  }

  const { subject, text } = renderEmail(input.template, input.locale, {
    name: input.name,
    reference: input.reference,
  });

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${creds.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: creds.from,
        to: [input.to],
        subject,
        text,
      }),
    });
    if (!res.ok) {
      await logOutcome(input, "FAILED", `http_${res.status}`);
      return { status: "FAILED" as const };
    }
    await logOutcome(input, "SENT");
    return { status: "SENT" as const };
  } catch (err) {
    logError("email.send", err);
    await logOutcome(input, "FAILED", err instanceof Error ? err.name : "error");
    return { status: "FAILED" as const };
  }
}

async function logOutcome(input: SendInput, status: "SENT" | "SKIPPED" | "FAILED", errorName?: string) {
  try {
    await prisma.emailLog.create({
      data: {
        bookingId: input.bookingId || null,
        template: input.template,
        status,
        errorName: errorName || null,
      },
    });
  } catch (err) {
    logError("email.log", err);
  }
}
