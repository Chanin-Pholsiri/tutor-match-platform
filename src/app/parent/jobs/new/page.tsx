import { prisma } from "@/lib/db";
import { JobPostForm } from "./job-post-form";

export default async function NewJobPostPage() {
  const subjects = await prisma.subject.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-bold">โพสต์ประกาศหาติวเตอร์</h1>
      <p className="text-sm text-muted-foreground">
        บอกความต้องการของคุณ แล้วให้ติวเตอร์ที่ผ่านการอนุมัติเข้ามานำเสนอตัวเอง
      </p>
      <div className="card">
        <JobPostForm subjects={subjects} />
      </div>
    </div>
  );
}
