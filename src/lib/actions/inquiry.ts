"use server";

import { headers } from "next/headers";
import { inquirySchema } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";
import { generateReference } from "@/lib/utils";
import { clientKey, rateLimitPersistent } from "@/lib/rate-limit";
import { getSettings, siteUrl } from "@/lib/site";
import { acceptsPublicRequests } from "@/lib/inquiry-status";
import { logError } from "@/lib/safe-log";
import { duplicateWindowMs } from "@/lib/service-area";
import { decideInquiryWrite, inquiryLockKey } from "@/lib/inquiry-duplicate";
import { notifyAdmin } from "@/lib/telegram";

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
    const saved = await prisma.$transaction(async (tx) => {
      const lockKey = inquiryLockKey(data.email, data.businessName);
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey})::bigint)`;
      const since = new Date(Date.now() - duplicateWindowMs());
      const existing = await tx.businessInquiry.findFirst({
        where: {
          email: { equals: data.email, mode: "insensitive" },
          businessName: { equals: data.businessName, mode: "insensitive" },
          createdAt: { gte: since },
        },
        orderBy: { createdAt: "desc" },
        select: { id: true, reference: true },
      });
      if (decideInquiryWrite(existing) === "reuse" && existing) {
        return { created: false as const, id: existing.id, reference: existing.reference };
      }

      let reference = generateReference("BQ");
      for (let i = 0; i < 4; i++) {
        const clash = await tx.businessInquiry.findUnique({ where: { reference } });
        if (!clash) break;
        reference = generateReference("BQ");
      }
      const created = await tx.businessInquiry.create({
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
      if (!created.id || created.status !== "NEW") return null;
      return { created: true as const, id: created.id, reference: created.reference };
    });

    if (!saved?.reference) return { ok: false, error: "save" };

    if (saved.created) {
      await notifyAdmin(
        {
          kind: "inquiry",
          reference: saved.reference,
          name: data.contactName,
          knifeCount: data.estimatedKnives,
          area: data.address,
          adminPath: `/admin/inquiries/${saved.id}`,
        },
        siteUrl(),
      );
    }

    return { ok: true, reference: saved.reference };
  } catch (err) {
    logError("submitInquiry", err);
    return { ok: false, error: "save" };
  }
}
