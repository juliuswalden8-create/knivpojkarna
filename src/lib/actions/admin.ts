"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { clearSession, createSession, requireAdminSession } from "@/lib/auth";
import { loginSchema } from "@/lib/schemas";
import { clientKey, rateLimitPersistent } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { fromISODate } from "@/lib/dates";
import { slugify } from "@/lib/utils";
import { parseBusinessStatus } from "@/lib/business-status";
import { getSettings } from "@/lib/site";
import { canSetBookingStatus, canSetInquiryStatus, emailTemplateForStatus, normalizeBookingStatus } from "@/lib/inquiry-status";
import { sendBookingEmail } from "@/lib/email/send";

async function requireAdmin() {
  return requireAdminSession();
}

function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false as const, error: "Invalid email or password." };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip");
  const limited = await rateLimitPersistent(clientKey("login", ip), 8, 15 * 60 * 1000);
  if (!limited.ok) return { ok: false as const, error: "Too many attempts. Try again later." };

  let user = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    const bootstrapEmail = process.env.ADMIN_EMAIL;
    const bootstrapPassword = process.env.ADMIN_PASSWORD;
    const count = await prisma.adminUser.count();
    if (count === 0 && bootstrapEmail && bootstrapPassword && parsed.data.email === bootstrapEmail && parsed.data.password === bootstrapPassword) {
      user = await prisma.adminUser.create({
        data: { email: bootstrapEmail, passwordHash: await bcrypt.hash(bootstrapPassword, 12) },
      });
    }
  }
  if (!user) return { ok: false as const, error: "Invalid email or password." };

  const match = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!match) return { ok: false as const, error: "Invalid email or password." };

  await createSession(user);
  redirect("/admin");
}

export async function logoutAction() {
  await clearSession();
  redirect("/admin/login");
}

export async function updateBookingStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!id) return;
  const settings = await getSettings();
  if (!canSetBookingStatus(settings.businessStatus, status)) return;
  const scheduledDate = String(formData.get("scheduledDate") || "");
  const scheduledTimeSlot = String(formData.get("scheduledTimeSlot") || "");
  const adminNotes = String(formData.get("adminNotes") || "");
  const prelaunch = settings.businessStatus === "PRELAUNCH";
  const existing = await prisma.booking.findUnique({ where: { id } });
  if (!existing) return;
  const previous = normalizeBookingStatus(existing.status);
  await prisma.booking.update({
    where: { id },
    data: {
      status,
      scheduledDate: prelaunch ? null : scheduledDate ? fromISODate(scheduledDate) : null,
      scheduledTimeSlot: prelaunch ? null : scheduledTimeSlot || null,
      adminNotes: adminNotes || null,
    },
  });
  const template = emailTemplateForStatus(status);
  if (template && previous !== status) {
    await sendBookingEmail({
      template,
      locale: existing.locale,
      to: existing.email,
      name: existing.customerName,
      reference: existing.reference,
      bookingId: existing.id,
    });
  }
  revalidatePath("/admin");
  revalidatePath(`/admin/bookings/${id}`);
}

