import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { GRADE_LEVEL_LABELS, GRADE_LEVELS, THAI_PROVINCES } from "@/lib/constants";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { RatingSummary } from "@/components/rating-summary";
import type { GradeLevel } from "@/generated/prisma/client";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; level?: string; province?: string }>;
}) {
  const { subject, level, province } = await searchParams;

  const [subjects, tutors] = await Promise.all([
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    prisma.tutorProfile.findMany({
      where: {
        approvalStatus: "APPROVED",
        user: { active: true },
        ...(province ? { province } : {}),
        ...(subject && level
          ? { subjects: { some: { subjectId: subject, level: level as GradeLevel } } }
          : subject
            ? { subjects: { some: { subjectId: subject } } }
            : {}),
      },
      include: { user: true, subjects: { include: { subject: true } } },
      orderBy: { publishedAt: "desc" },
      take: 60,
    }),
  ]);

  const ratingRows = await prisma.review.groupBy({
    by: ["tutorId"],
    where: { tutorId: { in: tutors.map((t) => t.userId) } },
    _avg: { rating: true },
    _count: true,
  });
  const ratingByTutorId = new Map(
    ratingRows.map((r) => [r.tutorId, { average: r._avg.rating ?? 0, count: r._count }]),
  );

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold">ค้นหาติวเตอร์</h1>

      <form className="card mt-4 grid gap-3 md:grid-cols-4" action="/search">
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

      <p className="mt-4 text-sm text-muted-foreground">พบติวเตอร์ {tutors.length} คน</p>

      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tutors.map((t) => (
          <Link
            key={t.id}
            href={`/tutors/${t.userId}`}
            className="card flex gap-4 hover:bg-secondary"
          >
            {t.photoUrl ? (
              <Image
                src={t.photoUrl}
                alt={t.user.name}
                width={56}
                height={56}
                className="h-14 w-14 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary text-xs text-muted-foreground">
                ไม่มีรูป
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-semibold">{t.user.name}</p>
              <div className="mt-0.5">
                <RatingSummary
                  average={ratingByTutorId.get(t.userId)?.average ?? 0}
                  count={ratingByTutorId.get(t.userId)?.count ?? 0}
                />
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {t.province}
                {t.district ? ` · ${t.district}` : ""}
              </p>
              <p className="mt-1 truncate text-sm text-primary">
                {t.hourlyRateMin.toString()}-{t.hourlyRateMax.toString()} บาท/ชม.
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {t.subjects.map((s) => s.subject.name).join(", ")}
              </p>
            </div>
          </Link>
        ))}
        {tutors.length === 0 && (
          <p className="col-span-full py-10 text-center text-muted-foreground">
            ไม่พบติวเตอร์ที่ตรงกับเงื่อนไข ลองปรับตัวกรองดูใหม่
          </p>
        )}
      </div>
      </div>
      <PublicFooter />
    </div>
  );
}
