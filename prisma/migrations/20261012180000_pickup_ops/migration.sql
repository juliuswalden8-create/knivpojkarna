-- Pickup/return operations: settings, booking fields, status mapping, email log.

ALTER TABLE "SiteSettings" ADD COLUMN "pickupInstructionsEn" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SiteSettings" ADD COLUMN "pickupInstructionsEs" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SiteSettings" ADD COLUMN "returnInstructionsEn" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SiteSettings" ADD COLUMN "returnInstructionsEs" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SiteSettings" ADD COLUMN "pickupFeeCents" INTEGER;

ALTER TABLE "Booking" ADD COLUMN "pickupNotes" TEXT;
ALTER TABLE "Booking" ADD COLUMN "inServiceArea" BOOLEAN NOT NULL DEFAULT true;

-- Explicit legacy status mapping (does not delete rows).
UPDATE "Booking" SET "status" = 'PICKUP_CONFIRMED' WHERE "status" = 'CONFIRMED';
UPDATE "Booking" SET "status" = 'SHARPENING' WHERE "status" = 'IN_PROGRESS';

CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT,
    "template" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmailLog_bookingId_idx" ON "EmailLog"("bookingId");
CREATE INDEX "EmailLog_createdAt_idx" ON "EmailLog"("createdAt");

ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
