import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GRADE_LEVEL_LABELS, JOB_POST_STATUS_LABELS } from "@/lib/constants";

const STATUS_COLOR: Record<string, string> = {
  OPEN: "bg-emerald-100 text-emerald-800",
  FILLED: "bg-sky-100 text-sky-800",
  CLOSED: "bg-gray-100 text-gray-600",
};

export default async function ParentJobsPage() {
  const user = await requireRole("PARENT");

  const jobPosts = await prisma.jobPost.findMany({
    where: { parentId: user.id },
    include: { subject: true, _count: { select: { proposals: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">ประกาศหาติวเตอร์ของฉัน</h1>
        <Link href="/parent/jobs/new" className="btn-primary">
          + สร้างประกาศใหม่
        </Link>
      </div>

      {jobPosts.length === 0 ? (
        <div className="card text-sm text-muted-foreground">
          ยังไม่มีประกาศ — สร้างประกาศเพื่อให้ติวเตอร์เข้ามานำเสนอตัวเองได้เลย
        </div>
      ) : (
        <div className="space-y-3">
          {jobPosts.map((j) => (
            <Link
              key={j.id}
              href={`/jobs/${j.id}`}
              className="card flex items-center justify-between hover:bg-secondary"
            >
              <div>
                <p className="font-medium">
                  {j.subject.name} · {GRADE_LEVEL_LABELS[j.level]}
                </p>
                <p className="text-sm text-muted-foreground">
                  {j.province} · {j._count.proposals} ข้อเสนอ
                </p>
              </div>
              <span className={`badge ${STATUS_COLOR[j.status]}`}>
                {JOB_POST_STATUS_LABELS[j.status]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
