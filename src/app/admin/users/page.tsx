import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Role } from "@/generated/prisma/client";
import { setUserActive } from "./actions";

const ROLE_LABEL: Record<Role, string> = {
  PARENT: "ผู้ปกครอง/ผู้เรียน",
  TUTOR: "ติวเตอร์",
  ADMIN: "แอดมิน",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string }>;
}) {
  const { role, q } = await searchParams;

  const users = await prisma.user.findMany({
    where: {
      ...(role && role !== "ALL" ? { role: role as Role } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { tutorProfile: { select: { id: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">ผู้ใช้งานทั้งหมด</h1>

      <form className="flex flex-wrap gap-2" action="/admin/users">
        <input
          className="input max-w-xs"
          type="text"
          name="q"
          placeholder="ค้นหาชื่อ/อีเมล/เบอร์โทร"
          defaultValue={q}
        />
        <select className="input max-w-40" name="role" defaultValue={role ?? "ALL"}>
          <option value="ALL">ทุก role</option>
          <option value="PARENT">ผู้ปกครอง/ผู้เรียน</option>
          <option value="TUTOR">ติวเตอร์</option>
          <option value="ADMIN">แอดมิน</option>
        </select>
        <button className="btn-secondary" type="submit">
          ค้นหา
        </button>
      </form>

      <div className="card overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อ</TableHead>
              <TableHead>ติดต่อ</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>สมัครเมื่อ</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>
                  {u.email}
                  {u.phone ? ` · ${u.phone}` : ""}
                </TableCell>
                <TableCell>{ROLE_LABEL[u.role]}</TableCell>
                <TableCell>{u.createdAt.toLocaleDateString("th-TH")}</TableCell>
                <TableCell>
                  <span className={`badge ${u.active ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}`}>
                    {u.active ? "ใช้งานอยู่" : "ปิดใช้งาน"}
                  </span>
                </TableCell>
                <TableCell>
                  {u.role === "TUTOR" && u.tutorProfile ? (
                    <Link
                      href={`/admin/tutors/${u.tutorProfile.id}`}
                      className="mr-3 text-sm text-primary hover:underline"
                    >
                      ดูโปรไฟล์
                    </Link>
                  ) : null}
                  <form
                    action={setUserActive.bind(null, u.id, !u.active)}
                    className="inline"
                  >
                    <button
                      className={u.active ? "btn-danger" : "btn-secondary"}
                      type="submit"
                    >
                      {u.active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                    </button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  ไม่พบผู้ใช้งาน
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
