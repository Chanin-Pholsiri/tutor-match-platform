"use client";

import { useActionState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GRADE_LEVEL_LABELS, GRADE_LEVELS, THAI_PROVINCES } from "@/lib/constants";
import { createJobPost } from "./actions";
import type { FormState } from "@/app/register/actions";

const initialState: FormState = null;

export function JobPostForm({ subjects }: { subjects: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createJobPost, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="subjectId">
            วิชาที่ต้องการ
          </label>
          <Select name="subjectId" required>
            <SelectTrigger id="subjectId" className="w-full">
              <SelectValue placeholder="เลือกวิชา" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state?.fieldErrors?.subjectId && (
            <p className="field-error">{state.fieldErrors.subjectId[0]}</p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="level">
            ระดับชั้น
          </label>
          <Select name="level" required>
            <SelectTrigger id="level" className="w-full">
              <SelectValue placeholder="เลือกระดับชั้น" />
            </SelectTrigger>
            <SelectContent>
              {GRADE_LEVELS.map((l) => (
                <SelectItem key={l} value={l}>
                  {GRADE_LEVEL_LABELS[l]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="province">
            จังหวัด
          </label>
          <Select name="province" required>
            <SelectTrigger id="province" className="w-full">
              <SelectValue placeholder="เลือกจังหวัด" />
            </SelectTrigger>
            <SelectContent>
              {THAI_PROVINCES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="label" htmlFor="district">
            เขต/อำเภอ (ไม่บังคับ)
          </label>
          <input className="input" id="district" name="district" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="startDate">
            เปิดรับตั้งแต่วันที่
          </label>
          <input className="input" id="startDate" name="startDate" type="date" required />
          {state?.fieldErrors?.startDate && (
            <p className="field-error">{state.fieldErrors.startDate[0]}</p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="endDate">
            ถึงวันที่
          </label>
          <input className="input" id="endDate" name="endDate" type="date" required />
          {state?.fieldErrors?.endDate && (
            <p className="field-error">{state.fieldErrors.endDate[0]}</p>
          )}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="schedule">
          วันที่/เวลาที่สะดวกเรียน (ไม่บังคับ)
        </label>
        <input
          className="input"
          id="schedule"
          name="schedule"
          placeholder="เช่น เสาร์-อาทิตย์ ช่วงบ่าย"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="budgetMin">
            งบต่อชั่วโมง ต่ำสุด (บาท, ไม่บังคับ)
          </label>
          <input className="input" id="budgetMin" name="budgetMin" type="number" min={0} />
        </div>
        <div>
          <label className="label" htmlFor="budgetMax">
            งบต่อชั่วโมง สูงสุด (บาท, ไม่บังคับ)
          </label>
          <input className="input" id="budgetMax" name="budgetMax" type="number" min={0} />
          {state?.fieldErrors?.budgetMax && (
            <p className="field-error">{state.fieldErrors.budgetMax[0]}</p>
          )}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="description">
          รายละเอียดเพิ่มเติม (ไม่บังคับ)
        </label>
        <textarea
          className="input"
          id="description"
          name="description"
          rows={4}
          placeholder="เช่น เป้าหมายการเรียน ระดับพื้นฐานของน้อง สถานที่เรียน (ที่บ้าน/ออนไลน์)"
        />
      </div>

      {state?.error && <p className="field-error">{state.error}</p>}
      <button className="btn-primary w-full" type="submit" disabled={pending}>
        {pending ? "กำลังโพสต์..." : "โพสต์ประกาศหาติวเตอร์"}
      </button>
    </form>
  );
}
