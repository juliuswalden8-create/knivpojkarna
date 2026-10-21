import type { Locale } from "@/i18n/config";
import { formatPrice } from "@/lib/utils";

export type EmailTemplateId =
  | "interest_received"
  | "booking_request_received"
  | "pickup_confirmed"
  | "knives_collected"
  | "sharpening_completed"
  | "return_arranged"
  | "order_completed";

export type CustomerEmailFacts = {
  name: string;
  reference: string;
  packageName?: string | null;
  knifeCount?: number | null;
  totalCents?: number | null;
  pickupDate?: Date | null;
  pickupWindow?: string | null;
  returnDate?: Date | null;
  returnWindow?: string | null;
};

type SimpleId = Exclude<EmailTemplateId, "pickup_confirmed" | "return_arranged">;

type Vars = {
  name: string;
  reference: string;
};

const en: Record<SimpleId, { subject: string; text: (v: Vars) => string }> = {
  interest_received: {
    subject: "We have registered your interest — BladeBud",
    text: ({ name, reference }) =>
      `Hello ${name},\n\nThank you for your interest! We'll contact you when BladeBud opens for bookings.\n\nYour reference: ${reference}\n\nThis is not a confirmed appointment.\n\nBladeBud`,
  },
  booking_request_received: {
    subject: "We have received your pickup request — BladeBud",
    text: ({ name, reference }) =>
      `Hello ${name},\n\nThank you! We've received your request and will contact you to confirm the pickup details.\n\nYour reference: ${reference}\n\nThis is not a confirmed appointment until we write to you to confirm collection.\n\nBladeBud`,
  },
  knives_collected: {
    subject: "Your knives have been collected — BladeBud",
    text: ({ name, reference }) =>
      `Hello ${name},\n\nWe have collected your knives and they are with us for sharpening.\n\nReference: ${reference}\n\nBladeBud`,
  },
  sharpening_completed: {
    subject: "Sharpening completed — BladeBud",
    text: ({ name, reference }) =>
      `Hello ${name},\n\nSharpening is complete. We will contact you to arrange the return delivery.\n\nReference: ${reference}\n\nBladeBud`,
  },
  order_completed: {
    subject: "Your knives have been returned — BladeBud",
    text: ({ name, reference }) =>
      `Hello ${name},\n\nYour order is complete and your knives have been returned. Thank you for using BladeBud.\n\nReference: ${reference}\n\nBladeBud`,
  },
};

const es: Record<SimpleId, { subject: string; text: (v: Vars) => string }> = {
  interest_received: {
    subject: "Hemos registrado tu interés — BladeBud",
    text: ({ name, reference }) =>
      `Hola ${name},\n\n¡Gracias por tu interés! Te contactaremos cuando BladeBud abra las reservas.\n\nTu referencia: ${reference}\n\nEsto no es una cita confirmada.\n\nBladeBud`,
  },
  booking_request_received: {
    subject: "Hemos recibido tu solicitud de recogida — BladeBud",
    text: ({ name, reference }) =>
      `Hola ${name},\n\n¡Gracias! Hemos recibido tu solicitud y te contactaremos para confirmar los detalles de la recogida.\n\nTu referencia: ${reference}\n\nEsto no es una cita confirmada hasta que te escribamos para confirmar la recogida.\n\nBladeBud`,
  },
  knives_collected: {
    subject: "Hemos recogido tus cuchillos — BladeBud",
    text: ({ name, reference }) =>
      `Hola ${name},\n\nHemos recogido tus cuchillos y ya están con nosotros para el afilado.\n\nReferencia: ${reference}\n\nBladeBud`,
  },
  sharpening_completed: {
    subject: "Afilado completado — BladeBud",
    text: ({ name, reference }) =>
      `Hola ${name},\n\nEl afilado está listo. Te contactaremos para concertar la devolución.\n\nReferencia: ${reference}\n\nBladeBud`,
  },
  order_completed: {
    subject: "Tus cuchillos han sido devueltos — BladeBud",
    text: ({ name, reference }) =>
      `Hola ${name},\n\nTu pedido está completo y tus cuchillos han sido devueltos. Gracias por confiar en BladeBud.\n\nReferencia: ${reference}\n\nBladeBud`,
  },
};

const TEMPLATE_IDS = new Set<EmailTemplateId>([
  "interest_received",
  "booking_request_received",
  "pickup_confirmed",
  "knives_collected",
  "sharpening_completed",
  "return_arranged",
  "order_completed",
]);

