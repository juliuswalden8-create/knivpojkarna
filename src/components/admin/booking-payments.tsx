import { randomUUID } from "node:crypto";
import { correctBookingPayment, recordBookingPayment } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import {
  PAYMENT_CURRENCIES,
  PAYMENT_METHODS,
  formatExchangeRate,
  formatMinor,
  formatUtcDateTime,
  paymentMethodLabel,
  paymentSummary,
  toUtcDateTimeLocal,
  type PaymentCurrency,
} from "@/lib/payments";

type PaymentRow = {
  id: string;
  method: string;
  currency: string;
  amountMinor: number;
  exchangeRateE4: number | null;
  eurCents: number;
  paidAt: Date;
  note: string | null;
  replacesPaymentId: string | null;
  voidedAt: Date | null;
  voidReason: string | null;
};

function currencyOf(value: string): PaymentCurrency {
  return value === "SEK" ? "SEK" : "EUR";
}

export function BookingPayments({
  bookingId,
  totalCents,
  payments,
  prelaunch,
}: {
  bookingId: string;
  totalCents: number;
  payments: PaymentRow[];
  prelaunch: boolean;
}) {
  const summary = paymentSummary(
    totalCents,
    payments.map((payment) => ({ eurCents: payment.eurCents, voided: payment.voidedAt != null })),
  );

  return (
    <section className="mt-8">
      <h2 className="font-serif text-2xl">Payments</h2>
      <p className="mt-2 text-sm text-stone">Recorded manually. Nothing is sent to Swish, Bizum, or a bank, and no payment email is sent.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="border border-line bg-soft px-4 py-4 text-sm">
          <span className="kicker block">Total booking amount</span>
          <p className="mt-2 text-lg">{formatPrice(summary.bookingTotalCents)}</p>
        </div>
        <div className="border border-line bg-soft px-4 py-4 text-sm">
          <span className="kicker block">Total paid</span>
          <p className="mt-2 text-lg">{formatPrice(summary.paidCents)}</p>
        </div>
        <div className="border border-line bg-soft px-4 py-4 text-sm">
          <span className="kicker block">Remaining balance</span>
          <p className="mt-2 text-lg">{formatPrice(summary.remainingCents)}</p>
          {summary.overpaidCents > 0 ? (
            <p className="mt-1 text-ember">Overpaid {formatPrice(summary.overpaidCents)}</p>
          ) : null}
        </div>
        <div className="border border-line bg-soft px-4 py-4 text-sm">
          <span className="kicker block">Payment status</span>
          <p className="mt-2 text-lg">{summary.status}</p>
        </div>
      </div>
      {prelaunch ? (
        <p className="mt-3 text-sm text-stone">Payments cannot be recorded while the site is in PRELAUNCH.</p>
      ) : (
        <PaymentForm bookingId={bookingId} action={recordBookingPayment} submitLabel="Record payment" />
      )}

      <h3 className="mt-8 font-serif text-xl">Payment history</h3>
      {payments.length === 0 ? (
        <p className="mt-3 text-sm text-stone">No payments recorded.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {payments.map((payment) => {
            const currency = currencyOf(payment.currency);
            const voided = payment.voidedAt != null;
            return (
              <li key={payment.id} className="border border-line p-4 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-lg">{paymentMethodLabel(payment.method)}</p>
                  <p className="text-stone">{formatUtcDateTime(payment.paidAt)}</p>
                </div>
                <p className="mt-2">
                  {formatMinor(payment.amountMinor, currency)}
                  {payment.currency === "SEK" && payment.exchangeRateE4 != null
                    ? ` at ${formatExchangeRate(payment.exchangeRateE4)} SEK per EUR`
                    : ""}
                  {" · "}
                  {formatPrice(payment.eurCents)} equivalent
                </p>
                {payment.note ? <p className="mt-2 text-stone">{payment.note}</p> : null}
                {payment.replacesPaymentId ? <p className="mt-2 text-stone">Correction of an earlier payment.</p> : null}
                {voided ? (
                  <p className="mt-2 text-ember">
                    Corrected {payment.voidedAt ? formatUtcDateTime(payment.voidedAt) : ""}. Not included in the balance.
                    {payment.voidReason ? ` ${payment.voidReason}` : ""}
                  </p>
                ) : null}
                {!prelaunch && !voided ? (
                  <PaymentForm
                    bookingId={bookingId}
                    paymentId={payment.id}
                    action={correctBookingPayment}
                    submitLabel="Save correction"
                    reason
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function PaymentForm({
  bookingId,
  paymentId,
  action,
  submitLabel,
  reason = false,
}: {
  bookingId: string;
  paymentId?: string;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  reason?: boolean;
}) {
  return (
    <form action={action} className="mt-4 grid gap-4 border border-line p-4">
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="idempotencyKey" value={randomUUID()} />
      {paymentId ? <input type="hidden" name="paymentId" value={paymentId} /> : null}
      {reason ? (
        <label>
          <span className="kicker">Reason for correction</span>
          <input name="voidReason" required maxLength={500} className="field mt-2" />
        </label>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="kicker">Payment method</span>
          <select name="method" required className="field mt-2" defaultValue="SWISH">
            {PAYMENT_METHODS.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="kicker">Currency</span>
          <select name="currency" required className="field mt-2" defaultValue="EUR">
            {PAYMENT_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="kicker">Amount received</span>
          <input name="amount" required inputMode="decimal" className="field mt-2" />
        </label>
        <label>
          <span className="kicker">Exchange rate</span>
          <input name="exchangeRate" inputMode="decimal" placeholder="SEK for 1 EUR" className="field mt-2" />
        </label>
        <label>
          <span className="kicker">Payment date and time (UTC)</span>
          <input type="datetime-local" name="paidAt" required defaultValue={toUtcDateTimeLocal(new Date())} className="field mt-2" />
        </label>
        <label>
          <span className="kicker">Payment note</span>
          <input name="note" maxLength={500} className="field mt-2" />
        </label>
      </div>
      <p className="text-sm text-stone">For SEK, enter the rate yourself. It is stored with the payment and used to calculate the EUR equivalent.</p>
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
