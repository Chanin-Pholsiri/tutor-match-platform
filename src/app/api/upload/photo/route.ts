import { put } from "@vercel/blob";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.user.role !== "TUTOR") {
    return new Response(null, { status: 403 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      { error: "ยังไม่ได้ตั้งค่า Vercel Blob (BLOB_READ_WRITE_TOKEN)" },
      { status: 501 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "ไม่พบไฟล์" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "รองรับเฉพาะไฟล์รูปภาพ" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return Response.json({ error: "ไฟล์ต้องไม่เกิน 5MB" }, { status: 400 });
  }

  const blob = await put(`tutor-photos/${session.user.id}-${Date.now()}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return Response.json({ url: blob.url });
}
