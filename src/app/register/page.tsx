import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParentRegisterForm } from "./parent-form";
import { TutorRegisterForm } from "./tutor-form";

export default function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-12">
      <div className="mb-6 text-center">
        <Link href="/" className="text-lg font-bold text-primary">
          หาติวเตอร์
        </Link>
        <h1 className="mt-2 text-2xl font-bold">สมัครสมาชิก</h1>
      </div>
      <div className="card">
        <RoleTabs searchParams={searchParams} />
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        มีบัญชีอยู่แล้ว?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          เข้าสู่ระบบ
        </Link>
      </p>
    </div>
  );
}

async function RoleTabs({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const defaultTab = role === "tutor" ? "tutor" : "parent";
  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList className="mb-6 w-full">
        <TabsTrigger value="parent" className="flex-1">
          ผู้ปกครอง/ผู้เรียน
        </TabsTrigger>
        <TabsTrigger value="tutor" className="flex-1">
          ติวเตอร์
        </TabsTrigger>
      </TabsList>
      <TabsContent value="parent">
        <ParentRegisterForm />
      </TabsContent>
      <TabsContent value="tutor">
        <TutorRegisterForm />
      </TabsContent>
    </Tabs>
  );
}
