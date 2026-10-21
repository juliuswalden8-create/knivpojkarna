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

/**
 * Canonical production origin. NEXT_PUBLIC_SITE_URL can override this for a real custom host.
 * vercel.app hosts, including the previous deployment URL, are not the public canonical.
 * This does not redirect old hosts. bladebud.com is already the public origin.
 */
export const CANONICAL_SITE_URL = "https://www.bladebud.com";

function isLocalOrigin(url: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(url);
}

export function siteUrl() {
  const configured = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/$/, "");
  if (!configured || isLocalOrigin(configured)) {
    return process.env.NODE_ENV === "production" ? CANONICAL_SITE_URL : configured || "http://localhost:3000";
  }
  try {
    const host = new URL(configured).hostname.toLowerCase();
    if (host === "bladebud.com" || host === "www.bladebud.com" || host === "knifepost.com" || host === "www.knifepost.com") {
      return CANONICAL_SITE_URL;
    }
    if (host.endsWith(".vercel.app")) return CANONICAL_SITE_URL;
    return configured;
  } catch {
    return process.env.NODE_ENV === "production" ? CANONICAL_SITE_URL : "http://localhost:3000";
  }
}

/** Show the new brand when a stored setting still contains the previous name. Does not write to the database. */
export function customerFacingCopy(value: string) {
  return value
    .replaceAll("KNIVPOJKARNA UF", "BladeBud")
    .replaceAll("KNIVPOJKARNA", "BladeBud")
    .replaceAll("Knivpojkarna", "BladeBud")
    .replaceAll("KNIFEPOST", "BladeBud")
    .replaceAll("KnifePost", "BladeBud")
    .replaceAll("Knife Post", "BladeBud");
}

export function whatsappLink(number: string, message: string) {
  const digits = number.replace(/[^\d]/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
