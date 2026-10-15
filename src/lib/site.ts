import type { Locale } from "@/i18n/config";
import type { PublicPackage } from "./pricing";
import { prisma } from "./prisma";
import { parseJsonArray } from "./utils";
import { utcToISODate } from "./dates";
import { parseBusinessStatus } from "./business-status";

export async function getSettings() {
  const existing = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  const row = existing ?? (await prisma.siteSettings.create({ data: { id: 1, businessStatus: "PRELAUNCH" } }));
  return { ...row, businessStatus: parseBusinessStatus(row.businessStatus) };
}

export async function getPackages(locale: Locale): Promise<PublicPackage[]> {
  const rows = await prisma.package.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((row) => {
    const name = locale === "es" ? row.nameEs : locale === "sv" && row.nameSv ? row.nameSv : row.nameEn;
    const raw = locale === "es" ? row.featuresEs : locale === "sv" && row.featuresSv ? row.featuresSv : row.featuresEn;
    return {
      id: row.id,
      slug: row.slug,
      name,
      priceCents: row.priceCents,
      knifeCount: row.knifeCount,
      features: parseJsonArray(raw),
      highlighted: row.highlighted,
    };
  });
}

export async function getAllPackages() {
  return prisma.package.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getAreas(activeOnly = true) {
  return prisma.serviceArea.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: { sortOrder: "asc" },
  });
}

export async function getAvailability() {
  const settings = await getSettings();
  const blockedRows = await prisma.blockedDate.findMany();
  return {
    openWeekdays: settings.openWeekdays,
    timeSlots: settings.timeSlots,
    leadTimeDays: settings.leadTimeDays,
    bookingWindowDays: settings.bookingWindowDays,
    extraKnifePriceCents: settings.extraKnifePriceCents,
    blocked: blockedRows.map((row) => utcToISODate(row.date)),
  };
}

/** Public production origin. Deployment URLs on *.vercel.app are not this host. */
const PUBLIC_SITE_URL = "https://knivpojkarna.vercel.app";

export function siteUrl() {
  const configured = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/$/, "");
  if (!configured || /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(configured)) {
    return process.env.NODE_ENV === "production" ? PUBLIC_SITE_URL : configured || "http://localhost:3000";
  }
  try {
    const host = new URL(configured).hostname;
    if (host.endsWith(".vercel.app") && configured !== PUBLIC_SITE_URL) return PUBLIC_SITE_URL;
  } catch {
    return process.env.NODE_ENV === "production" ? PUBLIC_SITE_URL : "http://localhost:3000";
  }
  return configured;
}

export function whatsappLink(number: string, message: string) {
  const digits = number.replace(/[^\d]/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
