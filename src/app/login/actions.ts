"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSession, destroySession, homePathForRole } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import type { FormState } from "../register/actions";

export async function login(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !user.active) {
    return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
  }
  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) {
    return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
  }

  await createSession(user.id);

  const next = formData.get("next")?.toString();
  redirect(next && next.startsWith("/") ? next : homePathForRole(user.role));
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
