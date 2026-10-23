import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ApprovalBadge } from "@/components/status-badge";
import { TutorProfileForm } from "./profile-form";

export default async function TutorProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const user = await requireRole("TUTOR");
  const { welcome } = await searchParams;

  const [profile, subjectOptions] = await Promise.all([
    prisma.tutorProfile.findUniqueOrThrow({
      where: { userId: user.id },
      include: { subjects: true },
    }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      {welcome === "1" && (
        <div className="card border-amber-200 bg-amber-50 text-amber-900">
          สมัครสำเร็จ! กรุณาเพิ่มวิชาที่สอนด้านล่างให้ครบ
          จากนั้นแอดมินจะตรวจสอบโปรไฟล์ก่อนเผยแพร่
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">โปรไฟล์ของฉัน</h1>
        <ApprovalBadge status={profile.approvalStatus} />
      </div>

      {profile.approvalStatus === "REJECTED" && profile.rejectionReason && (
        <div className="card border-red-200 bg-red-50 text-red-800">
          <p className="font-medium">โปรไฟล์ถูกปฏิเสธ: {profile.rejectionReason}</p>
          <p className="mt-1 text-sm">แก้ไขและบันทึกใหม่เพื่อส่งเข้าคิวตรวจสอบอีกครั้ง</p>
        </div>
      )}

      <div className="card">
        <TutorProfileForm
          tutorProfileId={profile.id}
          profile={{
            bio: profile.bio,
            teachingHistory: profile.teachingHistory,
            province: profile.province,
            district: profile.district,
            hourlyRateMin: profile.hourlyRateMin.toString(),
            hourlyRateMax: profile.hourlyRateMax.toString(),
            photoUrl: profile.photoUrl,
            hasIdCard: !!profile.idCardData,
            hasCredential: !!profile.credentialData,
          }}
          lineId={user.lineId}
          subjectOptions={subjectOptions.map((s) => ({ id: s.id, name: s.name }))}
          initialRows={profile.subjects.map((s) => ({
            subjectId: s.subjectId,
            level: s.level,
          }))}
        />
      </div>
    </div>
  );
}
