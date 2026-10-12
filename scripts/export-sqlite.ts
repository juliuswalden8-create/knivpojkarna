/**
 * Read-only dump of the local SQLite database.
 * Does not modify prisma/dev.db. Output is gitignored (may contain customer PII).
 *
 * Usage (while Prisma provider is still sqlite, or against a copied file):
 *   DATABASE_URL="file:./prisma/dev.db" npx tsx scripts/export-sqlite.ts
 */
import { mkdirSync, writeFileSync, copyFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

const outDir = resolve(process.cwd(), "prisma/exports");
const backupDir = resolve(process.cwd(), "prisma/backups");
mkdirSync(outDir, { recursive: true });
mkdirSync(backupDir, { recursive: true });

const sqliteFile = resolve(process.cwd(), "prisma/dev.db");
if (existsSync(sqliteFile)) {
  copyFileSync(sqliteFile, resolve(backupDir, "dev.db"));
  console.log("Copied prisma/dev.db → prisma/backups/dev.db");
}

const prisma = new PrismaClient();

function json(value: unknown) {
  return JSON.stringify(
    value,
    (_key, v) => (v instanceof Date ? v.toISOString() : v),
    2,
  );
}

async function main() {
  const payload = {
    exportedAt: new Date().toISOString(),
    adminUsers: await prisma.adminUser.findMany(),
    siteSettings: await prisma.siteSettings.findMany(),
    packages: await prisma.package.findMany(),
    bookings: await prisma.booking.findMany(),
    businessInquiries: await prisma.businessInquiry.findMany(),
    serviceAreas: await prisma.serviceArea.findMany(),
    blockedDates: await prisma.blockedDate.findMany(),
  };

  const file = resolve(outDir, `sqlite-export.json`);
  writeFileSync(file, json(payload));
  console.log(`Wrote ${file}`);
  console.log(
    `Counts: admins=${payload.adminUsers.length} bookings=${payload.bookings.length} inquiries=${payload.businessInquiries.length} packages=${payload.packages.length} areas=${payload.serviceAreas.length}`,
  );
}

main()
  .catch((err) => {
    console.error("Export failed:", err instanceof Error ? err.name : "error");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

void dirname;
