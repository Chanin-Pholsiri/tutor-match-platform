"use client";

import { useActionState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { THAI_PROVINCES } from "@/lib/constants";
import { registerTutor, type FormState } from "./actions";

const initialState: FormState = null;

export function TutorRegisterForm() {
  const [state, formAction, pending] = useActionState(registerTutor, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="t-name">
          ชื่อ-นามสกุล
        </label>
        <input className="input" id="t-name" name="name" required />
        {state?.fieldErrors?.name && (
          <p className="field-error">{state.fieldErrors.name[0]}</p>
        )}
      </div>
      <div>
        <label className="label" htmlFor="t-email">
          อีเมล
        </label>
        <input className="input" id="t-email" name="email" type="email" required />
        {state?.fieldErrors?.email && (
          <p className="field-error">{state.fieldErrors.email[0]}</p>
        )}
      </div>
      <div>
        <label className="label" htmlFor="t-phone">
          เบอร์โทร (ไม่บังคับ)
        </label>
        <input className="input" id="t-phone" name="phone" placeholder="08xxxxxxxx" />
      </div>
      <div>
        <label className="label" htmlFor="t-line">
          LINE ID (ใช้ติดต่อผู้ปกครองหลังตกลงราคาแล้ว)
        </label>
        <input className="input" id="t-line" name="lineId" />
      </div>
      <div>
        <label className="label" htmlFor="t-password">
          รหัสผ่าน
        </label>
        <input
          className="input"
          id="t-password"
          name="password"
          type="password"
          required
        />
        {state?.fieldErrors?.password && (
          <p className="field-error">{state.fieldErrors.password[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="t-province">
            จังหวัด
          </label>
          <Select name="province" required>
            <SelectTrigger id="t-province" className="w-full">
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
          {state?.fieldErrors?.province && (
            <p className="field-error">{state.fieldErrors.province[0]}</p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="t-district">
            เขต/อำเภอ (ไม่บังคับ)
          </label>
          <input className="input" id="t-district" name="district" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="t-rate-min">
            ค่าสอนต่อชั่วโมง (ต่ำสุด, บาท)
          </label>
          <input
            className="input"
            id="t-rate-min"
            name="hourlyRateMin"
            type="number"
            min={0}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="t-rate-max">
            ค่าสอนต่อชั่วโมง (สูงสุด, บาท)
          </label>
          <input
            className="input"
            id="t-rate-max"
            name="hourlyRateMax"
            type="number"
            min={0}
            required
          />
          {state?.fieldErrors?.hourlyRateMax && (
            <p className="field-error">{state.fieldErrors.hourlyRateMax[0]}</p>
          )}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="t-bio">
          แนะนำตัว (ไม่บังคับ)
        </label>
        <textarea className="input" id="t-bio" name="bio" rows={3} />
      </div>
      <div>
        <label className="label" htmlFor="t-history">
          ประวัติการสอน/ประสบการณ์ (ไม่บังคับ)
        </label>
        <textarea className="input" id="t-history" name="teachingHistory" rows={3} />
      </div>

      <p className="text-xs text-muted-foreground">
        หลังสมัครแล้ว คุณจะต้องเพิ่มวิชาที่สอนในหน้าโปรไฟล์
        และรอแอดมินตรวจสอบก่อนโปรไฟล์จะแสดงในผลค้นหา
      </p>

      {state?.error && <p className="field-error">{state.error}</p>}
      <button className="btn-primary w-full" type="submit" disabled={pending}>
        {pending ? "กำลังสมัคร..." : "สมัครเป็นติวเตอร์"}
      </button>
    </form>
  );
}
