import Link from "next/link";
import { prisma } from "@/lib/db";
import { ApprovalBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TutorApprovalStatus } from "@/generated/prisma/client";

const STATUS_TABS: { value: TutorApprovalStatus | "ALL"; label: string }[] = [
  { value: "PENDING", label: "รอตรวจสอบ" },
  { value: "APPROVED", label: "อนุมัติแล้ว" },
  { value: "REJECTED", label: "ถูกปฏิเสธ" },
  { value: "ALL", label: "ทั้งหมด" },
];

export default async function AdminTutorsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const current = (status as TutorApprovalStatus | "ALL") || "PENDING";

  const tutors = await prisma.tutorProfile.findMany({
    where: current === "ALL" ? {} : { approvalStatus: current },
    include: { user: true, subjects: { include: { subject: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">คิวอนุมัติติวเตอร์</h1>

      <div className="flex gap-1">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/tutors?status=${tab.value}`}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              current === tab.value
                ? "bg-primary text-primary-foreground"
                : "bg-card hover:bg-secondary"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="card overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อ</TableHead>
              <TableHead>จังหวัด</TableHead>
              <TableHead>วิชาที่สอน</TableHead>
              <TableHead>ราคา/ชม.</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tutors.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.user.name}</TableCell>
                <TableCell>{t.province}</TableCell>
                <TableCell>
                  {t.subjects.map((s) => s.subject.name).join(", ") || "—"}
                </TableCell>
                <TableCell>
                  {t.hourlyRateMin.toString()}-{t.hourlyRateMax.toString()} บาท
                </TableCell>
                <TableCell>
                  <ApprovalBadge status={t.approvalStatus} />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/tutors/${t.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    ตรวจสอบ
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {tutors.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  ไม่มีรายการ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
