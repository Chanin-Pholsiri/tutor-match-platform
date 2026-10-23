import Link from "next/link";
import { getSession, homePathForRole } from "@/lib/auth";
import { logout } from "@/app/login/actions";

export async function PublicNav() {
  const session = await getSession();

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="shrink-0 text-lg font-bold text-primary">
          หาติวเตอร์
        </Link>
        <nav className="flex items-center gap-2 text-sm sm:gap-3">
          <Link
            href="/search"
            className="hidden rounded-lg px-3 py-2 hover:bg-secondary sm:inline-flex"
          >
            ค้นหาติวเตอร์
          </Link>
          <Link
            href="/jobs"
            className="hidden rounded-lg px-3 py-2 hover:bg-secondary sm:inline-flex"
          >
            ประกาศหาติวเตอร์
          </Link>
          {session ? (
            <>
              <span className="hidden text-muted-foreground sm:inline">
                {session.user.name}
              </span>
              <Link href={homePathForRole(session.user.role)} className="btn-primary">
                ไปที่แดชบอร์ดของฉัน
              </Link>
              <form action={logout}>
                <button className="btn-secondary" type="submit">
                  ออกจากระบบ
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-3 py-2 hover:bg-secondary">
                เข้าสู่ระบบ
              </Link>
              <Link href="/register" className="btn-primary">
                สมัครสมาชิก
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
