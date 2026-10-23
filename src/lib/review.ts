import "server-only";
import { prisma } from "./db";
import { RequestActionError } from "./learning-request";

export async function submitReview(
  parentId: string,
  requestId: string,
  rating: number,
  comment?: string,
) {
  const request = await prisma.learningRequest.findUniqueOrThrow({
    where: { id: requestId },
  });
  if (request.parentId !== parentId) {
    throw new RequestActionError("คุณไม่มีสิทธิ์รีวิวคำขอนี้");
  }
  if (request.status !== "ACCEPTED") {
    throw new RequestActionError("รีวิวได้เฉพาะคำขอที่ตกลงราคากันแล้วเท่านั้น");
  }

  await prisma.review.upsert({
    where: { requestId },
    update: { rating, comment: comment || null },
    create: {
      requestId,
      tutorId: request.tutorId,
      parentId,
      rating,
      comment: comment || null,
    },
  });
}
