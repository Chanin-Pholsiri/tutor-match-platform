import { requireRole } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard-nav";

export default async function TutorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireRole("TUTOR", "/tutor/dashboard");

  return (
    <div className="min-h-screen bg-secondary/40">
      <DashboardNav
        userName={user.name}
        role="TUTOR"
        links={[
          { href: "/tutor/dashboard", label: "คำขอเรียน" },
          { href: "/tutor/profile", label: "โปรไฟล์ของฉัน" },
          { href: "/jobs", label: "ประกาศหางาน" },
          { href: "/tutor/proposals", label: "ข้อเสนอของฉัน" },
        ]}
      />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
