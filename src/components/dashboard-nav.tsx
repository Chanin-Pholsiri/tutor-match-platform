import Link from "next/link";
import { logout } from "@/app/login/actions";

const ROLE_LABEL: Record<string, string> = {
  PARENT: "ผู้ปกครอง/ผู้เรียน",
  TUTOR: "ติวเตอร์",
  ADMIN: "แอดมิน",
};

export function DashboardNav({
  userName,
  role,
  links,
}: {
  userName: string;
  role: "PARENT" | "TUTOR" | "ADMIN";
  links: { href: string; label: string }[];
}) {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="shrink-0 font-bold text-primary">
          หาติวเตอร์
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-muted-foreground sm:inline">
            {userName} · {ROLE_LABEL[role]}
          </span>
          <form action={logout}>
            <button className="btn-secondary" type="submit">
              ออกจากระบบ
            </button>
          </form>
        </div>
      </div>
      <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="shrink-0 rounded-lg px-3 py-1.5 text-sm text-foreground hover:bg-secondary"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
