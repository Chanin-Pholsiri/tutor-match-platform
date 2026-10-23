import "server-only";
import { prisma } from "./db";

const OPEN_STATUSES = ["PENDING", "COUNTERED"] as const;

class RequestActionError extends Error {}

async function getOpenRequestForActor(requestId: string, userId: string) {
  const request = await prisma.learningRequest.findUniqueOrThrow({
    where: { id: requestId },
  });
  if (request.parentId !== userId && request.tutorId !== userId) {
    throw new RequestActionError("คุณไม่มีสิทธิ์เข้าถึงคำขอนี้");
  }
  if (!OPEN_STATUSES.includes(request.status as (typeof OPEN_STATUSES)[number])) {
    throw new RequestActionError("คำขอนี้ถูกปิดไปแล้ว");
  }
  return request;
}

/** ต้องเป็นตาของ userId เท่านั้น (อีกฝ่ายเพิ่งกระทำล่าสุด) */
function assertMyTurn(request: { lastActionById: string | null }, userId: string) {
  if (request.lastActionById === userId) {
    throw new RequestActionError("กำลังรอการตอบกลับจากอีกฝ่าย");
  }
}

export async function acceptRequest(userId: string, requestId: string) {
  const request = await getOpenRequestForActor(requestId, userId);
  assertMyTurn(request, userId);

  await prisma.$transaction([
    prisma.learningRequest.update({
      where: { id: requestId },
      data: { status: "ACCEPTED", lastActionById: userId },
    }),
    prisma.requestEvent.create({
      data: {
        requestId,
        actorId: userId,
        action: "ACCEPTED",
        price: request.proposedPrice,
      },
    }),
  ]);
}

export async function declineRequest(userId: string, requestId: string) {
  const request = await getOpenRequestForActor(requestId, userId);
  assertMyTurn(request, userId);

  await prisma.$transaction([
    prisma.learningRequest.update({
      where: { id: requestId },
      data: { status: "DECLINED", lastActionById: userId },
    }),
    prisma.requestEvent.create({
      data: { requestId, actorId: userId, action: "DECLINED" },
    }),
  ]);
}

export async function counterRequest(
  userId: string,
  requestId: string,
  price: number,
  note?: string,
) {
  const request = await getOpenRequestForActor(requestId, userId);
  assertMyTurn(request, userId);

  await prisma.$transaction([
    prisma.learningRequest.update({
      where: { id: requestId },
      data: { status: "COUNTERED", proposedPrice: price, lastActionById: userId },
    }),
    prisma.requestEvent.create({
      data: { requestId, actorId: userId, action: "COUNTERED", price, note },
    }),
  ]);
}

export async function cancelRequest(userId: string, requestId: string) {
  const request = await getOpenRequestForActor(requestId, userId);
  if (request.parentId !== userId) {
    throw new RequestActionError("เฉพาะผู้ปกครองที่ส่งคำขอเท่านั้นที่ยกเลิกได้");
  }

  await prisma.$transaction([
    prisma.learningRequest.update({
      where: { id: requestId },
      data: { status: "CANCELLED", lastActionById: userId },
    }),
    prisma.requestEvent.create({
      data: { requestId, actorId: userId, action: "CANCELLED" },
    }),
  ]);
}

export { RequestActionError };
