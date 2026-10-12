"use server";

import { headers } from "next/headers";
import { inquirySchema } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";
import { generateReference } from "@/lib/utils";
import { clientKey, rateLimitPersistent } from "@/lib/rate-limit";
import { getSettings } from "@/lib/site";
import { acceptsPublicRequests } from "@/lib/inquiry-status";
import { logError } from "@/lib/safe-log";

export type InquiryResult =
  | { ok: true; reference: string }
  | { ok: false; error: string };

export async function submitInquiry(input: unknown): Promise<InquiryResult> {
  const parsed = inquirySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip");
  const limited = await rateLimitPersistent(clientKey("inquiry", ip), 6, 60 * 60 * 1000);
  if (!limited.ok) return { ok: false, error: "rate" };

  try {
    const settings = await getSettings();
    if (!acceptsPublicRequests(settings.businessStatus)) return { ok: false, error: "paused" };

    const data = parsed.data;
    let reference = generateReference("BQ");
    for (let i = 0; i < 4; i++) {
      const clash = await prisma.businessInquiry.findUnique({ where: { reference } });
      if (!clash) break;
      reference = generateReference("BQ");
    }

    const created = await prisma.businessInquiry.create({
      data: {
        reference,
        status: "NEW",
        businessName: data.businessName,
        businessType: data.businessType,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone || "",
        estimatedKnives: data.estimatedKnives,
        frequency: data.frequency,
        needsPickup: data.needsPickup,
        address: data.address,
        message: data.message || null,
        locale: data.locale,
        consentAt: new Date(),
      },
      select: { id: true, reference: true, status: true },
    });

    if (!created.id || created.status !== "NEW") return { ok: false, error: "save" };

    const verified = await prisma.businessInquiry.findUnique({
      where: { id: created.id },
      select: { reference: true },
    });
    if (!verified?.reference) return { ok: false, error: "save" };

    return { ok: true, reference: verified.reference };
  } catch (err) {
    logError("submitInquiry", err);
    return { ok: false, error: "save" };
  }
}
