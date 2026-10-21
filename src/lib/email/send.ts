import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/safe-log";
import { isEmailTemplateId, renderCustomerEmail, type CustomerEmailFacts, type EmailTemplateId } from "./templates";

type SendInput = {
  template: EmailTemplateId | string;
  locale: string;
  to: string;
  name: string;
  reference: string;
  bookingId?: string;
} & Omit<CustomerEmailFacts, "name" | "reference">;

function credentials() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!apiKey || !from) return null;
  return { apiKey, from };
}

export function emailConfigured() {
  return Boolean(credentials());
}

type EmailDb = Prisma.TransactionClient | typeof prisma;

function isGuardedTemplate(template: string) {
  return template === "pickup_confirmed" || template === "return_arranged";
}

/** Never throws. A failed send must not undo a saved booking. */
export async function sendBookingEmail(input: SendInput) {
  if (!isEmailTemplateId(input.template)) return { status: "SKIPPED" as const };
  if (!input.bookingId || !isGuardedTemplate(input.template)) return deliver(input, prisma);

  try {
    return await prisma.$transaction(
      async (tx) => {
        const lockKey = `email:${input.bookingId}:${input.template}`;
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey})::bigint)`;
        const sent = await tx.emailLog.findFirst({
          where: { bookingId: input.bookingId, template: input.template, status: "SENT" },
          select: { id: true },
        });
        if (sent) return { status: "SKIPPED" as const };
        return deliver(input, tx);
      },
      { timeout: 20_000 },
    );
  } catch (err) {
    logError("email.send", err);
    await logOutcome(input, "FAILED", "transaction");
    return { status: "FAILED" as const };
  }
}

async function deliver(input: SendInput, writer: EmailDb) {
  if (!isEmailTemplateId(input.template)) return { status: "SKIPPED" as const };
  const creds = credentials();
  if (!creds) {
    await logOutcome(input, "SKIPPED", "not_configured", writer);
    return { status: "SKIPPED" as const };
  }

  const rendered = renderCustomerEmail(input.template, input.locale, input);
  if (!rendered) {
    await logOutcome(input, "SKIPPED", "missing_details", writer);
    return { status: "SKIPPED" as const };
  }
  const { subject, text } = rendered;

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
      await logOutcome(input, "FAILED", `http_${res.status}`, writer);
      return { status: "FAILED" as const };
    }
    await logOutcome(input, "SENT", undefined, writer);
    return { status: "SENT" as const };
  } catch (err) {
    logError("email.send", err);
    await logOutcome(input, "FAILED", err instanceof Error ? err.name : "error", writer);
    return { status: "FAILED" as const };
  }
}

async function logOutcome(
  input: SendInput,
  status: "SENT" | "SKIPPED" | "FAILED",
  errorName?: string,
  writer: EmailDb = prisma,
) {
  try {
    await writer.emailLog.create({
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
