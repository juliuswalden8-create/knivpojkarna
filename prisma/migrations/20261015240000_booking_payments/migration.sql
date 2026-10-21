-- Manual payment records. Existing booking rows are not changed.
-- Amounts use integer minor units. No booking price, status, or email data is rewritten.

CREATE TABLE "BookingPayment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "exchangeRateE4" INTEGER,
    "eurCents" INTEGER NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "replacesPaymentId" TEXT,
    "voidedAt" TIMESTAMP(3),
    "voidReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingPayment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BookingPayment_bookingId_idempotencyKey_key" ON "BookingPayment"("bookingId", "idempotencyKey");
CREATE UNIQUE INDEX "BookingPayment_replacesPaymentId_key" ON "BookingPayment"("replacesPaymentId");
CREATE INDEX "BookingPayment_bookingId_idx" ON "BookingPayment"("bookingId");

ALTER TABLE "BookingPayment" ADD CONSTRAINT "BookingPayment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BookingPayment" ADD CONSTRAINT "BookingPayment_replacesPaymentId_fkey" FOREIGN KEY ("replacesPaymentId") REFERENCES "BookingPayment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "BookingPayment" ADD CONSTRAINT "BookingPayment_method_check" CHECK ("method" IN ('SWISH', 'BIZUM', 'CASH'));
ALTER TABLE "BookingPayment" ADD CONSTRAINT "BookingPayment_currency_check" CHECK ("currency" IN ('EUR', 'SEK'));
ALTER TABLE "BookingPayment" ADD CONSTRAINT "BookingPayment_amount_check" CHECK ("amountMinor" > 0 AND "eurCents" > 0);
ALTER TABLE "BookingPayment" ADD CONSTRAINT "BookingPayment_rate_check" CHECK (
    ("currency" = 'EUR' AND "exchangeRateE4" IS NULL) OR
    ("currency" = 'SEK' AND "exchangeRateE4" IS NOT NULL AND "exchangeRateE4" > 0)
);
ALTER TABLE "BookingPayment" ADD CONSTRAINT "BookingPayment_void_check" CHECK (
    ("voidedAt" IS NULL AND "voidReason" IS NULL) OR
    ("voidedAt" IS NOT NULL AND "voidReason" IS NOT NULL)
);
ALTER TABLE "BookingPayment" ADD CONSTRAINT "BookingPayment_replace_check" CHECK ("replacesPaymentId" IS NULL OR "replacesPaymentId" <> "id");
