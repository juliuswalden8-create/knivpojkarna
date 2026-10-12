import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

/** Reuse one client per isolate (Vercel serverless + local dev). */
export const prisma = globalForPrisma.prisma ?? createClient();

globalForPrisma.prisma = prisma;
