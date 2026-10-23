import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ApprovalBadge } from "@/components/status-badge";
import { AdminTutorReviewForm } from "./review-form";
import { ApproveRejectActions } from "./approve-reject";

export default async function AdminTutorReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [profile, subjectOptions] = await Promise.all([
    prisma.tutorProfile.findUnique({
      where: { id },
      include: { user: true, subjects: true },
    }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!profile) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{profile.user.name}</h1>
          <p className="text-sm text-muted-foreground">
            {profile.user.email} · {profile.user.phone ?? "ไม่มีเบอร์โทร"}
          </p>
        </div>
        <ApprovalBadge status={profile.approvalStatus} />
      </div>

      <div className="card">
        <h2 className="mb-3 font-semibold">เอกสารยืนยันตัวตน</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DocumentLink
            label="สำเนาบัตรประชาชน"
            tutorProfileId={profile.id}
            kind="idCard"
            hasFile={!!profile.idCardData}
          />
          <DocumentLink
            label="วุฒิการศึกษา/ใบรับรอง"
            tutorProfileId={profile.id}
            kind="credential"
            hasFile={!!profile.credentialData}
          />
        </div>
      </div>

      {profile.approvalStatus === "PENDING" && (
        <div className="card">
          <p className="mb-3 text-sm text-muted-foreground">
            ตรวจสอบและแก้ไขข้อมูลด้านล่างหากจำเป็น ก่อนอนุมัติหรือปฏิเสธ
          </p>
          <ApproveRejectActions
            tutorProfileId={profile.id}
            hasIdCard={!!profile.idCardData}
          />
        </div>
      )}

      <div className="card">
        <AdminTutorReviewForm
          tutorProfileId={profile.id}
          profile={{
            bio: profile.bio,
            teachingHistory: profile.teachingHistory,
            province: profile.province,
            district: profile.district,
            hourlyRateMin: profile.hourlyRateMin.toString(),
            hourlyRateMax: profile.hourlyRateMax.toString(),
          }}
          lineId={profile.user.lineId}
          subjectOptions={subjectOptions.map((s) => ({ id: s.id, name: s.name }))}
          initialRows={profile.subjects.map((s) => ({
            subjectId: s.subjectId,
            level: s.level,
          }))}
        />
      </div>

      {profile.approvalStatus !== "PENDING" && (
        <div className="card">
          <ApproveRejectActions
            tutorProfileId={profile.id}
            hasIdCard={!!profile.idCardData}
          />
        </div>
      )}
    </div>
  );
}

function DocumentLink({
  label,
  tutorProfileId,
  kind,
  hasFile,
}: {
  label: string;
  tutorProfileId: string;
  kind: "idCard" | "credential";
  hasFile: boolean;
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="text-sm font-medium">{label}</p>
      {hasFile ? (
        <a
          href={`/api/admin/documents?tutorProfileId=${tutorProfileId}&kind=${kind}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline"
        >
          เปิดดูเอกสาร
        </a>
      ) : (
        <p className="text-sm text-muted-foreground">ยังไม่ได้แนบ</p>
      )}
    </div>
  );
}
