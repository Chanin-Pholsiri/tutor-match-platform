/*
  Warnings:

  - You are about to drop the column `credentialUrl` on the `TutorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `idCardUrl` on the `TutorProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TutorProfile" DROP COLUMN "credentialUrl",
DROP COLUMN "idCardUrl",
ADD COLUMN     "credentialContentType" TEXT,
ADD COLUMN     "credentialData" BYTEA,
ADD COLUMN     "idCardContentType" TEXT,
ADD COLUMN     "idCardData" BYTEA;
