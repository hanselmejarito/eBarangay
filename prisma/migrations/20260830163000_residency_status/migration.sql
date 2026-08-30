-- CreateEnum
CREATE TYPE "HouseholdRelation" AS ENUM ('MEMBER', 'BOARDER');

-- CreateEnum
CREATE TYPE "ResidencyStatus" AS ENUM ('ACTIVE', 'MOVED_OUT');

-- AlterTable
ALTER TABLE "Resident" ADD COLUMN "relation" "HouseholdRelation" NOT NULL DEFAULT 'MEMBER';
ALTER TABLE "Resident" ADD COLUMN "residencyStatus" "ResidencyStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "Resident" ADD COLUMN "movedOutAt" TIMESTAMP(3);
ALTER TABLE "Resident" ADD COLUMN "movedOutNote" TEXT;

-- CreateIndex
CREATE INDEX "Resident_residencyStatus_idx" ON "Resident"("residencyStatus");
