import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GRADE_LEVEL_LABELS } from "@/lib/constants";
import { RequestStatusBadge } from "@/components/status-badge";

export default async function TutorDashboardPage() {
  const user = await requireRole("TUTOR");

  const requests = await prisma.learningRequest.findMany({
    where: { tutorId: user.id },
    include: { parent: true, subject: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">คำขอเรียนที่ได้รับ</h1>

      {requests.length === 0 ? (
        <div className="card text-sm text-muted-foreground">ยังไม่มีคำขอเรียนเข้ามา</div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Link
              key={r.id}
              href={`/tutor/requests/${r.id}`}
              className="card flex items-center justify-between hover:bg-secondary"
            >
              <div>
                <p className="font-medium">{r.parent.name}</p>
                <p className="text-sm text-muted-foreground">
                  {r.subject.name} · {GRADE_LEVEL_LABELS[r.level]} ·{" "}
                  {r.proposedPrice.toString()} บาท/ชม.
                </p>
              </div>
              <RequestStatusBadge status={r.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
