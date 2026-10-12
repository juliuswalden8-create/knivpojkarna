-- Additive delivery-zone pricing. Existing bookings and settings values are not rewritten.

ALTER TABLE "SiteSettings" ADD COLUMN "deliveryZone1FeeCents" INTEGER NOT NULL DEFAULT 500;
ALTER TABLE "SiteSettings" ADD COLUMN "deliveryZone2FeeCents" INTEGER NOT NULL DEFAULT 800;
ALTER TABLE "SiteSettings" ADD COLUMN "deliveryZone3FeeCents" INTEGER NOT NULL DEFAULT 1200;
ALTER TABLE "SiteSettings" ADD COLUMN "freeDeliveryThresholdCents" INTEGER NOT NULL DEFAULT 4900;

ALTER TABLE "Booking" ADD COLUMN "sharpeningSubtotalCents" INTEGER;
ALTER TABLE "Booking" ADD COLUMN "deliveryFeeCents" INTEGER;
ALTER TABLE "Booking" ADD COLUMN "deliveryZone" TEXT;
ALTER TABLE "Booking" ADD COLUMN "deliveryNeedsReview" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Booking" ADD COLUMN "deliveryFeeWaived" BOOLEAN NOT NULL DEFAULT false;
