import { requireRole } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard-nav";

export default async function ParentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireRole("PARENT", "/parent/dashboard");

  return (
    <div className="min-h-screen bg-secondary/40">
      <DashboardNav
        userName={user.name}
        role="PARENT"
        links={[
          { href: "/parent/dashboard", label: "คำขอของฉัน" },
          { href: "/search", label: "ค้นหาติวเตอร์" },
          { href: "/parent/jobs", label: "ประกาศของฉัน" },
          { href: "/jobs", label: "ดูประกาศทั้งหมด" },
        ]}
      />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
