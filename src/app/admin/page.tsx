import Link from "next/link";
import { prisma } from "@/lib/db";
import { RegistrationsChart } from "@/components/admin-registrations-chart";

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number | string;
  href?: string;
}) {
  const content = (
    <div className="card">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function AdminOverviewPage() {
  const daysBack = 14;
  const rangeStart = new Date();
  rangeStart.setHours(0, 0, 0, 0);
  rangeStart.setDate(rangeStart.getDate() - (daysBack - 1));

  const [
    usersByRole,
    tutorsByStatus,
    requestsByStatus,
    recentUsers,
    topSubjectsRaw,
  ] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], _count: true }),
    prisma.tutorProfile.groupBy({ by: ["approvalStatus"], _count: true }),
    prisma.learningRequest.groupBy({ by: ["status"], _count: true }),
    prisma.user.findMany({
      where: { role: { in: ["PARENT", "TUTOR"] }, createdAt: { gte: rangeStart } },
      select: { role: true, createdAt: true },
    }),
    prisma.learningRequest.groupBy({
      by: ["subjectId"],
      _count: true,
      orderBy: { _count: { subjectId: "desc" } },
      take: 5,
    }),
  ]);

  const dayBuckets = Array.from({ length: daysBack }).map((_, i) => {
    const d = new Date(rangeStart);
    d.setDate(d.getDate() + i);
    return {
      date: dateKey(d),
      label: d.toLocaleDateString("th-TH", { day: "numeric", month: "short" }),
      parents: 0,
      tutors: 0,
    };
  });
  for (const u of recentUsers) {
    const key = dateKey(u.createdAt);
    const bucket = dayBuckets.find((b) => b.date === key);
    if (!bucket) continue;
    if (u.role === "PARENT") bucket.parents++;
    else bucket.tutors++;
  }
  const newParents = recentUsers.filter((u) => u.role === "PARENT").length;
  const newTutors = recentUsers.filter((u) => u.role === "TUTOR").length;

  const countOf = (
    rows: Array<Record<string, unknown> & { _count: number }>,
    key: string,
    value: string,
  ) => (rows.find((r) => r[key] === value)?._count as number | undefined) ?? 0;

  const subjectIds = topSubjectsRaw.map((s) => s.subjectId);
  const subjects = await prisma.subject.findMany({ where: { id: { in: subjectIds } } });
  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? id;

  const pendingCount = countOf(tutorsByStatus, "approvalStatus", "PENDING");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">ภาพรวมระบบ</h1>

      {pendingCount > 0 && (
        <Link
          href="/admin/tutors?status=PENDING"
          className="card block border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100"
        >
          มีติวเตอร์รออนุมัติ {pendingCount} ราย — คลิกเพื่อตรวจสอบ
        </Link>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="ผู้ปกครอง/ผู้เรียน" value={countOf(usersByRole, "role", "PARENT")} />
        <StatCard label="ติวเตอร์ทั้งหมด" value={countOf(usersByRole, "role", "TUTOR")} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase">
          สมาชิกใหม่รายวัน (14 วันล่าสุด) — รวมผู้ปกครอง {newParents} คน, ติวเตอร์ {newTutors} คน
        </h2>
        <div className="card">
          <RegistrationsChart days={dayBuckets} />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase">
          สถานะติวเตอร์
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="รอตรวจสอบ"
            value={countOf(tutorsByStatus, "approvalStatus", "PENDING")}
            href="/admin/tutors?status=PENDING"
          />
          <StatCard
            label="อนุมัติแล้ว"
            value={countOf(tutorsByStatus, "approvalStatus", "APPROVED")}
            href="/admin/tutors?status=APPROVED"
          />
          <StatCard
            label="ถูกปฏิเสธ"
            value={countOf(tutorsByStatus, "approvalStatus", "REJECTED")}
            href="/admin/tutors?status=REJECTED"
          />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase">
          สถานะคำขอเรียน
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {(["PENDING", "COUNTERED", "ACCEPTED", "DECLINED", "CANCELLED"] as const).map(
            (s) => (
              <StatCard key={s} label={s} value={countOf(requestsByStatus, "status", s)} />
            ),
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase">
          วิชายอดนิยม (จากคำขอเรียน)
        </h2>
        <div className="card">
          {topSubjectsRaw.length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูล</p>
          ) : (
            <ol className="list-inside list-decimal space-y-1 text-sm">
              {topSubjectsRaw.map((s) => (
                <li key={s.subjectId}>
                  {subjectName(s.subjectId)} — {s._count} คำขอ
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
