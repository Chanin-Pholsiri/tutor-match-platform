"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { closeJobPost, selectJobProposal, submitJobProposal } from "@/lib/job-post";
import { RequestActionError } from "@/lib/learning-request";
import { jobProposalSchema } from "@/lib/validation";
import type { FormState } from "@/app/register/actions";

export async function submitProposalAsTutor(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireRole("TUTOR");
  const parsed = jobProposalSchema.safeParse({
    jobPostId: formData.get("jobPostId"),
    message: formData.get("message"),
    proposedPrice: formData.get("proposedPrice"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    await submitJobProposal(
      user.id,
      parsed.data.jobPostId,
      parsed.data.message,
      parsed.data.proposedPrice,
    );
  } catch (e) {
    if (e instanceof RequestActionError) return { error: e.message };
    throw e;
  }
  revalidatePath(`/jobs/${parsed.data.jobPostId}`);
  return { success: true };
}

export async function selectProposalAsParent(jobPostId: string, proposalId: string) {
  const user = await requireRole("PARENT");
  const request = await selectJobProposal(user.id, jobPostId, proposalId);
  redirect(`/parent/requests/${request.id}`);
}

export async function closeJobPostAsParent(jobPostId: string) {
  const user = await requireRole("PARENT");
  try {
    await closeJobPost(user.id, jobPostId);
  } catch (e) {
    if (!(e instanceof RequestActionError)) throw e;
  }
  revalidatePath(`/jobs/${jobPostId}`);
  revalidatePath("/parent/jobs");
}
