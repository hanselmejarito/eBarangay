-- CreateEnum
CREATE TYPE "InventoryCategory" AS ENUM ('FURNITURE', 'EVENT', 'AUDIO_VISUAL', 'VEHICLE', 'COMMUNICATION', 'DISASTER', 'SPORTS', 'OFFICE', 'OTHER');

-- CreateEnum
CREATE TYPE "InventoryCondition" AS ENUM ('GOOD', 'FAIR', 'NEEDS_REPAIR', 'UNUSABLE');

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "InventoryCategory" NOT NULL DEFAULT 'OTHER',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "quantityOut" INTEGER NOT NULL DEFAULT 0,
    "condition" "InventoryCondition" NOT NULL DEFAULT 'GOOD',
    "location" TEXT,
    "propertyNumber" TEXT,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InventoryItem_category_idx" ON "InventoryItem"("category");

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
