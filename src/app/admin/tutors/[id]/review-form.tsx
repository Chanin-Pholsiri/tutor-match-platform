"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { THAI_PROVINCES } from "@/lib/constants";
import {
  SubjectLevelPicker,
  type SubjectLevelRow,
} from "@/components/subject-level-picker";
import { adminUpdateTutorProfile } from "./actions";
import type { FormState } from "@/app/register/actions";

const initialState: FormState = null;

type Props = {
  tutorProfileId: string;
  profile: {
    bio: string | null;
    teachingHistory: string | null;
    province: string;
    district: string | null;
    hourlyRateMin: string;
    hourlyRateMax: string;
  };
  lineId: string | null;
  subjectOptions: { id: string; name: string }[];
  initialRows: SubjectLevelRow[];
};

export function AdminTutorReviewForm({
  tutorProfileId,
  profile,
  lineId,
  subjectOptions,
  initialRows,
}: Props) {
  const [state, formAction, pending] = useActionState(
    adminUpdateTutorProfile,
    initialState,
  );

  useEffect(() => {
    if (state?.success) toast.success("บันทึกการแก้ไขเรียบร้อย");
  }, [state?.success]);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="tutorProfileId" value={tutorProfileId} />

      <div>
        <label className="label" htmlFor="a-lineId">
          LINE ID
        </label>
        <input className="input" id="a-lineId" name="lineId" defaultValue={lineId ?? ""} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="a-province">
            จังหวัด
          </label>
          <Select name="province" defaultValue={profile.province} required>
            <SelectTrigger id="a-province" className="w-full">
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
          <label className="label" htmlFor="a-district">
            เขต/อำเภอ
          </label>
          <input
            className="input"
            id="a-district"
            name="district"
            defaultValue={profile.district ?? ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="a-rate-min">
            ค่าสอนต่อชั่วโมง (ต่ำสุด)
          </label>
          <input
            className="input"
            id="a-rate-min"
            name="hourlyRateMin"
            type="number"
            min={0}
            defaultValue={profile.hourlyRateMin}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="a-rate-max">
            ค่าสอนต่อชั่วโมง (สูงสุด)
          </label>
          <input
            className="input"
            id="a-rate-max"
            name="hourlyRateMax"
            type="number"
            min={0}
            defaultValue={profile.hourlyRateMax}
            required
          />
          {state?.fieldErrors?.hourlyRateMax && (
            <p className="field-error">{state.fieldErrors.hourlyRateMax[0]}</p>
          )}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="a-bio">
          แนะนำตัว
        </label>
        <textarea
          className="input"
          id="a-bio"
          name="bio"
          rows={3}
          defaultValue={profile.bio ?? ""}
        />
      </div>
      <div>
        <label className="label" htmlFor="a-history">
          ประวัติการสอน/ประสบการณ์
        </label>
        <textarea
          className="input"
          id="a-history"
          name="teachingHistory"
          rows={3}
          defaultValue={profile.teachingHistory ?? ""}
        />
      </div>

      <div>
        <label className="label">วิชาที่รับสอน</label>
        <SubjectLevelPicker subjectOptions={subjectOptions} initialRows={initialRows} />
        {state?.fieldErrors?.subjects && (
          <p className="field-error">{state.fieldErrors.subjects[0]}</p>
        )}
      </div>

      {state?.error && <p className="field-error">{state.error}</p>}
      <button className="btn-secondary" type="submit" disabled={pending}>
        {pending ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
      </button>
    </form>
  );
}
