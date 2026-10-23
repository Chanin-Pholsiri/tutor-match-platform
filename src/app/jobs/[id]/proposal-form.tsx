"use client";

import { useActionState } from "react";
import { submitProposalAsTutor } from "./actions";
import type { FormState } from "@/app/register/actions";

const initialState: FormState = null;

export function ProposalForm({
  jobPostId,
  initialMessage,
  initialPrice,
}: {
  jobPostId: string;
  initialMessage?: string;
  initialPrice?: string;
}) {
  const [state, formAction, pending] = useActionState(submitProposalAsTutor, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="jobPostId" value={jobPostId} />
      <div>
        <label className="label" htmlFor="message">
          แนะนำตัวและอธิบายว่าทำไมคุณเหมาะกับงานนี้
        </label>
        <textarea
          className="input"
          id="message"
          name="message"
          rows={4}
          defaultValue={initialMessage}
          required
        />
        {state?.fieldErrors?.message && (
          <p className="field-error">{state.fieldErrors.message[0]}</p>
        )}
      </div>
      <div>
        <label className="label" htmlFor="proposedPrice">
          ราคาที่เสนอ (บาท/ชั่วโมง)
        </label>
        <input
          className="input"
          id="proposedPrice"
          name="proposedPrice"
          type="number"
          min={1}
          defaultValue={initialPrice}
          required
        />
        {state?.fieldErrors?.proposedPrice && (
          <p className="field-error">{state.fieldErrors.proposedPrice[0]}</p>
        )}
      </div>
      {state?.error && <p className="field-error">{state.error}</p>}
      <button className="btn-primary" type="submit" disabled={pending}>
        {pending ? "กำลังส่ง..." : initialMessage ? "แก้ไขข้อเสนอ" : "นำเสนอตัวเอง"}
      </button>
    </form>
  );
}
