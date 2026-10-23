import Link from "next/link";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-6 text-center">
        <Link href="/" className="text-lg font-bold text-primary">
          หาติวเตอร์
        </Link>
        <h1 className="mt-2 text-2xl font-bold">เข้าสู่ระบบ</h1>
      </div>
      <div className="card">
        <LoginForm next={next} />
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        ยังไม่มีบัญชี?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          สมัครสมาชิก
        </Link>
      </p>
    </div>
  );
}
