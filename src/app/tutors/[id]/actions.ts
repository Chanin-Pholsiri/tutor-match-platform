"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { learningRequestSchema } from "@/lib/validation";
import type { FormState } from "@/app/register/actions";

export async function sendLearningRequest(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parent = await requireRole("PARENT");

  const parsed = learningRequestSchema.safeParse({
    tutorId: formData.get("tutorId"),
    subjectId: formData.get("subjectId"),
    level: formData.get("level"),
    message: formData.get("message"),
    proposedPrice: formData.get("proposedPrice"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId: data.tutorId },
  });
  if (!tutorProfile || tutorProfile.approvalStatus !== "APPROVED") {
    return { error: "ไม่พบติวเตอร์ หรือติวเตอร์ยังไม่พร้อมรับคำขอ" };
  }

  const request = await prisma.learningRequest.create({
    data: {
      parentId: parent.id,
      tutorId: data.tutorId,
      subjectId: data.subjectId,
      level: data.level as never,
      message: data.message || null,
      proposedPrice: data.proposedPrice,
      originalPrice: data.proposedPrice,
      lastActionById: parent.id,
      events: {
        create: {
          actorId: parent.id,
          action: "SENT",
          price: data.proposedPrice,
          note: data.message || null,
        },
      },
    },
  });

  redirect(`/parent/requests/${request.id}`);
}
