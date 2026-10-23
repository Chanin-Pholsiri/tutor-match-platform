import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GRADE_LEVEL_LABELS, JOB_POST_STATUS_LABELS } from "@/lib/constants";

const STATUS_COLOR: Record<string, string> = {
  OPEN: "bg-emerald-100 text-emerald-800",
  FILLED: "bg-sky-100 text-sky-800",
  CLOSED: "bg-gray-100 text-gray-600",
};

export default async function TutorProposalsPage() {
  const user = await requireRole("TUTOR");

  const proposals = await prisma.jobProposal.findMany({
    where: { tutorId: user.id },
    include: { jobPost: { include: { subject: true, parent: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">ข้อเสนอของฉัน</h1>
        <Link href="/jobs" className="btn-primary">
          ดูประกาศหางานทั้งหมด
        </Link>
      </div>

      {proposals.length === 0 ? (
        <div className="card text-sm text-muted-foreground">
          ยังไม่เคยนำเสนอตัวในประกาศไหนเลย
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map((p) => (
            <Link
              key={p.id}
              href={`/jobs/${p.jobPostId}`}
              className="card flex items-center justify-between hover:bg-secondary"
            >
              <div>
                <p className="font-medium">
                  {p.jobPost.subject.name} · {GRADE_LEVEL_LABELS[p.jobPost.level]}
                </p>
                <p className="text-sm text-muted-foreground">
                  {p.jobPost.province} · เสนอ {p.proposedPrice.toString()} บาท/ชม.
                </p>
              </div>
              <span className={`badge ${STATUS_COLOR[p.jobPost.status]}`}>
                {JOB_POST_STATUS_LABELS[p.jobPost.status]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
