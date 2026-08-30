-- CreateEnum
CREATE TYPE "LifeStatus" AS ENUM ('ALIVE', 'DECEASED');

-- AlterTable
ALTER TABLE "Resident" ADD COLUMN "isRegisteredVoter" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Resident" ADD COLUMN "isSkVoter" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Resident" ADD COLUMN "lifeStatus" "LifeStatus" NOT NULL DEFAULT 'ALIVE';
ALTER TABLE "Resident" ADD COLUMN "deceasedAt" TIMESTAMP(3);
ALTER TABLE "Resident" ADD COLUMN "deathNote" TEXT;

-- CreateIndex
CREATE INDEX "Resident_lifeStatus_idx" ON "Resident"("lifeStatus");
