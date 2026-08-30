import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type InventoryRow = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  quantityOut: number;
  condition: string;
  location: string | null;
  propertyNumber: string | null;
  notes: string | null;
};

export async function listInventoryItems(filters?: {
  category?: string;
  condition?: string;
  q?: string;
  skip?: number;
  take?: number;
}) {
  const parts: Prisma.Sql[] = [Prisma.sql`TRUE`];
  if (filters?.category) {
    parts.push(Prisma.sql`category::text = ${filters.category}`);
  }
  if (filters?.condition) {
    parts.push(Prisma.sql`condition::text = ${filters.condition}`);
  }
  if (filters?.q) {
    const q = `%${filters.q}%`;
    parts.push(
      Prisma.sql`(name ILIKE ${q} OR COALESCE(location, '') ILIKE ${q} OR COALESCE("propertyNumber", '') ILIKE ${q})`,
    );
  }

  return prisma.$queryRaw<InventoryRow[]>`
    SELECT
      id,
      name,
      category,
      quantity,
      "quantityOut",
      condition,
      location,
      "propertyNumber",
      notes
    FROM "InventoryItem"
    WHERE ${Prisma.join(parts, " AND ")}
    ORDER BY name ASC
    LIMIT ${filters?.take ?? 10} OFFSET ${filters?.skip ?? 0}
  `;
}

export async function countInventoryItems(filters?: {
  category?: string;
  condition?: string;
  q?: string;
}) {
  const parts: Prisma.Sql[] = [Prisma.sql`TRUE`];
  if (filters?.category) {
    parts.push(Prisma.sql`category::text = ${filters.category}`);
  }
  if (filters?.condition) {
    parts.push(Prisma.sql`condition::text = ${filters.condition}`);
  }
  if (filters?.q) {
    const q = `%${filters.q}%`;
    parts.push(
      Prisma.sql`(name ILIKE ${q} OR COALESCE(location, '') ILIKE ${q} OR COALESCE("propertyNumber", '') ILIKE ${q})`,
    );
  }
  const rows = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*)::bigint AS count
    FROM "InventoryItem"
    WHERE ${Prisma.join(parts, " AND ")}
  `;
  return Number(rows[0]?.count ?? 0);
}

export async function getInventoryItem(id: string) {
  const rows = await prisma.$queryRaw<InventoryRow[]>`
    SELECT
      id,
      name,
      category,
      quantity,
      "quantityOut",
      condition,
      location,
      "propertyNumber",
      notes
    FROM "InventoryItem"
    WHERE id = ${id}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function insertInventoryItem(data: {
  name: string;
  category: string;
  quantity: number;
  quantityOut: number;
  condition: string;
  location: string | null;
  propertyNumber: string | null;
  notes: string | null;
  createdById: string;
}) {
  const id = randomUUID();
  await prisma.$executeRaw`
    INSERT INTO "InventoryItem" (
      id, name, category, quantity, "quantityOut", condition,
      location, "propertyNumber", notes, "createdById", "createdAt", "updatedAt"
    ) VALUES (
      ${id},
      ${data.name},
      ${data.category}::"InventoryCategory",
      ${data.quantity},
      ${data.quantityOut},
      ${data.condition}::"InventoryCondition",
      ${data.location},
      ${data.propertyNumber},
      ${data.notes},
      ${data.createdById},
      NOW(),
      NOW()
    )
  `;
  return { id };
}

export async function updateInventoryItem(
  id: string,
  data: {
    name: string;
    category: string;
    quantity: number;
    quantityOut: number;
    condition: string;
    location: string | null;
    propertyNumber: string | null;
    notes: string | null;
  },
) {
  await prisma.$executeRaw`
    UPDATE "InventoryItem"
    SET
      name = ${data.name},
      category = ${data.category}::"InventoryCategory",
      quantity = ${data.quantity},
      "quantityOut" = ${data.quantityOut},
      condition = ${data.condition}::"InventoryCondition",
      location = ${data.location},
      "propertyNumber" = ${data.propertyNumber},
      notes = ${data.notes},
      "updatedAt" = NOW()
    WHERE id = ${id}
  `;
  return { id };
}

export async function deleteInventoryItem(id: string) {
  await prisma.$executeRaw`DELETE FROM "InventoryItem" WHERE id = ${id}`;
}
