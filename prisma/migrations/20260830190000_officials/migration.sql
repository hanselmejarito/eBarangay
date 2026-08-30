-- CreateEnum
CREATE TYPE "OfficialRole" AS ENUM (
  'PUNONG_BARANGAY',
  'BARANGAY_KAGAWAD',
  'SECRETARY',
  'TREASURER',
  'SK_CHAIRPERSON',
  'SK_KAGAWAD',
  'TANOD',
  'HEALTH_WORKER',
  'OTHER'
);

-- CreateTable
CREATE TABLE "BarangayOfficial" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "OfficialRole" NOT NULL,
    "committee" TEXT,
    "photoPath" TEXT,
    "contactNumber" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BarangayOfficial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BarangayOfficial_role_sortOrder_idx" ON "BarangayOfficial"("role", "sortOrder");

-- AddForeignKey
ALTER TABLE "BarangayOfficial" ADD CONSTRAINT "BarangayOfficial_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
