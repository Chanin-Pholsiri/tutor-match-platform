import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { GRADE_LEVEL_LABELS, JOB_POST_STATUS_LABELS } from "@/lib/constants";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { RatingSummary } from "@/components/rating-summary";
import { ProposalForm } from "./proposal-form";
import { closeJobPostAsParent, selectProposalAsParent } from "./actions";

const STATUS_COLOR: Record<string, string> = {
  OPEN: "bg-emerald-100 text-emerald-800",
  FILLED: "bg-sky-100 text-sky-800",
  CLOSED: "bg-gray-100 text-gray-600",
};

export default async function JobPostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [jobPost, session] = await Promise.all([
    prisma.jobPost.findUnique({
      where: { id },
      include: {
        subject: true,
        parent: true,
        proposals: { include: { tutor: true }, orderBy: { createdAt: "asc" } },
      },
    }),
    getSession(),
  ]);

  if (!jobPost) notFound();

  const isOwner = session?.user.role === "PARENT" && session.user.id === jobPost.parentId;

  let tutorApproved = false;
  let myProposal: { message: string; proposedPrice: string } | undefined;
  if (session?.user.role === "TUTOR") {
    const profile = await prisma.tutorProfile.findUnique({
      where: { userId: session.user.id },
    });
    tutorApproved = profile?.approvalStatus === "APPROVED";
    const mine = jobPost.proposals.find((p) => p.tutorId === session.user.id);
    if (mine) myProposal = { message: mine.message, proposedPrice: mine.proposedPrice.toString() };
  }

  const ratingByTutorId = new Map<string, { average: number; count: number }>();
  if (isOwner && jobPost.proposals.length > 0) {
    const ratingRows = await prisma.review.groupBy({
      by: ["tutorId"],
      where: { tutorId: { in: jobPost.proposals.map((p) => p.tutorId) } },
      _avg: { rating: true },
      _count: true,
    });
    for (const r of ratingRows) {
      ratingByTutorId.set(r.tutorId, { average: r._avg.rating ?? 0, count: r._count });
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <Link href="/jobs" className="text-sm text-primary hover:underline">
          ← กลับไปหน้าประกาศทั้งหมด
        </Link>

        <div className="card mt-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">
              {jobPost.subject.name} · {GRADE_LEVEL_LABELS[jobPost.level]}
            </h1>
            <span className={`badge ${STATUS_COLOR[jobPost.status]}`}>
              {JOB_POST_STATUS_LABELS[jobPost.status]}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {jobPost.province}
            {jobPost.district ? ` · ${jobPost.district}` : ""}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            ต้องการเรียนช่วง {new Date(jobPost.startDate).toLocaleDateString("th-TH")} -{" "}
            {new Date(jobPost.endDate).toLocaleDateString("th-TH")}
          </p>
          {jobPost.schedule && (
            <p className="mt-1 text-sm text-muted-foreground">วันที่สะดวก: {jobPost.schedule}</p>
          )}
          {(jobPost.budgetMin || jobPost.budgetMax) && (
            <p className="mt-2 font-medium text-primary">
              งบประมาณ {jobPost.budgetMin?.toString() ?? "?"}-
              {jobPost.budgetMax?.toString() ?? "?"} บาท/ชั่วโมง
            </p>
          )}
          {jobPost.description && (
            <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">
              {jobPost.description}
            </p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            โพสต์โดย {jobPost.parent.name}
          </p>

          {isOwner && jobPost.status === "OPEN" && (
            <form action={closeJobPostAsParent.bind(null, jobPost.id)} className="mt-4">
              <button className="btn-secondary" type="submit">
                ปิดประกาศ
              </button>
            </form>
          )}
        </div>

        {isOwner ? (
          <div className="card mt-4">
            <h2 className="mb-3 font-semibold">
              ข้อเสนอจากติวเตอร์ ({jobPost.proposals.length})
            </h2>
            {jobPost.proposals.length === 0 ? (
              <p className="text-sm text-muted-foreground">ยังไม่มีติวเตอร์นำเสนอตัว</p>
            ) : (
              <ul className="space-y-4">
                {jobPost.proposals.map((p) => (
                  <li key={p.id} className="border-b border-border pb-4 last:border-0">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/tutors/${p.tutorId}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {p.tutor.name}
                      </Link>
                      <span className="text-sm font-medium">
                        {p.proposedPrice.toString()} บาท/ชม.
                      </span>
                    </div>
                    <div className="mt-0.5">
                      <RatingSummary
                        average={ratingByTutorId.get(p.tutorId)?.average ?? 0}
                        count={ratingByTutorId.get(p.tutorId)?.count ?? 0}
                      />
                    </div>
                    <p className="mt-1 text-sm whitespace-pre-line text-muted-foreground">
                      {p.message}
                    </p>
                    {jobPost.status === "OPEN" && (
                      <form
                        action={selectProposalAsParent.bind(null, jobPost.id, p.id)}
                        className="mt-2"
                      >
                        <button className="btn-cta" type="submit">
                          เลือกติวเตอร์คนนี้
                        </button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="card mt-4">
            <h2 className="mb-3 font-semibold">นำเสนอตัวเอง</h2>
            {!session ? (
              <p className="text-sm text-muted-foreground">
                <Link href="/login" className="text-primary hover:underline">
                  เข้าสู่ระบบ
                </Link>{" "}
                ในฐานะติวเตอร์เพื่อนำเสนอตัวเอง
              </p>
            ) : session.user.role !== "TUTOR" ? (
              <p className="text-sm text-muted-foreground">
                เฉพาะบัญชีติวเตอร์เท่านั้นที่นำเสนอตัวได้
              </p>
            ) : !tutorApproved ? (
              <p className="text-sm text-muted-foreground">
                โปรไฟล์ของคุณยังไม่ผ่านการอนุมัติ กรุณารอแอดมินตรวจสอบก่อน
              </p>
            ) : jobPost.status !== "OPEN" ? (
              <p className="text-sm text-muted-foreground">ประกาศนี้ปิดรับข้อเสนอแล้ว</p>
            ) : (
              <ProposalForm
                jobPostId={jobPost.id}
                initialMessage={myProposal?.message}
                initialPrice={myProposal?.proposedPrice}
              />
            )}
          </div>
        )}
      </div>
      <PublicFooter />
    </div>
  );
}
