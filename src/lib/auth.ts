import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import type { Role } from "@/generated/prisma/client";

const COOKIE_NAME = "tmp_session";
const SESSION_DAYS = 30;

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { token, userId, expiresAt } });
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function getSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date() || !session.user.active) {
    return null;
  }
  return session;
}

/** ตำแหน่งหน้าแรกของแต่ละ role หลังล็อกอิน/เมื่อถูกเด้งเพราะ role ไม่ตรง */
export function homePathForRole(role: Role) {
  if (role === "ADMIN") return "/admin";
  if (role === "TUTOR") return "/tutor/dashboard";
  return "/parent/dashboard";
}

export async function requireUser(next?: string) {
  const session = await getSession();
  if (!session) redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  return session.user;
}

export async function requireRole(role: Role | Role[], next?: string) {
  const user = await requireUser(next);
  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(user.role)) redirect(homePathForRole(user.role));
  return user;
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  store.delete(COOKIE_NAME);
}
