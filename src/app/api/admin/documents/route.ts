import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const KIND_FIELDS = {
  idCard: { data: "idCardData", contentType: "idCardContentType" },
  credential: { data: "credentialData", contentType: "credentialContentType" },
} as const;

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return new Response(null, { status: 403 });
  }

  const params = new URL(request.url).searchParams;
  const tutorProfileId = params.get("tutorProfileId");
  const kind = params.get("kind");
  if (!tutorProfileId || !kind || !(kind in KIND_FIELDS)) {
    return new Response(null, { status: 400 });
  }

  const profile = await prisma.tutorProfile.findUnique({ where: { id: tutorProfileId } });
  if (!profile) {
    return new Response(null, { status: 404 });
  }
  const isOwner = session.user.id === profile.userId;
  if (!isOwner && session.user.role !== "ADMIN") {
    return new Response(null, { status: 403 });
  }

  const fields = KIND_FIELDS[kind as keyof typeof KIND_FIELDS];
  const data = profile[fields.data as keyof typeof profile] as Buffer | null;
  const contentType = profile[fields.contentType as keyof typeof profile] as string | null;
  if (!data || !contentType) {
    return new Response(null, { status: 404 });
  }

  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, no-store",
    },
  });
}
