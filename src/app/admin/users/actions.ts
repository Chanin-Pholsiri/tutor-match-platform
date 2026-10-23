"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function setUserActive(userId: string, active: boolean) {
  const admin = await requireRole("ADMIN");
  if (admin.id === userId && !active) {
    return; // กันแอดมินปิดบัญชีตัวเอง
  }
  await prisma.user.update({ where: { id: userId }, data: { active } });
  revalidatePath("/admin/users");
}
