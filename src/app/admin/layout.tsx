import { requireRole } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard-nav";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireRole("ADMIN", "/admin");

  return (
    <div className="min-h-screen bg-secondary/40">
      <DashboardNav
        userName={user.name}
        role="ADMIN"
        links={[
          { href: "/admin", label: "ภาพรวม" },
          { href: "/admin/tutors", label: "อนุมัติติวเตอร์" },
          { href: "/admin/users", label: "ผู้ใช้งาน" },
          { href: "/admin/requests", label: "คำขอเรียน" },
          { href: "/admin/jobs", label: "ประกาศหาติวเตอร์" },
          { href: "/admin/exports", label: "Export ข้อมูล" },
        ]}
      />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
