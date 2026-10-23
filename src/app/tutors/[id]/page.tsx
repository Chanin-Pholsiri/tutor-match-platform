import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { GRADE_LEVEL_LABELS } from "@/lib/constants";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";
import { RatingSummary } from "@/components/rating-summary";
import { ReviewList } from "@/components/review-list";
import { RequestForm } from "./request-form";

export default async function TutorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [profile, session, reviews, ratingAgg] = await Promise.all([
    prisma.tutorProfile.findUnique({
      where: { userId: id },
      include: { user: true, subjects: { include: { subject: true } } },
    }),
    getSession(),
    prisma.review.findMany({
      where: { tutorId: id },
      include: { parent: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.review.aggregate({
      where: { tutorId: id },
      _avg: { rating: true },
      _count: true,
    }),
  ]);

  if (!profile || profile.approvalStatus !== "APPROVED" || !profile.user.active) {
    notFound();
  }

  const subjectOptions = profile.subjects.map((s) => ({
    subjectId: s.subjectId,
    subjectName: s.subject.name,
    level: s.level,
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <Link href="/search" className="text-sm text-primary hover:underline">
          ← กลับไปหน้าค้นหา
        </Link>

        <div className="card mt-4 flex flex-wrap items-start gap-6">
          {profile.photoUrl ? (
            <Image
              src={profile.photoUrl}
              alt={profile.user.name}
              width={120}
              height={120}
              className="h-30 w-30 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-30 w-30 items-center justify-center rounded-full bg-secondary text-sm text-muted-foreground">
              ไม่มีรูป
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{profile.user.name}</h1>
            <div className="mt-1">
              <RatingSummary
                average={ratingAgg._avg.rating ?? 0}
                count={ratingAgg._count}
                size="md"
              />
            </div>
            <p className="mt-1 text-muted-foreground">
              {profile.province}
              {profile.district ? ` · ${profile.district}` : ""}
            </p>
            <p className="mt-1 font-medium text-primary">
              {profile.hourlyRateMin.toString()}-{profile.hourlyRateMax.toString()}{" "}
              บาท/ชั่วโมง
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {profile.subjects.map((s) => (
                <span key={s.id} className="badge bg-secondary text-foreground">
                  {s.subject.name} · {GRADE_LEVEL_LABELS[s.level]}
                </span>
              ))}
            </div>
          </div>
        </div>

        {profile.bio && (
          <div className="card mt-4">
            <h2 className="font-semibold">แนะนำตัว</h2>
            <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
              {profile.bio}
            </p>
          </div>
        )}

        {profile.teachingHistory && (
          <div className="card mt-4">
            <h2 className="font-semibold">ประวัติการสอน / ผลงาน</h2>
            <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
              {profile.teachingHistory}
            </p>
          </div>
        )}

        <div className="card mt-4">
          <h2 className="mb-3 font-semibold">
            รีวิวจากผู้เรียน{ratingAgg._count > 0 ? ` (${ratingAgg._count})` : ""}
          </h2>
          <ReviewList
            reviews={reviews.map((r) => ({
              id: r.id,
              rating: r.rating,
              comment: r.comment,
              createdAt: r.createdAt,
              parent: { name: r.parent.name },
            }))}
          />
        </div>

        <div className="card mt-4">
          <h2 className="mb-3 font-semibold">ส่งคำขอเรียน</h2>
          {!session ? (
            <p className="text-sm text-muted-foreground">
              <Link
                href={`/login?next=/tutors/${id}`}
                className="text-primary hover:underline"
              >
                เข้าสู่ระบบ
              </Link>{" "}
              หรือ{" "}
              <Link href="/register" className="text-primary hover:underline">
                สมัครสมาชิก
              </Link>{" "}
              ในฐานะผู้ปกครอง/ผู้เรียน เพื่อส่งคำขอเรียน
            </p>
          ) : session.user.role !== "PARENT" ? (
            <p className="text-sm text-muted-foreground">
              เฉพาะบัญชีผู้ปกครอง/ผู้เรียนเท่านั้นที่ส่งคำขอเรียนได้
            </p>
          ) : subjectOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">ติวเตอร์ยังไม่ได้ระบุวิชาที่สอน</p>
          ) : (
            <RequestForm tutorId={profile.userId} subjectOptions={subjectOptions} />
          )}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
