"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/register/actions";

const initialState: FormState = null;

export function CounterForm({
  requestId,
  action,
}: {
  requestId: string;
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="card space-y-3">
      <input type="hidden" name="requestId" value={requestId} />
      <p className="font-medium">เสนอราคาใหม่</p>
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
          required
        />
        {state?.fieldErrors?.proposedPrice && (
          <p className="field-error">{state.fieldErrors.proposedPrice[0]}</p>
        )}
      </div>
      <div>
        <label className="label" htmlFor="note">
          หมายเหตุ (ไม่บังคับ)
        </label>
        <textarea className="input" id="note" name="note" rows={2} />
      </div>
      {state?.error && <p className="field-error">{state.error}</p>}
      <button className="btn-secondary" type="submit" disabled={pending}>
        {pending ? "กำลังส่ง..." : "ส่งราคาใหม่"}
      </button>
    </form>
  );
}
