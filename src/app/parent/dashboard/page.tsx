import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GRADE_LEVEL_LABELS } from "@/lib/constants";
import { RequestStatusBadge } from "@/components/status-badge";

export default async function ParentDashboardPage() {
  const user = await requireRole("PARENT");

  const requests = await prisma.learningRequest.findMany({
    where: { parentId: user.id },
    include: { tutor: true, subject: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">คำขอเรียนของฉัน</h1>
        <Link href="/search" className="btn-primary">
          ค้นหาติวเตอร์
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="card text-sm text-muted-foreground">
          ยังไม่มีคำขอเรียน — เริ่มค้นหาติวเตอร์ได้เลย
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Link
              key={r.id}
              href={`/parent/requests/${r.id}`}
              className="card flex items-center justify-between hover:bg-secondary"
            >
              <div>
                <p className="font-medium">{r.tutor.name}</p>
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
