"use client";

import { useActionState } from "react";
import { registerParent, type FormState } from "./actions";

const initialState: FormState = null;

export function ParentRegisterForm() {
  const [state, formAction, pending] = useActionState(registerParent, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="p-name">
          ชื่อ-นามสกุล
        </label>
        <input className="input" id="p-name" name="name" required />
        {state?.fieldErrors?.name && (
          <p className="field-error">{state.fieldErrors.name[0]}</p>
        )}
      </div>
      <div>
        <label className="label" htmlFor="p-email">
          อีเมล
        </label>
        <input className="input" id="p-email" name="email" type="email" required />
        {state?.fieldErrors?.email && (
          <p className="field-error">{state.fieldErrors.email[0]}</p>
        )}
      </div>
      <div>
        <label className="label" htmlFor="p-phone">
          เบอร์โทร (ไม่บังคับ)
        </label>
        <input className="input" id="p-phone" name="phone" placeholder="08xxxxxxxx" />
        {state?.fieldErrors?.phone && (
          <p className="field-error">{state.fieldErrors.phone[0]}</p>
        )}
      </div>
      <div>
        <label className="label" htmlFor="p-line">
          LINE ID (ไม่บังคับ ใช้ติดต่อหลังตกลงเรียนแล้ว)
        </label>
        <input className="input" id="p-line" name="lineId" />
      </div>
      <div>
        <label className="label" htmlFor="p-password">
          รหัสผ่าน
        </label>
        <input
          className="input"
          id="p-password"
          name="password"
          type="password"
          required
        />
        {state?.fieldErrors?.password && (
          <p className="field-error">{state.fieldErrors.password[0]}</p>
        )}
      </div>
      {state?.error && <p className="field-error">{state.error}</p>}
      <button className="btn-primary w-full" type="submit" disabled={pending}>
        {pending ? "กำลังสมัคร..." : "สมัครสมาชิกผู้ปกครอง/ผู้เรียน"}
      </button>
    </form>
  );
}