export async function updateInquiryStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!id) return;
  const settings = await getSettings();
  if (!canSetInquiryStatus(settings.businessStatus, status)) return;
  const adminNotes = String(formData.get("adminNotes") || "");
  await prisma.businessInquiry.update({
    where: { id },
    data: { status, adminNotes: adminNotes || null },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");
}

export async function savePackage(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const data = {
    nameEn: String(formData.get("nameEn") || "").trim(),
    nameEs: String(formData.get("nameEs") || "").trim(),
    nameSv: String(formData.get("nameSv") || "").trim() || null,
    priceCents: Math.round(Number(formData.get("price")) * 100) || 0,
    knifeCount: Number(formData.get("knifeCount")) || 1,
    featuresEn: JSON.stringify(
      String(formData.get("featuresEn") || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
    featuresEs: JSON.stringify(
      String(formData.get("featuresEs") || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
    highlighted: formData.get("highlighted") === "on",
    active: formData.get("active") === "on",
    sortOrder: Number(formData.get("sortOrder")) || 0,
  };
  if (!data.nameEn || !data.nameEs) return;
  if (id) {
    await prisma.package.update({ where: { id }, data });
  } else {
    await prisma.package.create({
      data: {
        ...data,
        slug: slugify(data.nameEn) || `package-${Date.now()}`,
      },
    });
  }
  revalidateAdmin();
}

export async function saveArea(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const data = {
    name,
    descriptionEn: String(formData.get("descriptionEn") || ""),
    descriptionEs: String(formData.get("descriptionEs") || ""),
    pickupStatus: formData.get("pickupStatus") === "PICKUP_AVAILABLE" ? "PICKUP_AVAILABLE" : "ON_REQUEST",
    mapX: Number(formData.get("mapX")) || 50,
    mapY: Number(formData.get("mapY")) || 50,
    sortOrder: Number(formData.get("sortOrder")) || 0,
    active: formData.get("active") === "on",
  };
  if (id) {
    await prisma.serviceArea.update({ where: { id }, data });
  } else {
    await prisma.serviceArea.create({
      data: { ...data, slug: slugify(name) || `area-${Date.now()}` },
    });
  }
  revalidateAdmin();
}

function optionalEuroCents(formData: FormData, name: string) {
  if (!formData.has(name)) return undefined;
  const raw = String(formData.get(name) ?? "").trim();
  if (raw === "") return null;
  const euros = Number(raw);
  if (!Number.isFinite(euros) || euros < 0) return null;
  return Math.round(euros * 100);
}

export async function saveSettings(formData: FormData) {
  await requireAdmin();
  const weekdays = formData.getAll("weekday").map((v) => String(v)).join(",");
  const pickupFeeCents = optionalEuroCents(formData, "pickupFee");
  const zone1 = optionalEuroCents(formData, "deliveryZone1Fee");
  const zone2 = optionalEuroCents(formData, "deliveryZone2Fee");
  const zone3 = optionalEuroCents(formData, "deliveryZone3Fee");
  const freeThreshold = optionalEuroCents(formData, "freeDeliveryThreshold");
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {
      whatsappNumber: String(formData.get("whatsappNumber") || "").replace(/[^\d]/g, ""),
      whatsappMessageEn: String(formData.get("whatsappMessageEn") || ""),
      whatsappMessageEs: String(formData.get("whatsappMessageEs") || ""),
      contactEmail: String(formData.get("contactEmail") || ""),
      instagramUrl: String(formData.get("instagramUrl") || ""),
      openWeekdays: weekdays || "1,2,3,4,5,6",
      timeSlots: String(formData.get("timeSlots") || "09:00-12:00,12:00-15:00,15:00-18:00"),
      leadTimeDays: Math.max(1, Number(formData.get("leadTimeDays")) || 1),
      bookingWindowDays: Number(formData.get("bookingWindowDays")) || 60,
      extraKnifePriceCents: Math.round(Number(formData.get("extraKnifePrice")) * 100) || 700,
      businessStatus: formData.has("businessStatus")
        ? parseBusinessStatus(String(formData.get("businessStatus") || ""))
        : undefined,
      pickupInstructionsEn: formData.has("pickupInstructionsEn")
        ? String(formData.get("pickupInstructionsEn") || "")
        : undefined,
      pickupInstructionsEs: formData.has("pickupInstructionsEs")
        ? String(formData.get("pickupInstructionsEs") || "")
        : undefined,
      returnInstructionsEn: formData.has("returnInstructionsEn")
        ? String(formData.get("returnInstructionsEn") || "")
        : undefined,
      returnInstructionsEs: formData.has("returnInstructionsEs")
        ? String(formData.get("returnInstructionsEs") || "")
        : undefined,
      ...(pickupFeeCents !== undefined ? { pickupFeeCents } : {}),
      ...(zone1 !== undefined && zone1 !== null ? { deliveryZone1FeeCents: zone1 } : {}),
      ...(zone2 !== undefined && zone2 !== null ? { deliveryZone2FeeCents: zone2 } : {}),
      ...(zone3 !== undefined && zone3 !== null ? { deliveryZone3FeeCents: zone3 } : {}),
      ...(freeThreshold !== undefined && freeThreshold !== null ? { freeDeliveryThresholdCents: freeThreshold } : {}),
    },
    create: { id: 1, businessStatus: parseBusinessStatus(String(formData.get("businessStatus") || "")) },
  });
  revalidateAdmin();
}

export async function addBlockedDate(formData: FormData) {
  await requireAdmin();
  const date = String(formData.get("date") || "");
  const reason = String(formData.get("reason") || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
  await prisma.blockedDate.upsert({
    where: { date: fromISODate(date) },
    update: { reason: reason || null },
    create: { date: fromISODate(date), reason: reason || null },
  });
  revalidatePath("/admin/availability");
}

export async function removeBlockedDate(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.blockedDate.delete({ where: { id } });
  revalidatePath("/admin/availability");
}
