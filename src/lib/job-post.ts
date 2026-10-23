import "server-only";
import { prisma } from "./db";
import { RequestActionError } from "./learning-request";

export async function submitJobProposal(
  tutorId: string,
  jobPostId: string,
  message: string,
  proposedPrice: number,
) {
  const tutorProfile = await prisma.tutorProfile.findUnique({ where: { userId: tutorId } });
  if (!tutorProfile || tutorProfile.approvalStatus !== "APPROVED") {
    throw new RequestActionError("ต้องเป็นติวเตอร์ที่ผ่านการอนุมัติแล้วเท่านั้นจึงจะนำเสนอตัวได้");
  }

  const jobPost = await prisma.jobPost.findUniqueOrThrow({ where: { id: jobPostId } });
  if (jobPost.status !== "OPEN") {
    throw new RequestActionError("ประกาศนี้ปิดรับการนำเสนอตัวแล้ว");
  }

  await prisma.jobProposal.upsert({
    where: { jobPostId_tutorId: { jobPostId, tutorId } },
    update: { message, proposedPrice },
    create: { jobPostId, tutorId, message, proposedPrice },
  });
}

export async function selectJobProposal(
  parentId: string,
  jobPostId: string,
  proposalId: string,
) {
  const jobPost = await prisma.jobPost.findUniqueOrThrow({ where: { id: jobPostId } });
  if (jobPost.parentId !== parentId) {
    throw new RequestActionError("คุณไม่มีสิทธิ์จัดการประกาศนี้");
  }
  if (jobPost.status !== "OPEN") {
    throw new RequestActionError("ประกาศนี้ถูกปิดไปแล้ว");
  }

  const proposal = await prisma.jobProposal.findUniqueOrThrow({ where: { id: proposalId } });
  if (proposal.jobPostId !== jobPostId) {
    throw new RequestActionError("ไม่พบข้อเสนอนี้ในประกาศ");
  }

  const request = await prisma.$transaction(async (tx) => {
    const created = await tx.learningRequest.create({
      data: {
        parentId,
        tutorId: proposal.tutorId,
        subjectId: jobPost.subjectId,
        level: jobPost.level,
        message: proposal.message,
        proposedPrice: proposal.proposedPrice,
        originalPrice: proposal.proposedPrice,
        lastActionById: parentId,
        jobPostId: jobPost.id,
        events: {
          create: {
            actorId: parentId,
            action: "SENT",
            price: proposal.proposedPrice,
            note: `เลือกจากประกาศหาติวเตอร์: ${proposal.message}`,
          },
        },
      },
    });
    await tx.jobPost.update({ where: { id: jobPostId }, data: { status: "FILLED" } });
    return created;
  });

  return request;
}

export async function closeJobPost(parentId: string, jobPostId: string) {
  const jobPost = await prisma.jobPost.findUniqueOrThrow({ where: { id: jobPostId } });
  if (jobPost.parentId !== parentId) {
    throw new RequestActionError("คุณไม่มีสิทธิ์จัดการประกาศนี้");
  }
  if (jobPost.status !== "OPEN") {
    throw new RequestActionError("ประกาศนี้ถูกปิดไปแล้ว");
  }
  await prisma.jobPost.update({ where: { id: jobPostId }, data: { status: "CLOSED" } });
}
