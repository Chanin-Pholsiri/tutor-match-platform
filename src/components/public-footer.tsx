import Link from "next/link";

export function PublicFooter() {
  const year = new Date().getFullYear() + 543; // พ.ศ.
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
        <p>© {year} หาติวเตอร์ สงวนลิขสิทธิ์</p>
        <nav className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/search" className="hover:text-foreground hover:underline">
            ค้นหาติวเตอร์
          </Link>
          <Link href="/jobs" className="hover:text-foreground hover:underline">
            ประกาศหาติวเตอร์
          </Link>
          <Link href="/register" className="hover:text-foreground hover:underline">
            สมัครสมาชิก
          </Link>
        </nav>
      </div>
    </footer>
  );
}
