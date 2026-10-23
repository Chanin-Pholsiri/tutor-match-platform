"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import {
  acceptRequest,
  counterRequest,
  declineRequest,
  RequestActionError,
} from "@/lib/learning-request";
import { counterOfferSchema } from "@/lib/validation";
import type { FormState } from "@/app/register/actions";

export async function acceptAsTutor(requestId: string) {
  const user = await requireRole("TUTOR");
  try {
    await acceptRequest(user.id, requestId);
  } catch (e) {
    if (!(e instanceof RequestActionError)) throw e;
  }
  revalidatePath(`/tutor/requests/${requestId}`);
  revalidatePath("/tutor/dashboard");
}

export async function declineAsTutor(requestId: string) {
  const user = await requireRole("TUTOR");
  try {
    await declineRequest(user.id, requestId);
  } catch (e) {
    if (!(e instanceof RequestActionError)) throw e;
  }
  revalidatePath(`/tutor/requests/${requestId}`);
  revalidatePath("/tutor/dashboard");
}

export async function counterAsTutor(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireRole("TUTOR");
  const parsed = counterOfferSchema.safeParse({
    requestId: formData.get("requestId"),
    proposedPrice: formData.get("proposedPrice"),
    note: formData.get("note"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    await counterRequest(
      user.id,
      parsed.data.requestId,
      parsed.data.proposedPrice,
      parsed.data.note || undefined,
    );
  } catch (e) {
    if (e instanceof RequestActionError) return { error: e.message };
    throw e;
  }
  revalidatePath(`/tutor/requests/${parsed.data.requestId}`);
  return { success: true };
}
