import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import type { AchievementCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AchievementRow = {
  id: string;
  title: string;
  description: string;
  imagePath: string | null;
  category: AchievementCategory;
  awardedBy: string | null;
  awardedAt: Date;
  publishedAt: Date | null;
};

export async function listPublishedAchievements(take?: number) {
  const limit = take ? Prisma.sql`LIMIT ${take}` : Prisma.empty;
  return prisma.$queryRaw<AchievementRow[]>`
    SELECT
      id,
      title,
      description,
      "imagePath",
      category,
      "awardedBy",
      "awardedAt",
      "publishedAt"
    FROM "Achievement"
    WHERE "publishedAt" IS NOT NULL AND "publishedAt" <= NOW()
    ORDER BY "awardedAt" DESC
    ${limit}
  `;
}

export async function listAllAchievements(page?: { skip: number; take: number }) {
  const limit = page
    ? Prisma.sql`LIMIT ${page.take} OFFSET ${page.skip}`
    : Prisma.empty;
  return prisma.$queryRaw<AchievementRow[]>`
    SELECT
      id,
      title,
      description,
      "imagePath",
      category,
      "awardedBy",
      "awardedAt",
      "publishedAt"
    FROM "Achievement"
    ORDER BY "awardedAt" DESC
    ${limit}
  `;
}

export async function countAchievements() {
  const rows = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*)::bigint AS count FROM "Achievement"
  `;
  return Number(rows[0]?.count ?? 0);
}

export async function getAchievementById(id: string) {
  const rows = await prisma.$queryRaw<AchievementRow[]>`
    SELECT
      id,
      title,
      description,
      "imagePath",
      category,
      "awardedBy",
      "awardedAt",
      "publishedAt"
    FROM "Achievement"
    WHERE id = ${id}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function insertAchievement(data: {
  title: string;
  description: string;
  category: AchievementCategory;
  awardedBy: string | null;
  awardedAt: Date;
  publishedAt: Date;
  imagePath?: string;
  createdById: string;
}) {
  const id = randomUUID();
  await prisma.$executeRaw`
    INSERT INTO "Achievement" (
      id, title, description, "imagePath", category, "awardedBy",
      "awardedAt", "publishedAt", "createdById", "createdAt", "updatedAt"
    ) VALUES (
      ${id},
      ${data.title},
      ${data.description},
      ${data.imagePath ?? null},
      ${data.category}::"AchievementCategory",
      ${data.awardedBy},
      ${data.awardedAt},
      ${data.publishedAt},
      ${data.createdById},
      NOW(),
      NOW()
    )
  `;
  return { id };
}

export async function updateAchievement(
  id: string,
  data: {
    title: string;
    description: string;
    category: AchievementCategory;
    awardedBy: string | null;
    awardedAt: Date;
    publishedAt: Date;
    imagePath?: string;
  },
) {
  if (data.imagePath) {
    await prisma.$executeRaw`
      UPDATE "Achievement"
      SET
        title = ${data.title},
        description = ${data.description},
        category = ${data.category}::"AchievementCategory",
        "awardedBy" = ${data.awardedBy},
        "awardedAt" = ${data.awardedAt},
        "publishedAt" = ${data.publishedAt},
        "imagePath" = ${data.imagePath},
        "updatedAt" = NOW()
      WHERE id = ${id}
    `;
  } else {
    await prisma.$executeRaw`
      UPDATE "Achievement"
      SET
        title = ${data.title},
        description = ${data.description},
        category = ${data.category}::"AchievementCategory",
        "awardedBy" = ${data.awardedBy},
        "awardedAt" = ${data.awardedAt},
        "publishedAt" = ${data.publishedAt},
        "updatedAt" = NOW()
      WHERE id = ${id}
    `;
  }
  return { id };
}

export async function deleteAchievementRow(id: string) {
  await prisma.$executeRaw`DELETE FROM "Achievement" WHERE id = ${id}`;
}
