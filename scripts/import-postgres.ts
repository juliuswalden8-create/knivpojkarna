/**
 * Idempotent import of prisma/exports/sqlite-export.json into PostgreSQL.
 * Skips rows whose id (or slug/email/reference) already exists.
 * Does not delete anything.
 *
 * Usage (after migrate deploy):
 *   npx tsx scripts/import-postgres.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

const file = resolve(process.cwd(), "prisma/exports/sqlite-export.json");
if (!existsSync(file)) {
  console.error("Missing prisma/exports/sqlite-export.json. Export SQLite first.");
  process.exit(1);
}

type ExportPayload = {
  adminUsers: Array<{ id: string; email: string; passwordHash: string; createdAt: string }>;
  siteSettings: Array<Record<string, unknown>>;
  packages: Array<Record<string, unknown> & { id: string; slug: string }>;
  bookings: Array<Record<string, unknown> & { id: string; reference: string }>;
  businessInquiries: Array<Record<string, unknown> & { id: string; reference: string }>;
  serviceAreas: Array<Record<string, unknown> & { id: string; slug: string }>;
  blockedDates: Array<Record<string, unknown> & { id: string }>;
};

const payload = JSON.parse(readFileSync(file, "utf8")) as ExportPayload;
const prisma = new PrismaClient();

function asDate(value: unknown): Date | null {
  if (!value) return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

async function main() {
  const url = process.env.DATABASE_URL || "";
  if (!url.startsWith("postgres")) {
    console.error("DATABASE_URL is not PostgreSQL. Refusing to import.");
    process.exit(1);
  }

  let imported = 0;
  let skipped = 0;

  for (const user of payload.adminUsers ?? []) {
    const existing = await prisma.adminUser.findFirst({
      where: { OR: [{ id: user.id }, { email: user.email }] },
    });
    if (existing) {
      skipped += 1;
      continue;
    }
    await prisma.adminUser.create({
      data: {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        createdAt: asDate(user.createdAt) ?? undefined,
      },
    });
    imported += 1;
  }

  const settings = payload.siteSettings?.[0];
  if (settings) {
    const existing = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    if (!existing) {
      await prisma.siteSettings.create({
        data: {
          id: 1,
          whatsappNumber: String(settings.whatsappNumber ?? ""),
          whatsappMessageEn: String(settings.whatsappMessageEn ?? ""),
          whatsappMessageEs: String(settings.whatsappMessageEs ?? ""),
          contactEmail: String(settings.contactEmail ?? ""),
          instagramUrl: String(settings.instagramUrl ?? ""),
          openWeekdays: String(settings.openWeekdays ?? "1,2,3,4,5,6"),
          timeSlots: String(settings.timeSlots ?? "09:00-12:00,12:00-15:00,15:00-18:00"),
          leadTimeDays: Number(settings.leadTimeDays ?? 1),
          bookingWindowDays: Number(settings.bookingWindowDays ?? 60),
          extraKnifePriceCents: Number(settings.extraKnifePriceCents ?? 700),
          businessStatus: String(settings.businessStatus ?? "PRELAUNCH"),
        },
      });
      imported += 1;
    } else {
      skipped += 1;
    }
  }

  for (const pkg of payload.packages ?? []) {
    const existing = await prisma.package.findFirst({ where: { OR: [{ id: pkg.id }, { slug: pkg.slug }] } });
    if (existing) {
      skipped += 1;
      continue;
    }
    await prisma.package.create({
      data: {
        id: pkg.id,
        slug: pkg.slug,
        nameEn: String(pkg.nameEn),
        nameEs: String(pkg.nameEs),
        nameSv: pkg.nameSv ? String(pkg.nameSv) : null,
        priceCents: Number(pkg.priceCents),
        knifeCount: Number(pkg.knifeCount),
        featuresEn: String(pkg.featuresEn ?? "[]"),
        featuresEs: String(pkg.featuresEs ?? "[]"),
        featuresSv: pkg.featuresSv ? String(pkg.featuresSv) : null,
        highlighted: Boolean(pkg.highlighted),
        active: pkg.active !== false,
        sortOrder: Number(pkg.sortOrder ?? 0),
      },
    });
    imported += 1;
  }

  for (const area of payload.serviceAreas ?? []) {
    const existing = await prisma.serviceArea.findFirst({ where: { OR: [{ id: area.id }, { slug: area.slug }] } });
    if (existing) {
      skipped += 1;
      continue;
    }
    await prisma.serviceArea.create({
      data: {
        id: area.id,
        slug: area.slug,
        name: String(area.name),
        descriptionEn: String(area.descriptionEn ?? ""),
        descriptionEs: String(area.descriptionEs ?? ""),
        pickupStatus: String(area.pickupStatus ?? "ON_REQUEST"),
        mapX: Number(area.mapX ?? 50),
        mapY: Number(area.mapY ?? 50),
        sortOrder: Number(area.sortOrder ?? 0),
        active: area.active !== false,
      },
    });
    imported += 1;
  }

  for (const booking of payload.bookings ?? []) {
    const existing = await prisma.booking.findFirst({
      where: { OR: [{ id: booking.id }, { reference: booking.reference }] },
    });
    if (existing) {
      skipped += 1;
      continue;
    }
    await prisma.booking.create({
      data: {
        id: booking.id,
        reference: booking.reference,
        status:
          booking.status === "CONFIRMED"
            ? "PICKUP_CONFIRMED"
            : booking.status === "IN_PROGRESS"
              ? "SHARPENING"
              : String(booking.status ?? "NEW"),
        packageId: null,
        packageName: String(booking.packageName),
        knifeCount: Number(booking.knifeCount),
        knifeTypes: String(booking.knifeTypes ?? "{}"),
        serviceType: String(booking.serviceType),
        addressLine: booking.addressLine ? String(booking.addressLine) : null,
        postalCode: booking.postalCode ? String(booking.postalCode) : null,
        areaName: booking.areaName ? String(booking.areaName) : null,
        preferredDate: asDate(booking.preferredDate),
        preferredTimeSlot: booking.preferredTimeSlot ? String(booking.preferredTimeSlot) : null,
        scheduledDate: asDate(booking.scheduledDate),
        scheduledTimeSlot: booking.scheduledTimeSlot ? String(booking.scheduledTimeSlot) : null,
        customerName: String(booking.customerName),
        email: String(booking.email),
        phone: String(booking.phone),
        comments: booking.comments ? String(booking.comments) : null,
        pickupNotes: booking.pickupNotes ? String(booking.pickupNotes) : null,
        inServiceArea: booking.inServiceArea !== false,
        estimatedTotalCents: Number(booking.estimatedTotalCents),
        locale: String(booking.locale ?? "en"),
        consentAt: asDate(booking.consentAt) ?? new Date(),
        adminNotes: booking.adminNotes ? String(booking.adminNotes) : null,
        createdAt: asDate(booking.createdAt) ?? undefined,
      },
    });
    imported += 1;
  }

  for (const inquiry of payload.businessInquiries ?? []) {
    const existing = await prisma.businessInquiry.findFirst({
      where: { OR: [{ id: inquiry.id }, { reference: inquiry.reference }] },
    });
    if (existing) {
      skipped += 1;
      continue;
    }
    await prisma.businessInquiry.create({
      data: {
        id: inquiry.id,
        reference: inquiry.reference,
        status: String(inquiry.status ?? "NEW"),
        businessName: String(inquiry.businessName),
        businessType: String(inquiry.businessType),
        contactName: String(inquiry.contactName),
        email: String(inquiry.email),
        phone: String(inquiry.phone ?? ""),
        estimatedKnives: inquiry.estimatedKnives == null ? null : Number(inquiry.estimatedKnives),
        frequency: inquiry.frequency ? String(inquiry.frequency) : null,
        needsPickup: Boolean(inquiry.needsPickup),
        address: inquiry.address ? String(inquiry.address) : null,
        message: inquiry.message ? String(inquiry.message) : null,
        locale: String(inquiry.locale ?? "en"),
        consentAt: asDate(inquiry.consentAt) ?? new Date(),
        adminNotes: inquiry.adminNotes ? String(inquiry.adminNotes) : null,
        createdAt: asDate(inquiry.createdAt) ?? undefined,
      },
    });
    imported += 1;
  }

  console.log(`Import finished. created=${imported} skipped=${skipped}`);
}

main()
  .catch((err) => {
    console.error("Import failed:", err instanceof Error ? err.name : "error");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
