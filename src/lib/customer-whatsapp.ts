/**
 * Admin-only WhatsApp draft for a household booking.
 * Opens wa.me with a pre-filled message. Nothing is sent until the admin presses send.
 */

const SPANISH_NATIONAL = /^[6-9]\d{8}$/;
const E164 = /^[1-9]\d{7,14}$/;
const REFERENCE = /^[A-Z0-9-]{4,32}$/;

export function normalizeCustomerPhone(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed || /[a-z]/i.test(trimmed)) return null;

  let digits = trimmed.replace(/[^\d]/g, "");
  if (!digits) return null;
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (SPANISH_NATIONAL.test(digits)) digits = `34${digits}`;

  return E164.test(digits) ? digits : null;
}

export function customerWhatsAppHref(phone: string, locale: string, reference: string): string | null {
  const digits = normalizeCustomerPhone(phone);
  const ref = reference.trim().toUpperCase();
  if (!digits || !REFERENCE.test(ref)) return null;

  const message =
    locale === "es"
      ? `Hola, somos BladeBud. Te contactamos sobre tu solicitud de afilado de cuchillos. Referencia: ${ref}`
      : `Hello, this is BladeBud. We are contacting you about your knife sharpening request. Reference: ${ref}`;

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
