import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const KIND_FIELDS = {
  idCard: { data: "idCardData", contentType: "idCardContentType" },
  credential: { data: "credentialData", contentType: "credentialContentType" },
} as const;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.user.role !== "TUTOR") {
    return new Response(null, { status: 403 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const kind = form.get("kind")?.toString();
  if (!kind || !(kind in KIND_FIELDS)) {
    return Response.json({ error: "ประเภทเอกสารไม่ถูกต้อง" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return Response.json({ error: "ไม่พบไฟล์" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json(
      { error: "รองรับเฉพาะไฟล์รูปภาพ (JPG/PNG/WEBP) หรือ PDF" },
      { status: 400 },
    );
  }
  if (file.size > 10 * 1024 * 1024) {
    return Response.json({ error: "ไฟล์ต้องไม่เกิน 10MB" }, { status: 400 });
  }

  const fields = KIND_FIELDS[kind as keyof typeof KIND_FIELDS];
  const buffer = Buffer.from(await file.arrayBuffer());

  await prisma.tutorProfile.update({
    where: { userId: session.user.id },
    data: {
      [fields.data]: buffer,
      [fields.contentType]: file.type,
    },
  });

  return Response.json({ ok: true });
}
