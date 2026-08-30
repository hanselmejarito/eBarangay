-- CreateEnum
CREATE TYPE "BudgetCategory" AS ENUM (
  'PERSONAL_SERVICES',
  'MOOE',
  'CAPITAL_OUTLAY',
  'SK_FUND',
  'GAD',
  'CALAMITY',
  'DEVELOPMENT',
  'PEACE_AND_ORDER',
  'HEALTH',
  'OTHER'
);

-- CreateTable
CREATE TABLE "BudgetLine" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "category" "BudgetCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "allocated" DECIMAL(14,2) NOT NULL,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetExpense" (
    "id" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,
    "spentAt" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "payee" TEXT,
    "description" TEXT NOT NULL,
    "referenceNo" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetExpense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BudgetLine_year_category_idx" ON "BudgetLine"("year", "category");

-- CreateIndex
CREATE INDEX "BudgetExpense_lineId_idx" ON "BudgetExpense"("lineId");

-- CreateIndex
CREATE INDEX "BudgetExpense_spentAt_idx" ON "BudgetExpense"("spentAt");

-- AddForeignKey
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetExpense" ADD CONSTRAINT "BudgetExpense_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "BudgetLine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetExpense" ADD CONSTRAINT "BudgetExpense_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
