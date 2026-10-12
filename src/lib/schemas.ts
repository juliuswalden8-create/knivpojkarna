import { z } from "zod";

export const knifeTypesSchema = z.object({
  standard: z.number().int().min(0).max(200),
  serrated: z.number().int().min(0).max(200),
  specialty: z.number().int().min(0).max(200),
  damaged: z.boolean(),
});

const optionalText = z
  .string()
  .trim()
  .max(120)
  .optional()
  .nullable()
  .transform((value) => value || null);

const optionalDate = z
  .string()
  .optional()
  .nullable()
  .transform((value) => {
    const trimmed = value?.trim() || "";
    return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
  });

const optionalSlot = z
  .string()
  .max(40)
  .optional()
  .nullable()
  .transform((value) => value?.trim() || null);

export const bookingSchema = z.object({
  locale: z.enum(["en", "es", "sv"]),
  packageId: z.string().min(1),
  serviceType: z.literal("PICKUP").default("PICKUP"),
  addressLine: z.string().trim().min(3).max(200),
  postalCode: z.string().trim().min(4).max(20),
  areaName: z.string().trim().min(1).max(80),
  areaDetail: optionalText,
  preferredDate: optionalDate,
  preferredTimeSlot: optionalSlot,
  customerName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().min(6).max(40),
  pickupNotes: z.string().trim().max(1000).optional().nullable().transform((value) => value || null),
  comments: z.string().trim().max(1000).optional().nullable().transform((value) => value || null),
  consent: z.literal(true),
  website: z.string().max(0).optional().default(""),
});

export type BookingInput = z.infer<typeof bookingSchema>;

export const inquirySchema = z.object({
  locale: z.enum(["en", "es", "sv"]),
  businessName: z.string().trim().min(2).max(160),
  businessType: z.string().trim().min(1).max(40),
  contactName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  phone: z
    .string()
    .trim()
    .max(40)
    .refine((value) => value.length === 0 || value.length >= 6, { message: "phone" }),
  estimatedKnives: z.number().int().min(1).max(5000),
  frequency: z.string().trim().min(1).max(40),
  needsPickup: z.boolean(),
  address: z.string().trim().min(2).max(240),
  message: z.string().trim().max(2000).optional().nullable(),
  consent: z.literal(true),
  website: z.string().max(0).optional().default(""),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(200),
});
