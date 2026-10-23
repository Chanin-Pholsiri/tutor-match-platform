import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GRADE_LEVEL_LABELS } from "@/lib/constants";
import { RequestStatusBadge } from "@/components/status-badge";
import { RequestTimeline } from "@/components/request-timeline";
import { CounterForm } from "@/components/counter-form";
import { ReviewForm } from "@/components/review-form";
import { acceptAsParent, cancelAsParent, counterAsParent, declineAsParent } from "./actions";

export default async function ParentRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("PARENT");
  const { id } = await params;

  const request = await prisma.learningRequest.findUnique({
    where: { id },
    include: {
      parent: true,
      tutor: true,
      subject: true,
      events: { orderBy: { createdAt: "asc" } },
      review: true,
    },
  });
  if (!request || request.parentId !== user.id) notFound();

  const isOpen = request.status === "PENDING" || request.status === "COUNTERED";
  const isMyTurn = isOpen && request.lastActionById !== user.id;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="card">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{request.tutor.name}</h1>
          <RequestStatusBadge status={request.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {request.subject.name} · {GRADE_LEVEL_LABELS[request.level]}
        </p>
        <p className="mt-3 text-lg font-semibold text-primary">
          ราคาล่าสุด {request.proposedPrice.toString()} บาท/ชม.
        </p>

        {request.status === "ACCEPTED" && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
            <p className="font-medium">ตกลงราคากันแล้ว! ติดต่อติวเตอร์ต่อได้ทาง LINE</p>
            <p className="mt-1">
              LINE ID: <span className="font-mono">{request.tutor.lineId || "ไม่ได้ระบุ"}</span>
            </p>
          </div>
        )}

        {isOpen && !isMyTurn && (
          <p className="mt-4 text-sm text-muted-foreground">รอติวเตอร์ตอบกลับ...</p>
        )}
      </div>

      {isOpen && isMyTurn && (
        <div className="flex gap-3">
          <form action={acceptAsParent.bind(null, request.id)}>
            <button className="btn-primary" type="submit">
              ตกลงราคานี้
            </button>
          </form>
          <form action={declineAsParent.bind(null, request.id)}>
            <button className="btn-danger" type="submit">
              ปฏิเสธ
            </button>
          </form>
        </div>
      )}

      {isOpen && isMyTurn && <CounterForm requestId={request.id} action={counterAsParent} />}

      {isOpen && (
        <form action={cancelAsParent.bind(null, request.id)}>
          <button className="btn-secondary" type="submit">
            ยกเลิกคำขอนี้
          </button>
        </form>
      )}

      {request.status === "ACCEPTED" && (
        <ReviewForm
          requestId={request.id}
          initialRating={request.review?.rating}
          initialComment={request.review?.comment ?? undefined}
        />
      )}

      <div className="card">
        <h2 className="mb-3 font-semibold">ประวัติการเจรจา</h2>
        <RequestTimeline
          events={request.events.map((e) => ({
            ...e,
            price: e.price?.toString() ?? null,
          }))}
          parentId={request.parentId}
          parentName={request.parent.name}
          tutorName={request.tutor.name}
        />
      </div>
    </div>
  );
}
