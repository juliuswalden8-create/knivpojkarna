import { prisma } from "./prisma";
import { logError } from "./safe-log";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimitMemory(key: string, limit: number, windowMs: number, now = Date.now()) {
  const current = buckets.get(key);
  if (!current || current.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (current.count >= limit) {
    return { ok: false, remaining: 0, retryAfterMs: current.resetAt - now };
  }
  current.count += 1;
  return { ok: true, remaining: limit - current.count };
}

/** @deprecated use rateLimitMemory or rateLimit */
export function rateLimit(key: string, limit: number, windowMs: number) {
  return rateLimitMemory(key, limit, windowMs);
}

export function clientKey(prefix: string, ip: string | null | undefined) {
  return `${prefix}:${ip || "unknown"}`;
}

/**
 * Database-backed limiter for serverless (Vercel) where memory resets per isolate.
 * Falls back to in-memory if the table is unavailable.
 */
export async function rateLimitPersistent(key: string, limit: number, windowMs: number) {
  const memory = rateLimitMemory(key, limit, windowMs);
  if (!memory.ok) return memory;

  try {
    const now = new Date();
    const row = await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, resetAt: new Date(now.getTime() + windowMs) },
      update: {},
    });
    if (row.resetAt <= now) {
      await prisma.rateLimit.update({
        where: { key },
        data: { count: 1, resetAt: new Date(now.getTime() + windowMs) },
      });
      return { ok: true, remaining: limit - 1 };
    }
    if (row.count >= limit) {
      return { ok: false, remaining: 0, retryAfterMs: row.resetAt.getTime() - now.getTime() };
    }
    await prisma.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    });
    return { ok: true, remaining: limit - row.count - 1 };
  } catch (err) {
    logError("rate-limit", err);
    return memory;
  }
}
