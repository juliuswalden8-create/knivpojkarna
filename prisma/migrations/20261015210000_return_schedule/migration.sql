-- Confirmed return schedule, separate from pickup.
-- Both columns are nullable. Existing rows are left untouched.

ALTER TABLE "Booking" ADD COLUMN "scheduledReturnDate" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN "scheduledReturnTimeSlot" TEXT;
