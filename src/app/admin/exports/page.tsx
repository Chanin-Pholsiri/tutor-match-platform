export default function AdminExportsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Export ข้อมูล</h1>
      <p className="text-sm text-muted-foreground">
        ดาวน์โหลดข้อมูลเป็นไฟล์ Excel (.xlsx) สำหรับใช้งานภายนอกระบบ
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <a href="/api/export/users" className="card block hover:bg-secondary">
          <p className="font-semibold">ผู้ใช้งานทั้งหมด</p>
          <p className="mt-1 text-sm text-muted-foreground">
            ผู้ปกครอง ติวเตอร์ และแอดมิน
          </p>
        </a>
        <a href="/api/export/tutors" className="card block hover:bg-secondary">
          <p className="font-semibold">โปรไฟล์ติวเตอร์</p>
          <p className="mt-1 text-sm text-muted-foreground">
            รวมวิชาที่สอน ราคา และสถานะอนุมัติ
          </p>
        </a>
        <a href="/api/export/requests" className="card block hover:bg-secondary">
          <p className="font-semibold">คำขอเรียนทั้งหมด</p>
          <p className="mt-1 text-sm text-muted-foreground">
            รวมราคาที่เจรจาและสถานะล่าสุด
          </p>
        </a>
      </div>
    </div>
  );
}
