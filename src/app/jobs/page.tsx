import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  GRADE_LEVEL_LABELS,
  GRADE_LEVELS,
  THAI_PROVINCES,
} from "@/lib/constants";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import type { GradeLevel } from "@/generated/prisma/client";

export default async function JobsBoardPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; level?: string; province?: string }>;
}) {
  const { subject, level, province } = await searchParams;

  const [subjects, jobPosts] = await Promise.all([
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    prisma.jobPost.findMany({
      where: {
        status: "OPEN",
        ...(province ? { province } : {}),
        ...(subject ? { subjectId: subject } : {}),
        ...(level ? { level: level as GradeLevel } : {}),
      },
      include: { subject: true, parent: true, _count: { select: { proposals: true } } },
      orderBy: { createdAt: "desc" },
      take: 60,
    }),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">ประกาศหาติวเตอร์</h1>
          <Link href="/parent/jobs/new" className="btn-cta">
            + โพสต์หาติวเตอร์
          </Link>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          ติวเตอร์ที่ผ่านการอนุมัติแล้วสามารถกดนำเสนอตัวเองในแต่ละประกาศได้
        </p>

        <form className="card mt-4 grid gap-3 md:grid-cols-4" action="/jobs">
          <select className="input" name="subject" defaultValue={subject ?? ""}>
            <option value="">ทุกวิชา</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select className="input" name="level" defaultValue={level ?? ""}>
            <option value="">ทุกระดับชั้น</option>
            {GRADE_LEVELS.map((l) => (
              <option key={l} value={l}>
                {GRADE_LEVEL_LABELS[l]}
              </option>
            ))}
          </select>
          <select className="input" name="province" defaultValue={province ?? ""}>
            <option value="">ทุกจังหวัด</option>
            {THAI_PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <button className="btn-primary" type="submit">
            ค้นหา
          </button>
        </form>

        <p className="mt-4 text-sm text-muted-foreground">
          พบประกาศ {jobPosts.length} รายการ
        </p>

        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobPosts.map((j) => (
            <Link
              key={j.id}
              href={`/jobs/${j.id}`}
              className="card flex flex-col hover:bg-secondary"
            >
              <p className="font-semibold">
                {j.subject.name} · {GRADE_LEVEL_LABELS[j.level]}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {j.province}
                {j.district ? ` · ${j.district}` : ""}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {new Date(j.startDate).toLocaleDateString("th-TH")} -{" "}
                {new Date(j.endDate).toLocaleDateString("th-TH")}
              </p>
              {(j.budgetMin || j.budgetMax) && (
                <p className="mt-1 text-sm font-medium text-primary">
                  งบ {j.budgetMin?.toString() ?? "?"}-{j.budgetMax?.toString() ?? "?"} บาท/ชม.
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                {j._count.proposals} ข้อเสนอแล้ว
              </p>
            </Link>
          ))}
          {jobPosts.length === 0 && (
            <p className="col-span-full py-10 text-center text-muted-foreground">
              ยังไม่มีประกาศที่ตรงกับเงื่อนไข
            </p>
          )}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
