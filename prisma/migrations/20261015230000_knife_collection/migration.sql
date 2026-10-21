-- Physical knife collection, separate from the package quantity.
-- All columns are nullable. Existing rows are left untouched.

ALTER TABLE "Booking" ADD COLUMN "knivesCollected" INTEGER;
ALTER TABLE "Booking" ADD COLUMN "collectionNotes" TEXT;
ALTER TABLE "Booking" ADD COLUMN "collectedBy" TEXT;
ALTER TABLE "Booking" ADD COLUMN "collectedAt" TIMESTAMP(3);
