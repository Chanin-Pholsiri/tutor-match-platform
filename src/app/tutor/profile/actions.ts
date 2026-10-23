"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { tutorProfileSchema } from "@/lib/validation";
import type { FormState } from "@/app/register/actions";

function toEmptyStringUndefined(v: FormDataEntryValue | null) {
  const s = (v ?? "").toString().trim();
  return s === "" ? undefined : s;
}

export async function updateTutorProfile(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireRole("TUTOR");

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

  const photoUrl = toEmptyStringUndefined(formData.get("photoUrl"));

  const profile = await prisma.tutorProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    return { error: "ไม่พบโปรไฟล์ติวเตอร์" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { lineId: toEmptyStringUndefined(data.lineId ?? null) ?? null },
    });

    await tx.tutorProfile.update({
      where: { id: profile.id },
      data: {
        bio: toEmptyStringUndefined(data.bio ?? null) ?? null,
        teachingHistory: toEmptyStringUndefined(data.teachingHistory ?? null) ?? null,
        province: data.province,
        district: toEmptyStringUndefined(data.district ?? null) ?? null,
        hourlyRateMin: data.hourlyRateMin,
        hourlyRateMax: data.hourlyRateMax,
        photoUrl: photoUrl ?? profile.photoUrl,
        // แก้ไขโปรไฟล์ที่เคยถูกปฏิเสธ = ส่งกลับเข้าคิวตรวจสอบใหม่
        ...(profile.approvalStatus === "REJECTED"
          ? { approvalStatus: "PENDING" as const, rejectionReason: null }
          : {}),
      },
    });

    await tx.tutorSubject.deleteMany({ where: { tutorId: profile.id } });
    if (data.subjects.length > 0) {
      await tx.tutorSubject.createMany({
        data: data.subjects.map((s) => ({
          tutorId: profile.id,
          subjectId: s.subjectId,
          level: s.level as never,
        })),
        skipDuplicates: true,
      });
    }
  });

  revalidatePath("/tutor/profile");
  return { success: true };
}
