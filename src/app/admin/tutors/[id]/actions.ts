"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { rejectTutorSchema, tutorProfileSchema } from "@/lib/validation";
import type { FormState } from "@/app/register/actions";

function toEmptyStringUndefined(v: FormDataEntryValue | null) {
  const s = (v ?? "").toString().trim();
  return s === "" ? undefined : s;
}

export async function approveTutor(tutorProfileId: string) {
  const admin = await requireRole("ADMIN");
  const profile = await prisma.tutorProfile.findUniqueOrThrow({
    where: { id: tutorProfileId },
  });

  if (!profile.idCardData) {
    // ป้องกันไว้อีกชั้น — ปกติ UI จะซ่อนปุ่มอนุมัติไว้แล้วถ้ายังไม่มีเอกสารยืนยันตัวตน
    redirect(`/admin/tutors/${tutorProfileId}`);
  }

  await prisma.tutorProfile.update({
    where: { id: tutorProfileId },
    data: {
      approvalStatus: "APPROVED",
      rejectionReason: null,
      reviewedById: admin.id,
      reviewedAt: new Date(),
      publishedAt: profile.publishedAt ?? new Date(),
    },
  });

  revalidatePath("/admin/tutors");
  revalidatePath(`/admin/tutors/${tutorProfileId}`);
  redirect("/admin/tutors");
}

export async function rejectTutor(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await requireRole("ADMIN");
  const parsed = rejectTutorSchema.safeParse({
    tutorProfileId: formData.get("tutorProfileId"),
    rejectionReason: formData.get("rejectionReason"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.tutorProfile.update({
    where: { id: parsed.data.tutorProfileId },
    data: {
      approvalStatus: "REJECTED",
      rejectionReason: parsed.data.rejectionReason,
      reviewedById: admin.id,
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/admin/tutors");
  revalidatePath(`/admin/tutors/${parsed.data.tutorProfileId}`);
  redirect("/admin/tutors");
}

export async function adminUpdateTutorProfile(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireRole("ADMIN");
  const tutorProfileId = formData.get("tutorProfileId")?.toString();
  if (!tutorProfileId) return { error: "ไม่พบโปรไฟล์" };

  let subjects: unknown = [];
  try {
    subjects = JSON.parse(formData.get("subjectsJson")?.toString() ?? "[]");
  } catch {
    subjects = [];
  }

  const parsed = tutorProfileSchema.safeParse({
    bio: formData.get("bio"),
    teachingHistory: formData.get("teachingHistory"),
    province: formData.get("province"),
    district: formData.get("district"),
    hourlyRateMin: formData.get("hourlyRateMin"),
    hourlyRateMax: formData.get("hourlyRateMax"),
    lineId: formData.get("lineId"),
    subjects,
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

  const profile = await prisma.tutorProfile.findUniqueOrThrow({
    where: { id: tutorProfileId },
  });

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: profile.userId },
      data: { lineId: toEmptyStringUndefined(data.lineId ?? null) ?? null },
    });
    await tx.tutorProfile.update({
      where: { id: tutorProfileId },
      data: {
        bio: toEmptyStringUndefined(data.bio ?? null) ?? null,
        teachingHistory: toEmptyStringUndefined(data.teachingHistory ?? null) ?? null,
        province: data.province,
        district: toEmptyStringUndefined(data.district ?? null) ?? null,
        hourlyRateMin: data.hourlyRateMin,
        hourlyRateMax: data.hourlyRateMax,
      },
    });
    await tx.tutorSubject.deleteMany({ where: { tutorId: tutorProfileId } });
    if (data.subjects.length > 0) {
      await tx.tutorSubject.createMany({
        data: data.subjects.map((s) => ({
          tutorId: tutorProfileId,
          subjectId: s.subjectId,
          level: s.level as never,
        })),
        skipDuplicates: true,
      });
    }
  });

  revalidatePath(`/admin/tutors/${tutorProfileId}`);
  return { success: true };
}
