import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function money(value: unknown) {
  return Number(value ?? 0);
}

export type BudgetLineRow = {
  id: string;
  year: number;
  category: string;
  title: string;
  allocated: number;
  notes: string | null;
  spent: number;
};

export type BudgetExpenseRow = {
  id: string;
  lineId: string;
  spentAt: Date;
  amount: number;
  payee: string | null;
  description: string;
  referenceNo: string | null;
  receiptPath: string | null;
};

export async function listBudgetYears() {
  const rows = await prisma.$queryRaw<{ year: number }[]>`
    SELECT DISTINCT year FROM "BudgetLine" ORDER BY year DESC
  `;
  return rows.map((r) => r.year);
}

export async function listBudgetLines(
  year: number,
  page?: { skip: number; take: number },
) {
  const rows = await prisma.$queryRaw<
    {
      id: string;
      year: number;
      category: string;
      title: string;
      allocated: unknown;
      notes: string | null;
      spent: unknown;
    }[]
  >`
    SELECT
      l.id,
      l.year,
      l.category,
      l.title,
      l.allocated,
      l.notes,
      COALESCE(SUM(e.amount), 0) AS spent
    FROM "BudgetLine" l
    LEFT JOIN "BudgetExpense" e ON e."lineId" = l.id
    WHERE l.year = ${year}
    GROUP BY l.id
    ORDER BY l.category ASC, l.title ASC
    ${page ? Prisma.sql`LIMIT ${page.take} OFFSET ${page.skip}` : Prisma.empty}
  `;
  return rows.map((r) => ({
    ...r,
    allocated: money(r.allocated),
    spent: money(r.spent),
  })) satisfies BudgetLineRow[];
}

export async function countBudgetLines(year: number) {
  const rows = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*)::bigint AS count FROM "BudgetLine" WHERE year = ${year}
  `;
  return Number(rows[0]?.count ?? 0);
}

export async function getBudgetLine(id: string) {
  const rows = await listBudgetLinesByIds([id]);
  return rows[0] ?? null;
}

async function listBudgetLinesByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const rows = await prisma.$queryRaw<
    {
      id: string;
      year: number;
      category: string;
      title: string;
      allocated: unknown;
      notes: string | null;
      spent: unknown;
    }[]
  >`
    SELECT
      l.id,
      l.year,
      l.category,
      l.title,
      l.allocated,
      l.notes,
      COALESCE(SUM(e.amount), 0) AS spent
    FROM "BudgetLine" l
    LEFT JOIN "BudgetExpense" e ON e."lineId" = l.id
    WHERE l.id = ${ids[0]}
    GROUP BY l.id
  `;
  return rows.map((r) => ({
    ...r,
    allocated: money(r.allocated),
    spent: money(r.spent),
  })) satisfies BudgetLineRow[];
}

export async function yearBudgetTotals(year: number) {
  const rows = await prisma.$queryRaw<
    { allocated: unknown; spent: unknown }[]
  >`
    SELECT
      COALESCE(SUM(l.allocated), 0) AS allocated,
      COALESCE((
        SELECT SUM(e.amount)
        FROM "BudgetExpense" e
        JOIN "BudgetLine" l2 ON l2.id = e."lineId"
        WHERE l2.year = ${year}
      ), 0) AS spent
    FROM "BudgetLine" l
    WHERE l.year = ${year}
  `;
  const allocated = money(rows[0]?.allocated);
  const spent = money(rows[0]?.spent);
  return { allocated, spent, remaining: allocated - spent };
}

export async function insertBudgetLine(data: {
  year: number;
  category: string;
  title: string;
  allocated: number;
  notes: string | null;
  createdById: string;
}) {
  const id = randomUUID();
  await prisma.$executeRaw`
    INSERT INTO "BudgetLine" (
      id, year, category, title, allocated, notes, "createdById", "createdAt", "updatedAt"
    ) VALUES (
      ${id},
      ${data.year},
      ${data.category}::"BudgetCategory",
      ${data.title},
      ${data.allocated},
      ${data.notes},
      ${data.createdById},
      NOW(),
      NOW()
    )
  `;
  return { id };
}

export async function updateBudgetLine(
  id: string,
  data: {
    year: number;
    category: string;
    title: string;
    allocated: number;
    notes: string | null;
  },
) {
  await prisma.$executeRaw`
    UPDATE "BudgetLine"
    SET
      year = ${data.year},
      category = ${data.category}::"BudgetCategory",
      title = ${data.title},
      allocated = ${data.allocated},
      notes = ${data.notes},
      "updatedAt" = NOW()
    WHERE id = ${id}
  `;
  return { id };
}

export async function deleteBudgetLine(id: string) {
  await prisma.$executeRaw`DELETE FROM "BudgetLine" WHERE id = ${id}`;
}

export async function listBudgetExpenses(lineId: string) {
  const rows = await prisma.$queryRaw<
    {
      id: string;
      lineId: string;
      spentAt: Date;
      amount: unknown;
      payee: string | null;
      description: string;
      referenceNo: string | null;
      receiptPath: string | null;
    }[]
  >`
    SELECT id, "lineId", "spentAt", amount, payee, description, "referenceNo", "receiptPath"
    FROM "BudgetExpense"
    WHERE "lineId" = ${lineId}
    ORDER BY "spentAt" DESC, "createdAt" DESC
  `;
  return rows.map((r) => ({
    ...r,
    amount: money(r.amount),
  })) satisfies BudgetExpenseRow[];
}

export async function insertBudgetExpense(data: {
  lineId: string;
  spentAt: Date;
  amount: number;
  payee: string | null;
  description: string;
  referenceNo: string | null;
  receiptPath: string | null;
  createdById: string;
}) {
  const id = randomUUID();
  await prisma.$executeRaw`
    INSERT INTO "BudgetExpense" (
      id, "lineId", "spentAt", amount, payee, description, "referenceNo",
      "receiptPath", "createdById", "createdAt", "updatedAt"
    ) VALUES (
      ${id},
      ${data.lineId},
      ${data.spentAt},
      ${data.amount},
      ${data.payee},
      ${data.description},
      ${data.referenceNo},
      ${data.receiptPath},
      ${data.createdById},
      NOW(),
      NOW()
    )
  `;
  return { id };
}

export async function deleteBudgetExpense(id: string) {
  await prisma.$executeRaw`DELETE FROM "BudgetExpense" WHERE id = ${id}`;
}
