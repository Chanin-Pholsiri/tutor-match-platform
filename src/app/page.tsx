import Link from "next/link";
import { getSession } from "@/lib/auth";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />

      <main className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:py-20">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          หาติวเตอร์ที่ใช่ ในไม่กี่นาที
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          ค้นหาติวเตอร์ตามวิชา ระดับชั้น และพื้นที่ ส่งคำขอเรียนและเจรจาราคาได้ในที่เดียว
          จับคู่แล้วนัดต่อกันสะดวก ๆ ผ่าน LINE
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/search" className="btn-cta">
            ค้นหาติวเตอร์
          </Link>
          <Link href="/jobs" className="btn-secondary">
            ดูประกาศหาติวเตอร์
          </Link>
          {!session && (
            <Link href="/register?role=tutor" className="btn-secondary">
              สมัครเป็นติวเตอร์
            </Link>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
