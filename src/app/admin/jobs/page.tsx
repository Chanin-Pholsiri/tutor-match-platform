import Link from "next/link";
import { prisma } from "@/lib/db";
import { GRADE_LEVEL_LABELS, JOB_POST_STATUS_LABELS } from "@/lib/constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_COLOR: Record<string, string> = {
  OPEN: "bg-emerald-100 text-emerald-800",
  FILLED: "bg-sky-100 text-sky-800",
  CLOSED: "bg-gray-100 text-gray-600",
};

export default async function AdminJobsPage() {
  const jobPosts = await prisma.jobPost.findMany({
    include: { subject: true, parent: true, _count: { select: { proposals: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">ประกาศหาติวเตอร์ทั้งหมด</h1>
      <div className="card overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ผู้โพสต์</TableHead>
              <TableHead>วิชา/ระดับ</TableHead>
              <TableHead>จังหวัด</TableHead>
              <TableHead>ข้อเสนอ</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobPosts.map((j) => (
              <TableRow key={j.id}>
                <TableCell>{j.parent.name}</TableCell>
                <TableCell>
                  {j.subject.name} · {GRADE_LEVEL_LABELS[j.level]}
                </TableCell>
                <TableCell>{j.province}</TableCell>
                <TableCell>{j._count.proposals}</TableCell>
                <TableCell>
                  <span className={`badge ${STATUS_COLOR[j.status]}`}>
                    {JOB_POST_STATUS_LABELS[j.status]}
                  </span>
                </TableCell>
                <TableCell>
                  <Link href={`/jobs/${j.id}`} className="text-primary hover:underline">
                    ดู
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {jobPosts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  ยังไม่มีประกาศ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
