-- CreateEnum
CREATE TYPE "JobPostStatus" AS ENUM ('OPEN', 'FILLED', 'CLOSED');

-- AlterTable
ALTER TABLE "LearningRequest" ADD COLUMN     "jobPostId" TEXT;

-- CreateTable
CREATE TABLE "JobPost" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "level" "GradeLevel" NOT NULL,
    "province" TEXT NOT NULL,
    "district" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "schedule" TEXT,
    "budgetMin" DECIMAL(10,2),
    "budgetMax" DECIMAL(10,2),
    "description" TEXT,
    "status" "JobPostStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobProposal" (
    "id" TEXT NOT NULL,
    "jobPostId" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "proposedPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobProposal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobPost_status_idx" ON "JobPost"("status");

-- CreateIndex
CREATE INDEX "JobPost_subjectId_idx" ON "JobPost"("subjectId");

-- CreateIndex
CREATE INDEX "JobPost_province_idx" ON "JobPost"("province");

-- CreateIndex
CREATE UNIQUE INDEX "JobProposal_jobPostId_tutorId_key" ON "JobProposal"("jobPostId", "tutorId");

-- AddForeignKey
ALTER TABLE "LearningRequest" ADD CONSTRAINT "LearningRequest_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "JobPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPost" ADD CONSTRAINT "JobPost_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPost" ADD CONSTRAINT "JobPost_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobProposal" ADD CONSTRAINT "JobProposal_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "JobPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobProposal" ADD CONSTRAINT "JobProposal_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