/** Show the stored civil date. UTC midnight must not slip to the previous evening. */
export function formatCustomerDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Format a stored window. A blank value stays missing rather than becoming a guessed time. */
export function formatCustomerWindow(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;
  const match = trimmed.match(/^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
  if (!match) return trimmed;
  const pad = (part: string) => {
    const [hour, minute] = part.split(":");
    return `${hour.padStart(2, "0")}:${minute}`;
  };
  return `${pad(match[1])}–${pad(match[2])}`;
}

function packageLabel(value: string | null | undefined) {
  const name = value?.trim() ?? "";
  return name || null;
}

function knifeLabel(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) return null;
  return String(value);
}

function priceLabel(cents: number | null | undefined, locale: string) {
  if (typeof cents !== "number" || !Number.isInteger(cents) || cents < 0) return null;
  return formatPrice(cents, locale);
}

function dateLabel(date: Date | null | undefined, locale: string) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  return formatCustomerDate(date, locale);
}

export function renderCustomerEmail(template: EmailTemplateId, locale: Locale | string, facts: CustomerEmailFacts) {
  const spanish = locale === "es";
  if (template === "pickup_confirmed") {
    const pickupDate = dateLabel(facts.pickupDate, locale);
    const pickupWindow = formatCustomerWindow(facts.pickupWindow);
    const packageName = packageLabel(facts.packageName);
    const knives = knifeLabel(facts.knifeCount);
    const total = priceLabel(facts.totalCents, locale);
    if (!facts.name.trim() || !facts.reference.trim() || !pickupDate || !pickupWindow || !packageName || !knives || !total) {
      return null;
    }
    const text = spanish
      ? `Hola ${facts.name},\n\nTu recogida está confirmada. Pasaremos a recoger los cuchillos en la fecha y el horario siguientes.\n\nReferencia: ${facts.reference}\nPaquete: ${packageName}\nCuchillos: ${knives}\nFecha de recogida: ${pickupDate}\nHorario: ${pickupWindow}\nTotal: ${total}\n\nEsta confirmación la envía nuestro equipo.\n\nBladeBud`
      : `Hello ${facts.name},\n\nYour pickup is confirmed. We will collect your knives on the date and at the time below.\n\nReference: ${facts.reference}\nPackage: ${packageName}\nKnives: ${knives}\nPickup date: ${pickupDate}\nPickup time: ${pickupWindow}\nTotal: ${total}\n\nThis confirmation was sent by our team.\n\nBladeBud`;
    return {
      subject: spanish ? "Recogida confirmada — BladeBud" : "Pickup confirmed — BladeBud",
      text,
    };
  }
  if (template === "return_arranged") {
    const returnDate = dateLabel(facts.returnDate, locale);
    const returnWindow = formatCustomerWindow(facts.returnWindow);
    const packageName = packageLabel(facts.packageName);
    const knives = knifeLabel(facts.knifeCount);
    if (!facts.name.trim() || !facts.reference.trim() || !returnDate || !returnWindow || !packageName || !knives) {
      return null;
    }
    const text = spanish
      ? `Hola ${facts.name},\n\nHemos concertado la devolución. Te llevaremos los cuchillos en la fecha y el horario siguientes.\n\nReferencia: ${facts.reference}\nPaquete: ${packageName}\nCuchillos: ${knives}\nFecha de devolución: ${returnDate}\nHorario: ${returnWindow}\n\nBladeBud`
      : `Hello ${facts.name},\n\nYour return delivery is arranged. We will bring your knives back on the date and at the time below.\n\nReference: ${facts.reference}\nPackage: ${packageName}\nKnives: ${knives}\nReturn date: ${returnDate}\nReturn time: ${returnWindow}\n\nBladeBud`;
    return {
      subject: spanish ? "Devolución concertada — BladeBud" : "Return delivery arranged — BladeBud",
      text,
    };
  }
  const pack = spanish ? es : en;
  const item = pack[template];
  return { subject: item.subject, text: item.text({ name: facts.name, reference: facts.reference }) };
}

export function renderEmail(template: EmailTemplateId, locale: Locale | string, facts: CustomerEmailFacts) {
  return renderCustomerEmail(template, locale, facts);
}

/** Pickup and return messages stay unsent until every required fact is already stored. */
export function confirmationDetailsComplete(template: EmailTemplateId, facts: CustomerEmailFacts) {
  if (template !== "pickup_confirmed" && template !== "return_arranged") return true;
  return renderCustomerEmail(template, "en", facts) !== null;
}

export function isEmailTemplateId(value: string): value is EmailTemplateId {
  return TEMPLATE_IDS.has(value as EmailTemplateId);
}
