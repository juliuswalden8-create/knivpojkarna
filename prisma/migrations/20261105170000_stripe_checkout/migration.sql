-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "stripeCheckoutSessionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Booking_stripeCheckoutSessionId_key" ON "Booking"("stripeCheckoutSessionId");
