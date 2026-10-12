import type { Locale } from "@/i18n/config";

export type EmailTemplateId =
  | "interest_received"
  | "booking_request_received"
  | "pickup_confirmed"
  | "knives_collected"
  | "sharpening_completed"
  | "return_arranged"
  | "order_completed";

type Vars = {
  name: string;
  reference: string;
};

const en: Record<EmailTemplateId, { subject: string; text: (v: Vars) => string }> = {
  interest_received: {
    subject: "We have registered your interest — KNIVPOJKARNA",
    text: ({ name, reference }) =>
      `Hello ${name},\n\nThank you for your interest! We'll contact you when KNIVPOJKARNA opens for bookings.\n\nYour reference: ${reference}\n\nThis is not a confirmed appointment.\n\nKNIVPOJKARNA UF`,
  },
  booking_request_received: {
    subject: "We have received your pickup request — KNIVPOJKARNA",
    text: ({ name, reference }) =>
      `Hello ${name},\n\nThank you! We've received your request and will contact you to confirm the pickup details.\n\nYour reference: ${reference}\n\nThis is not a confirmed appointment until we write to you to confirm collection.\n\nKNIVPOJKARNA UF`,
  },
  pickup_confirmed: {
    subject: "Pickup confirmed — KNIVPOJKARNA",
    text: ({ name, reference }) =>
      `Hello ${name},\n\nYour pickup has been confirmed by our team. We will collect your knives as agreed.\n\nReference: ${reference}\n\nKNIVPOJKARNA UF`,
  },
  knives_collected: {
    subject: "Your knives have been collected — KNIVPOJKARNA",
    text: ({ name, reference }) =>
      `Hello ${name},\n\nWe have collected your knives and they are with us for sharpening.\n\nReference: ${reference}\n\nKNIVPOJKARNA UF`,
  },
  sharpening_completed: {
    subject: "Sharpening completed — KNIVPOJKARNA",
    text: ({ name, reference }) =>
      `Hello ${name},\n\nSharpening is complete. We will contact you to arrange the return delivery.\n\nReference: ${reference}\n\nKNIVPOJKARNA UF`,
  },
  return_arranged: {
    subject: "Return delivery arranged — KNIVPOJKARNA",
    text: ({ name, reference }) =>
      `Hello ${name},\n\nYour return delivery has been arranged. We will bring your knives back as agreed.\n\nReference: ${reference}\n\nKNIVPOJKARNA UF`,
  },
  order_completed: {
    subject: "Your knives have been returned — KNIVPOJKARNA",
    text: ({ name, reference }) =>
      `Hello ${name},\n\nYour order is complete and your knives have been returned. Thank you for using KNIVPOJKARNA.\n\nReference: ${reference}\n\nKNIVPOJKARNA UF`,
  },
};

const es: Record<EmailTemplateId, { subject: string; text: (v: Vars) => string }> = {
  interest_received: {
    subject: "Hemos registrado tu interés — KNIVPOJKARNA",
    text: ({ name, reference }) =>
      `Hola ${name},\n\n¡Gracias por tu interés! Te contactaremos cuando KNIVPOJKARNA abra las reservas.\n\nTu referencia: ${reference}\n\nEsto no es una cita confirmada.\n\nKNIVPOJKARNA UF`,
  },
  booking_request_received: {
    subject: "Hemos recibido tu solicitud de recogida — KNIVPOJKARNA",
    text: ({ name, reference }) =>
      `Hola ${name},\n\n¡Gracias! Hemos recibido tu solicitud y te contactaremos para confirmar los detalles de la recogida.\n\nTu referencia: ${reference}\n\nEsto no es una cita confirmada hasta que te escribamos para confirmar la recogida.\n\nKNIVPOJKARNA UF`,
  },
  pickup_confirmed: {
    subject: "Recogida confirmada — KNIVPOJKARNA",
    text: ({ name, reference }) =>
      `Hola ${name},\n\nNuestro equipo ha confirmado la recogida. Recogeremos tus cuchillos según lo acordado.\n\nReferencia: ${reference}\n\nKNIVPOJKARNA UF`,
  },
  knives_collected: {
    subject: "Hemos recogido tus cuchillos — KNIVPOJKARNA",
    text: ({ name, reference }) =>
      `Hola ${name},\n\nHemos recogido tus cuchillos y ya están con nosotros para el afilado.\n\nReferencia: ${reference}\n\nKNIVPOJKARNA UF`,
  },
  sharpening_completed: {
    subject: "Afilado completado — KNIVPOJKARNA",
    text: ({ name, reference }) =>
      `Hola ${name},\n\nEl afilado está listo. Te contactaremos para concertar la devolución.\n\nReferencia: ${reference}\n\nKNIVPOJKARNA UF`,
  },
  return_arranged: {
    subject: "Devolución concertada — KNIVPOJKARNA",
    text: ({ name, reference }) =>
      `Hola ${name},\n\nHemos concertado la devolución. Te llevaremos los cuchillos según lo acordado.\n\nReferencia: ${reference}\n\nKNIVPOJKARNA UF`,
  },
  order_completed: {
    subject: "Tus cuchillos han sido devueltos — KNIVPOJKARNA",
    text: ({ name, reference }) =>
      `Hola ${name},\n\nTu pedido está completo y tus cuchillos han sido devueltos. Gracias por confiar en KNIVPOJKARNA.\n\nReferencia: ${reference}\n\nKNIVPOJKARNA UF`,
  },
};

export function renderEmail(template: EmailTemplateId, locale: Locale | string, vars: Vars) {
  const pack = locale === "es" ? es : en;
  const item = pack[template];
  return { subject: item.subject, text: item.text(vars) };
}

export function isEmailTemplateId(value: string): value is EmailTemplateId {
  return value in en;
}
