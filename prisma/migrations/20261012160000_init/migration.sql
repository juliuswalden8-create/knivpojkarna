-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "whatsappNumber" TEXT NOT NULL DEFAULT '',
    "whatsappMessageEn" TEXT NOT NULL DEFAULT 'Hi Knivpojkarna! I would like to book a knife sharpening service in Marbella.',
    "whatsappMessageEs" TEXT NOT NULL DEFAULT '¡Hola Knivpojkarna! Me gustaría reservar un servicio de afilado de cuchillos en Marbella.',
    "contactEmail" TEXT NOT NULL DEFAULT '',
    "instagramUrl" TEXT NOT NULL DEFAULT '',
    "openWeekdays" TEXT NOT NULL DEFAULT '1,2,3,4,5,6',
    "timeSlots" TEXT NOT NULL DEFAULT '09:00-12:00,12:00-15:00,15:00-18:00',
    "leadTimeDays" INTEGER NOT NULL DEFAULT 1,
    "bookingWindowDays" INTEGER NOT NULL DEFAULT 60,
    "extraKnifePriceCents" INTEGER NOT NULL DEFAULT 700,
    "businessStatus" TEXT NOT NULL DEFAULT 'PRELAUNCH',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameEs" TEXT NOT NULL,
    "nameSv" TEXT,
    "priceCents" INTEGER NOT NULL,
    "knifeCount" INTEGER NOT NULL,
    "featuresEn" TEXT NOT NULL DEFAULT '[]',
    "featuresEs" TEXT NOT NULL DEFAULT '[]',
    "featuresSv" TEXT,
    "highlighted" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "packageId" TEXT,
    "packageName" TEXT NOT NULL,
    "knifeCount" INTEGER NOT NULL,
    "knifeTypes" TEXT NOT NULL DEFAULT '{}',
    "serviceType" TEXT NOT NULL,
    "addressLine" TEXT,
    "postalCode" TEXT,
    "areaName" TEXT,
    "preferredDate" TIMESTAMP(3),
    "preferredTimeSlot" TEXT,
    "scheduledDate" TIMESTAMP(3),
    "scheduledTimeSlot" TEXT,
    "customerName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "comments" TEXT,
    "estimatedTotalCents" INTEGER NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "consentAt" TIMESTAMP(3) NOT NULL,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessInquiry" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "businessName" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "estimatedKnives" INTEGER,
    "frequency" TEXT,
    "needsPickup" BOOLEAN NOT NULL DEFAULT false,
    "address" TEXT,
    "message" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "consentAt" TIMESTAMP(3) NOT NULL,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceArea" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL DEFAULT '',
    "descriptionEs" TEXT NOT NULL DEFAULT '',
    "descriptionSv" TEXT,
    "pickupStatus" TEXT NOT NULL DEFAULT 'ON_REQUEST',
    "mapX" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "mapY" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockedDate" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,

    CONSTRAINT "BlockedDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "resetAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Package_slug_key" ON "Package"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_reference_key" ON "Booking"("reference");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Booking_createdAt_idx" ON "Booking"("createdAt");

-- CreateIndex
CREATE INDEX "Booking_email_idx" ON "Booking"("email");

-- CreateIndex
CREATE INDEX "Booking_phone_idx" ON "Booking"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessInquiry_reference_key" ON "BusinessInquiry"("reference");

-- CreateIndex
CREATE INDEX "BusinessInquiry_status_idx" ON "BusinessInquiry"("status");

-- CreateIndex
CREATE INDEX "BusinessInquiry_createdAt_idx" ON "BusinessInquiry"("createdAt");

-- CreateIndex
CREATE INDEX "BusinessInquiry_email_idx" ON "BusinessInquiry"("email");

-- CreateIndex
CREATE INDEX "BusinessInquiry_phone_idx" ON "BusinessInquiry"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceArea_slug_key" ON "ServiceArea"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedDate_date_key" ON "BlockedDate"("date");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;
