"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { jobPostSchema } from "@/lib/validation";
import type { FormState } from "@/app/register/actions";

function toEmptyStringUndefined(v: FormDataEntryValue | null) {
  const s = (v ?? "").toString().trim();
  return s === "" ? undefined : s;
}

export async function createJobPost(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireRole("PARENT");

  const parsed = jobPostSchema.safeParse({
    subjectId: formData.get("subjectId"),
    level: formData.get("level"),
    province: formData.get("province"),
    district: formData.get("district"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    schedule: formData.get("schedule"),
    budgetMin: toEmptyStringUndefined(formData.get("budgetMin")),
    budgetMax: toEmptyStringUndefined(formData.get("budgetMax")),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  if (
    data.budgetMin !== undefined &&
    data.budgetMax !== undefined &&
    data.budgetMin > data.budgetMax
  ) {
    return { fieldErrors: { budgetMax: ["งบสูงสุดต้องไม่น้อยกว่างบต่ำสุด"] } };
  }

  const jobPost = await prisma.jobPost.create({
    data: {
      parentId: user.id,
      subjectId: data.subjectId,
      level: data.level as never,
      province: data.province,
      district: toEmptyStringUndefined(data.district ?? null) ?? null,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      schedule: toEmptyStringUndefined(data.schedule ?? null) ?? null,
      budgetMin: data.budgetMin ?? null,
      budgetMax: data.budgetMax ?? null,
      description: toEmptyStringUndefined(data.description ?? null) ?? null,
    },
  });

  redirect(`/jobs/${jobPost.id}`);
}
