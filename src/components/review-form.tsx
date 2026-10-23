"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { submitReviewAsParent } from "@/app/parent/requests/[id]/actions";
import type { FormState } from "@/app/register/actions";

const initialState: FormState = null;

export function ReviewForm({
  requestId,
  initialRating,
  initialComment,
}: {
  requestId: string;
  initialRating?: number;
  initialComment?: string;
}) {
  const [state, formAction, pending] = useActionState(
    submitReviewAsParent,
    initialState,
  );
  const [rating, setRating] = useState(initialRating ?? 0);
  const [hovered, setHovered] = useState(0);

  return (
    <form action={formAction} className="card space-y-3">
      <input type="hidden" name="requestId" value={requestId} />
      <input type="hidden" name="rating" value={rating} />
      <p className="font-medium">
        {initialRating ? "แก้ไขรีวิวของคุณ" : "ให้คะแนนและรีวิวติวเตอร์คนนี้"}
      </p>
      <div className="flex gap-1" onMouseLeave={() => setHovered(0)}>
        {Array.from({ length: 5 }).map((_, i) => {
          const value = i + 1;
          const filled = value <= (hovered || rating);
          return (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHovered(value)}
              aria-label={`${value} ดาว`}
            >
              <Star
                size={28}
                className={filled ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}
                strokeWidth={1.5}
              />
            </button>
          );
        })}
      </div>
      <div>
        <label className="label" htmlFor="comment">
          ความคิดเห็น (ไม่บังคับ)
        </label>
        <textarea
          className="input"
          id="comment"
          name="comment"
          rows={3}
          defaultValue={initialComment}
        />
      </div>
      {state?.error && <p className="field-error">{state.error}</p>}
      {rating === 0 && (
        <p className="text-xs text-muted-foreground">กรุณาเลือกจำนวนดาวก่อนส่งรีวิว</p>
      )}
      <button className="btn-primary" type="submit" disabled={pending || rating === 0}>
        {pending ? "กำลังส่ง..." : initialRating ? "บันทึกการแก้ไข" : "ส่งรีวิว"}
      </button>
    </form>
  );
}
