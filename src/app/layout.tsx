import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const prompt = Prompt({
  variable: "--font-sans",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "หาติวเตอร์ | แพลตฟอร์มจับคู่ติวเตอร์กับผู้เรียน",
  description:
    "ค้นหาติวเตอร์ตามวิชา ระดับชั้น และพื้นที่ ส่งคำขอเรียนและเจรจาราคาได้ในที่เดียว",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${prompt.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
