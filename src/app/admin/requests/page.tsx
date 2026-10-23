import { prisma } from "@/lib/db";
import { RequestStatusBadge } from "@/components/status-badge";
import { GRADE_LEVEL_LABELS } from "@/lib/constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminRequestsPage() {
  const requests = await prisma.learningRequest.findMany({
    include: { parent: true, tutor: true, subject: true },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">คำขอเรียนทั้งหมด</h1>
      <div className="card overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ผู้ปกครอง</TableHead>
              <TableHead>ติวเตอร์</TableHead>
              <TableHead>วิชา/ระดับ</TableHead>
              <TableHead>ราคาล่าสุด</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>อัปเดตล่าสุด</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.parent.name}</TableCell>
                <TableCell>{r.tutor.name}</TableCell>
                <TableCell>
                  {r.subject.name} · {GRADE_LEVEL_LABELS[r.level]}
                </TableCell>
                <TableCell>{r.proposedPrice.toString()} บาท</TableCell>
                <TableCell>
                  <RequestStatusBadge status={r.status} />
                </TableCell>
                <TableCell>{r.updatedAt.toLocaleString("th-TH")}</TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  ยังไม่มีคำขอเรียน
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
