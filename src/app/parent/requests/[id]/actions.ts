"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import {
  acceptRequest,
  cancelRequest,
  counterRequest,
  declineRequest,
  RequestActionError,
} from "@/lib/learning-request";
import { submitReview } from "@/lib/review";
import { counterOfferSchema, reviewSchema } from "@/lib/validation";
import type { FormState } from "@/app/register/actions";

export async function acceptAsParent(requestId: string) {
  const user = await requireRole("PARENT");
  try {
    await acceptRequest(user.id, requestId);
  } catch (e) {
    if (!(e instanceof RequestActionError)) throw e;
  }
  revalidatePath(`/parent/requests/${requestId}`);
  revalidatePath("/parent/dashboard");
}

export async function declineAsParent(requestId: string) {
  const user = await requireRole("PARENT");
  try {
    await declineRequest(user.id, requestId);
  } catch (e) {
    if (!(e instanceof RequestActionError)) throw e;
  }
  revalidatePath(`/parent/requests/${requestId}`);
  revalidatePath("/parent/dashboard");
}

export async function cancelAsParent(requestId: string) {
  const user = await requireRole("PARENT");
  try {
    await cancelRequest(user.id, requestId);
  } catch (e) {
    if (!(e instanceof RequestActionError)) throw e;
  }
  revalidatePath(`/parent/requests/${requestId}`);
  revalidatePath("/parent/dashboard");
}

export async function counterAsParent(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireRole("PARENT");
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
  revalidatePath(`/parent/requests/${parsed.data.requestId}`);
  return { success: true };
}

export async function submitReviewAsParent(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireRole("PARENT");
  const parsed = reviewSchema.safeParse({
    requestId: formData.get("requestId"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    await submitReview(
      user.id,
      parsed.data.requestId,
      parsed.data.rating,
      parsed.data.comment,
    );
  } catch (e) {
    if (e instanceof RequestActionError) return { error: e.message };
    throw e;
  }
  revalidatePath(`/parent/requests/${parsed.data.requestId}`);
  return { success: true };
}
