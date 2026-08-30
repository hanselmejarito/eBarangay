import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { OFFICIAL_ROLE_ORDER } from "@/lib/constants";

export type OfficialRow = {
  id: string;
  name: string;
  role: string;
  committee: string | null;
  photoPath: string | null;
  contactNumber: string | null;
  sortOrder: number;
  published: boolean;
};

export async function listOfficials(
  publishedOnly = false,
  page?: { skip: number; take: number },
) {
  const filter = publishedOnly ? Prisma.sql`published = true` : Prisma.sql`TRUE`;
  const limit = page
    ? Prisma.sql`LIMIT ${page.take} OFFSET ${page.skip}`
    : Prisma.empty;
  return prisma.$queryRaw<OfficialRow[]>`
    SELECT
      id,
      name,
      role,
      committee,
      "photoPath",
      "contactNumber",
      "sortOrder",
      published
    FROM "BarangayOfficial"
    WHERE ${filter}
    ORDER BY "sortOrder" ASC, name ASC
    ${limit}
  `;
}

export async function countOfficials(publishedOnly = false) {
  const filter = publishedOnly ? Prisma.sql`published = true` : Prisma.sql`TRUE`;
  const rows = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*)::bigint AS count FROM "BarangayOfficial" WHERE ${filter}
  `;
  return Number(rows[0]?.count ?? 0);
}

export async function getOfficial(id: string) {
  const rows = await prisma.$queryRaw<OfficialRow[]>`
    SELECT
      id,
      name,
      role,
      committee,
      "photoPath",
      "contactNumber",
      "sortOrder",
      published
    FROM "BarangayOfficial"
    WHERE id = ${id}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function insertOfficial(data: {
  name: string;
  role: string;
  committee: string | null;
  contactNumber: string | null;
  sortOrder?: number;
  published: boolean;
  photoPath?: string;
  createdById: string;
}) {
  const id = randomUUID();
  const sortOrder = data.sortOrder ?? OFFICIAL_ROLE_ORDER[data.role] ?? 90;
  await prisma.$executeRaw`
    INSERT INTO "BarangayOfficial" (
      id, name, role, committee, "photoPath", "contactNumber",
      "sortOrder", published, "createdById", "createdAt", "updatedAt"
    ) VALUES (
      ${id},
      ${data.name},
      ${data.role}::"OfficialRole",
      ${data.committee},
      ${data.photoPath ?? null},
      ${data.contactNumber},
      ${sortOrder},
      ${data.published},
      ${data.createdById},
      NOW(),
      NOW()
    )
  `;
  return { id };
}

export async function updateOfficial(
  id: string,
  data: {
    name: string;
    role: string;
    committee: string | null;
    contactNumber: string | null;
    sortOrder: number;
    published: boolean;
    photoPath?: string;
  },
) {
  if (data.photoPath) {
    await prisma.$executeRaw`
      UPDATE "BarangayOfficial"
      SET
        name = ${data.name},
        role = ${data.role}::"OfficialRole",
        committee = ${data.committee},
        "contactNumber" = ${data.contactNumber},
        "sortOrder" = ${data.sortOrder},
        published = ${data.published},
        "photoPath" = ${data.photoPath},
        "updatedAt" = NOW()
      WHERE id = ${id}
    `;
  } else {
    await prisma.$executeRaw`
      UPDATE "BarangayOfficial"
      SET
        name = ${data.name},
        role = ${data.role}::"OfficialRole",
        committee = ${data.committee},
        "contactNumber" = ${data.contactNumber},
        "sortOrder" = ${data.sortOrder},
        published = ${data.published},
        "updatedAt" = NOW()
      WHERE id = ${id}
    `;
  }
  return { id };
}

export async function deleteOfficial(id: string) {
  await prisma.$executeRaw`DELETE FROM "BarangayOfficial" WHERE id = ${id}`;
}
