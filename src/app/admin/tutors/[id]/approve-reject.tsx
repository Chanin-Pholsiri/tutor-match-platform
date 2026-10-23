"use client";

import { useActionState, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { approveTutor, rejectTutor } from "./actions";
import type { FormState } from "@/app/register/actions";

const initialState: FormState = null;

export function ApproveRejectActions({
  tutorProfileId,
  hasIdCard,
}: {
  tutorProfileId: string;
  hasIdCard: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(rejectTutor, initialState);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {hasIdCard ? (
        <form action={approveTutor.bind(null, tutorProfileId)}>
          <button className="btn-primary" type="submit">
            อนุมัติ
          </button>
        </form>
      ) : (
        <p className="text-sm text-amber-700">
          ยังไม่มีสำเนาบัตรประชาชนแนบมา — ต้องรอติวเตอร์อัปโหลดก่อนจึงจะอนุมัติได้
        </p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="btn-danger" type="button">
            ปฏิเสธ
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ปฏิเสธโปรไฟล์ติวเตอร์</DialogTitle>
          </DialogHeader>
          <form action={formAction} className="space-y-3">
            <input type="hidden" name="tutorProfileId" value={tutorProfileId} />
            <div>
              <label className="label" htmlFor="rejectionReason">
                เหตุผล (ติวเตอร์จะเห็นข้อความนี้)
              </label>
              <textarea
                className="input"
                id="rejectionReason"
                name="rejectionReason"
                rows={3}
                required
              />
              {state?.fieldErrors?.rejectionReason && (
                <p className="field-error">{state.fieldErrors.rejectionReason[0]}</p>
              )}
            </div>
            <DialogFooter>
              <button className="btn-danger" type="submit" disabled={pending}>
                {pending ? "กำลังบันทึก..." : "ยืนยันปฏิเสธ"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
