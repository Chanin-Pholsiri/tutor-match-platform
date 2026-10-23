"use client";

import { useActionState, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GRADE_LEVEL_LABELS } from "@/lib/constants";
import { sendLearningRequest } from "./actions";
import type { FormState } from "@/app/register/actions";

const initialState: FormState = null;

type SubjectOption = { subjectId: string; subjectName: string; level: string };

export function RequestForm({
  tutorId,
  subjectOptions,
}: {
  tutorId: string;
  subjectOptions: SubjectOption[];
}) {
  const [state, formAction, pending] = useActionState(sendLearningRequest, initialState);
  const [combo, setCombo] = useState("");

  const [subjectId, level] = combo ? combo.split("::") : ["", ""];

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="tutorId" value={tutorId} />
      <input type="hidden" name="subjectId" value={subjectId} />
      <input type="hidden" name="level" value={level} />

      <div>
        <label className="label">วิชาที่ต้องการเรียน</label>
        <Select value={combo} onValueChange={setCombo} required>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="เลือกวิชา/ระดับชั้น" />
          </SelectTrigger>
          <SelectContent>
            {subjectOptions.map((s) => (
              <SelectItem key={`${s.subjectId}::${s.level}`} value={`${s.subjectId}::${s.level}`}>
                {s.subjectName} ·{" "}
                {GRADE_LEVEL_LABELS[s.level as keyof typeof GRADE_LEVEL_LABELS]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.fieldErrors?.subjectId && (
          <p className="field-error">กรุณาเลือกวิชา</p>
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
          required
        />
        {state?.fieldErrors?.proposedPrice && (
          <p className="field-error">{state.fieldErrors.proposedPrice[0]}</p>
        )}
      </div>

      <div>
        <label className="label" htmlFor="message">
          รายละเอียดเพิ่มเติม (ไม่บังคับ)
        </label>
        <textarea className="input" id="message" name="message" rows={3} />
      </div>

      {state?.error && <p className="field-error">{state.error}</p>}
      <button className="btn-cta w-full" type="submit" disabled={pending || !combo}>
        {pending ? "กำลังส่งคำขอ..." : "ส่งคำขอเรียน"}
      </button>
    </form>
  );
}
