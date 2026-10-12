import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const COOKIE = "kp_admin";
const TTL_SECONDS = 60 * 60 * 24 * 7;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 16) {
    throw new Error("AUTH_SECRET is missing or too short");
  }
  if (process.env.NODE_ENV === "production" && /change-me/i.test(value)) {
    throw new Error("AUTH_SECRET must be a unique production value");
  }
  return new TextEncoder().encode(value);
}

export type AdminSession = {
  sub: string;
  email: string;
};

export async function createSession(user: { id: string; email: string }) {
  const token = await new SignJWT({ email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${TTL_SECONDS}s`)
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: TTL_SECONDS,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete({ name: COOKIE, path: "/admin" });
}

export async function getSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || typeof payload.email !== "string") return null;
    return { sub: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

export async function requireAdminSession(): Promise<AdminSession> {
  const { redirect } = await import("next/navigation");
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
    throw new Error("unauthorized");
  }
  const user = await prisma.adminUser.findUnique({ where: { id: session.sub } });
  if (!user) {
    await clearSession();
    redirect("/admin/login");
    throw new Error("unauthorized");
  }
  return session;
}

export async function getAdminUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.adminUser.findUnique({ where: { id: session.sub } });
}
