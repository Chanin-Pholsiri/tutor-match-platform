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
import { PhotoUpload } from "@/components/photo-upload";
import { DocumentUpload } from "@/components/document-upload";
import {
  SubjectLevelPicker,
  type SubjectLevelRow,
} from "@/components/subject-level-picker";
import { updateTutorProfile } from "./actions";
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
    photoUrl: string | null;
    hasIdCard: boolean;
    hasCredential: boolean;
  };
  lineId: string | null;
  subjectOptions: { id: string; name: string }[];
  initialRows: SubjectLevelRow[];
};

export function TutorProfileForm({
  tutorProfileId,
  profile,
  lineId,
  subjectOptions,
  initialRows,
}: Props) {
  const [state, formAction, pending] = useActionState(updateTutorProfile, initialState);

  useEffect(() => {
    if (state?.success) toast.success("บันทึกโปรไฟล์เรียบร้อย");
  }, [state?.success]);

  return (
    <form action={formAction} className="space-y-5">
      <PhotoUpload initialUrl={profile.photoUrl} />

      <div>
        <label className="label" htmlFor="lineId">
          LINE ID
        </label>
        <input className="input" id="lineId" name="lineId" defaultValue={lineId ?? ""} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="province">
            จังหวัด
          </label>
          <Select name="province" defaultValue={profile.province} required>
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
            เขต/อำเภอ
          </label>
          <input
            className="input"
            id="district"
            name="district"
            defaultValue={profile.district ?? ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="hourlyRateMin">
            ค่าสอนต่อชั่วโมง (ต่ำสุด)
          </label>
          <input
            className="input"
            id="hourlyRateMin"
            name="hourlyRateMin"
            type="number"
            min={0}
            defaultValue={profile.hourlyRateMin}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="hourlyRateMax">
            ค่าสอนต่อชั่วโมง (สูงสุด)
          </label>
          <input
            className="input"
            id="hourlyRateMax"
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
        <label className="label" htmlFor="bio">
          แนะนำตัว
        </label>
        <textarea
          className="input"
          id="bio"
          name="bio"
          rows={3}
          defaultValue={profile.bio ?? ""}
        />
      </div>
      <div>
        <label className="label" htmlFor="teachingHistory">
          ประวัติการสอน/ประสบการณ์
        </label>
        <textarea
          className="input"
          id="teachingHistory"
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

      <div className="space-y-4 rounded-xl border border-border p-4">
        <div>
          <p className="font-medium">เอกสารยืนยันตัวตน</p>
          <p className="text-xs text-muted-foreground">
            ใช้สำหรับแอดมินตรวจสอบก่อนอนุมัติเท่านั้น ไม่แสดงต่อสาธารณะ —
            ต้องแนบบัตรประชาชนก่อนโปรไฟล์จะได้รับการอนุมัติ
          </p>
        </div>
        <DocumentUpload
          label="สำเนาบัตรประชาชน (จำเป็น)"
          kind="idCard"
          tutorProfileId={tutorProfileId}
          hasExisting={profile.hasIdCard}
        />
        <DocumentUpload
          label="วุฒิการศึกษา/ใบรับรองการสอน (ไม่บังคับ)"
          kind="credential"
          tutorProfileId={tutorProfileId}
          hasExisting={profile.hasCredential}
        />
      </div>

      {state?.error && <p className="field-error">{state.error}</p>}
      <button className="btn-primary" type="submit" disabled={pending}>
        {pending ? "กำลังบันทึก..." : "บันทึกโปรไฟล์"}
      </button>
    </form>
  );
}
