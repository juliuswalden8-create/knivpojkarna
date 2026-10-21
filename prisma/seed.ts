import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { shouldBootstrapAdmin } from "../src/lib/admin-bootstrap";
import { LAUNCH_SERVICE_AREAS } from "../src/lib/launch-areas";

const prisma = new PrismaClient();

async function finishBootstrap() {
  await prisma.adminGuard.upsert({
    where: { id: 1 },
    update: { bootstrapCompleted: true },
    create: { id: 1, bootstrapCompleted: true },
  });
}

async function main() {
  // --- Admin user -----------------------------------------------------------
  // The environment password can create the first account only. After that,
  // deleting the account must not recreate it on the next deploy.
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const adminCount = await prisma.adminUser.count();
  const guard = await prisma.adminGuard.findUnique({ where: { id: 1 } });
  const bootstrapCompleted = guard?.bootstrapCompleted ?? false;

  if (adminCount > 0) {
    if (!bootstrapCompleted) await finishBootstrap();
  } else if (email && password && shouldBootstrapAdmin(adminCount, bootstrapCompleted)) {
    await prisma.adminUser.create({
      data: { email, passwordHash: await bcrypt.hash(password, 12) },
    });
    await finishBootstrap();
    console.log(`Created admin user ${email}`);
  } else if (bootstrapCompleted) {
    console.warn("Admin account is missing and will not be recreated from the environment password.");
  } else {
    console.warn("ADMIN_EMAIL / ADMIN_PASSWORD not set – skipping admin user.");
  }

  // --- Site settings --------------------------------------------------------
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      businessStatus: "PRELAUNCH",
      whatsappNumber: process.env.WHATSAPP_NUMBER ?? "",
      contactEmail: process.env.CONTACT_EMAIL ?? "",
    },
  });

  // --- Packages -------------------------------------------------------------
  const packages = [
    {
      slug: "single-edge",
      nameEn: "Single Edge",
      nameEs: "Filo Único",
      nameSv: "Enkel Egg",
      priceCents: 700,
      knifeCount: 1,
      featuresEn: JSON.stringify(["Professional sharpening", "Edge inspection"]),
      featuresEs: JSON.stringify(["Afilado profesional", "Inspección del filo"]),
      featuresSv: JSON.stringify(["Professionell slipning", "Egginspektion"]),
      highlighted: false,
      sortOrder: 1,
    },
    {
      slug: "everyday-set",
      nameEn: "Everyday Set",
      nameEs: "Set Diario",
      nameSv: "Vardagssetet",
      priceCents: 1800,
      knifeCount: 3,
      highlighted: false,
      sortOrder: 2,
    },
    {
      slug: "kitchen-essentials",
      nameEn: "Kitchen Essentials",
      nameEs: "Esenciales de Cocina",
      nameSv: "Köksbasen",
      priceCents: 2700,
      knifeCount: 5,
      highlighted: true,
      sortOrder: 3,
    },
    {
      slug: "complete-collection",
      nameEn: "Complete Collection",
      nameEs: "Colección Completa",
      nameSv: "Hela Samlingen",
      priceCents: 4900,
      knifeCount: 10,
      highlighted: false,
      sortOrder: 4,
    },
  ];
  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { slug: pkg.slug },
      update: {},
      create: pkg,
    });
  }

  // --- Service areas --------------------------------------------------------
  for (const area of LAUNCH_SERVICE_AREAS) {
    await prisma.serviceArea.upsert({
      where: { slug: area.slug },
      update: {},
      create: {
        slug: area.slug,
        name: area.name,
        descriptionEn: area.descriptionEn,
        descriptionEs: area.descriptionEs,
        mapX: area.mapX,
        mapY: area.mapY,
        sortOrder: area.sortOrder,
        pickupStatus: area.pickupStatus,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
