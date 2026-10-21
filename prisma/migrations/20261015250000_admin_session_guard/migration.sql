-- Bind admin sessions to the password generation, and record that the first
-- admin account has already been created. Existing bookings, prices, delivery
-- fees, and the password hash are not changed.

ALTER TABLE "AdminUser" ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "AdminGuard" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "bootstrapCompleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AdminGuard_pkey" PRIMARY KEY ("id")
);

-- Production already has an admin. Mark bootstrap finished so a later delete
-- cannot recreate the account from the environment password.
INSERT INTO "AdminGuard" ("id", "bootstrapCompleted")
SELECT 1, TRUE
WHERE EXISTS (SELECT 1 FROM "AdminUser")
  AND NOT EXISTS (SELECT 1 FROM "AdminGuard" WHERE "id" = 1);
