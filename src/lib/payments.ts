export const PAYMENT_METHODS = [
  { value: "SWISH", label: "Swish" },
  { value: "BIZUM", label: "Bizum" },
  { value: "CASH", label: "Cash" },
] as const;

export const PAYMENT_CURRENCIES = ["EUR", "SEK"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];
export type PaymentCurrency = (typeof PAYMENT_CURRENCIES)[number];
export type PaymentStatus = "Unpaid" | "Partially paid" | "Paid";

/** Exchange rate is stored as SEK per 1 EUR, multiplied by this scale. */
export const RATE_SCALE = 10_000;
const MAX_MINOR = 10_000_000;
const NOTE_MAX = 500;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type PaymentDraft = {
  method: PaymentMethod;
  currency: PaymentCurrency;
  amountMinor: number;
  exchangeRateE4: number | null;
  eurCents: number;
  paidAt: Date;
  note: string | null;
  idempotencyKey: string;
};

export type PaymentDraftResult = { ok: true; draft: PaymentDraft } | { ok: false; error: string };

export type LedgerPayment = {
  eurCents: number;
  voided: boolean;
};

export type PaymentSummary = {
  bookingTotalCents: number;
  paidCents: number;
  remainingCents: number;
  overpaidCents: number;
  status: PaymentStatus;
};

const METHOD_VALUES = new Set<string>(PAYMENT_METHODS.map((method) => method.value));

export function paymentMethodLabel(method: string) {
  return PAYMENT_METHODS.find((item) => item.value === method)?.label ?? method;
}

/** Whole currency units drop decimals. Display only; storage stays in minor units. */
export function formatMinor(minor: number, currency: PaymentCurrency) {
  const whole = minor % 100 === 0;
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(minor / 100);
}

export function formatExchangeRate(rateE4: number) {
  const whole = Math.floor(rateE4 / RATE_SCALE);
  const fraction = String(rateE4 % RATE_SCALE)
    .padStart(4, "0")
    .replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : String(whole);
}

export function formatUtcDateTime(date: Date) {
  const formatted = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "UTC",
  }).format(date);
  return `${formatted} UTC`;
}

export function toUtcDateTimeLocal(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
}

export function parseMoneyMinor(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const [whole, fraction = ""] = trimmed.split(".");
  const minor = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(minor) || minor <= 0 || minor > MAX_MINOR) return null;
  return minor;
}

export function parseExchangeRateE4(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+(\.\d{1,4})?$/.test(trimmed)) return null;
  const [whole, fraction = ""] = trimmed.split(".");
  const rate = Number(whole) * RATE_SCALE + Number(fraction.padEnd(4, "0"));
  if (!Number.isSafeInteger(rate) || rate <= 0 || rate > 10_000 * RATE_SCALE) return null;
  return rate;
}

/** EUR cents = öre × 10_000 / rate, rounded half up. The rate is SEK for 1 EUR. */
export function eurCentsFromSek(sekOre: number, rateE4: number): number | null {
  if (!Number.isSafeInteger(sekOre) || !Number.isSafeInteger(rateE4) || sekOre <= 0 || rateE4 <= 0) return null;
  const numerator = sekOre * RATE_SCALE;
  if (!Number.isSafeInteger(numerator)) return null;
  const cents = Math.floor((numerator + Math.floor(rateE4 / 2)) / rateE4);
  if (!Number.isSafeInteger(cents) || cents <= 0 || cents > MAX_MINOR) return null;
  return cents;
}

export function parsePaidAt(value: string, now: Date): Date | null {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) return null;
  const [date, time] = trimmed.split("T");
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const paidAt = new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));
  if (
    paidAt.getUTCFullYear() !== year ||
    paidAt.getUTCMonth() !== month - 1 ||
    paidAt.getUTCDate() !== day ||
    paidAt.getUTCHours() !== hour ||
    paidAt.getUTCMinutes() !== minute
  ) {
    return null;
  }
  const drift = paidAt.getTime() - now.getTime();
  if (drift > 24 * 60 * 60 * 1000 || drift < -5 * 365 * 24 * 60 * 60 * 1000) return null;
  return paidAt;
}

export function parsePaymentDraft(
  input: {
    method: string;
    currency: string;
    amount: string;
    exchangeRate: string;
    paidAt: string;
    note: string;
    idempotencyKey: string;
  },
  now: Date,
): PaymentDraftResult {
  if (!METHOD_VALUES.has(input.method)) return { ok: false, error: "Choose Swish, Bizum, or Cash." };
  if (input.currency !== "EUR" && input.currency !== "SEK") return { ok: false, error: "Choose EUR or SEK." };
  if (!UUID.test(input.idempotencyKey.trim())) return { ok: false, error: "This payment form is no longer valid. Reload the page." };

  const amountMinor = parseMoneyMinor(input.amount);
  if (amountMinor == null) return { ok: false, error: "Enter a payment amount greater than zero, with at most two decimals." };

  const note = input.note.trim();
  if (note.length > NOTE_MAX) return { ok: false, error: "Payment note must be 500 characters or fewer." };

  const paidAt = parsePaidAt(input.paidAt, now);
  if (!paidAt) return { ok: false, error: "Enter a valid payment date and time." };

  const rateText = input.exchangeRate.trim();
  let exchangeRateE4: number | null = null;
  let eurCents: number;
  if (input.currency === "EUR") {
    if (rateText) return { ok: false, error: "An exchange rate is only used for SEK." };
    eurCents = amountMinor;
  } else {
    if (!rateText) return { ok: false, error: "Enter how many SEK equal 1 EUR. The rate is not fetched automatically." };
    exchangeRateE4 = parseExchangeRateE4(rateText);
    if (exchangeRateE4 == null) return { ok: false, error: "Enter an exchange rate greater than zero, with at most four decimals." };
    const converted = eurCentsFromSek(amountMinor, exchangeRateE4);
    if (converted == null) return { ok: false, error: "That SEK amount does not convert to a valid EUR amount." };
    eurCents = converted;
  }

  return {
    ok: true,
    draft: {
      method: input.method as PaymentMethod,
      currency: input.currency,
      amountMinor,
      exchangeRateE4,
      eurCents,
      paidAt,
      note: note || null,
      idempotencyKey: input.idempotencyKey.trim(),
    },
  };
}

export function parseCorrectionReason(value: string) {
  const reason = value.trim();
  if (!reason || reason.length > NOTE_MAX) return null;
  return reason;
}

/** Recording is refused while the public site is still in PRELAUNCH. */
export function paymentWritesAllowed(businessStatus: string) {
  return businessStatus !== "PRELAUNCH";
}

/** A submitted payment id can only change the booking that already owns it. */
export function paymentOwnedByBooking(paymentBookingId: string, bookingId: string) {
  return paymentBookingId.length > 0 && paymentBookingId === bookingId;
}

/**
 * Status comes only from active payment rows.
 * Voided rows stay in history and do not change the booking total.
 * Remaining balance never goes below zero; extra money is reported as overpaid.
 */
export function paymentSummary(bookingTotalCents: number, payments: LedgerPayment[]): PaymentSummary {
  const paidCents = payments.reduce((sum, payment) => (payment.voided ? sum : sum + payment.eurCents), 0);
  const overpaidCents = Math.max(0, paidCents - bookingTotalCents);
  const remainingCents = Math.max(0, bookingTotalCents - paidCents);
  const status: PaymentStatus = paidCents <= 0 ? "Unpaid" : paidCents < bookingTotalCents ? "Partially paid" : "Paid";
  return { bookingTotalCents, paidCents, remainingCents, overpaidCents, status };
}
