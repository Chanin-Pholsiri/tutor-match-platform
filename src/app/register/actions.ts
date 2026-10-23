"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession, homePathForRole } from "@/lib/auth";
import { registerParentSchema, registerTutorSchema } from "@/lib/validation";
import { redirect } from "next/navigation";

export type FormState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
} | null;

function toEmptyStringUndefined(v: FormDataEntryValue | null) {
  const s = (v ?? "").toString().trim();
  return s === "" ? undefined : s;
}

export async function registerParent(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = registerParentSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    lineId: formData.get("lineId"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return { error: "อีเมลนี้ถูกใช้สมัครไปแล้ว" };
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: toEmptyStringUndefined(data.phone ?? null) ?? null,
      lineId: toEmptyStringUndefined(data.lineId ?? null) ?? null,
      passwordHash,
      role: "PARENT",
    },
  });

  await createSession(user.id);
  redirect(homePathForRole(user.role));
}

export async function registerTutor(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = registerTutorSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    lineId: formData.get("lineId"),
    province: formData.get("province"),
    district: formData.get("district"),
    bio: formData.get("bio"),
    teachingHistory: formData.get("teachingHistory"),
    hourlyRateMin: formData.get("hourlyRateMin"),
    hourlyRateMax: formData.get("hourlyRateMax"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  if (data.hourlyRateMin > data.hourlyRateMax) {
    return {
      fieldErrors: { hourlyRateMax: ["ราคาสูงสุดต้องไม่น้อยกว่าราคาต่ำสุด"] },
    };
  }

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return { error: "อีเมลนี้ถูกใช้สมัครไปแล้ว" };
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: toEmptyStringUndefined(data.phone ?? null) ?? null,
        lineId: toEmptyStringUndefined(data.lineId ?? null) ?? null,
        passwordHash,
        role: "TUTOR",
      },
    });
    await tx.tutorProfile.create({
      data: {
        userId: created.id,
        province: data.province,
        district: toEmptyStringUndefined(data.district ?? null) ?? null,
        bio: toEmptyStringUndefined(data.bio ?? null) ?? null,
        teachingHistory: toEmptyStringUndefined(data.teachingHistory ?? null) ?? null,
        hourlyRateMin: data.hourlyRateMin,
        hourlyRateMax: data.hourlyRateMax,
      },
    });
    return created;
  });

  await createSession(user.id);
  redirect("/tutor/profile?welcome=1");
}
