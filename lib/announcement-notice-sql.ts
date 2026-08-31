import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

function missingNoticeTable(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  return message.includes("42P01") || message.includes("AnnouncementNotice");
}

export type NoticeRecipient = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  mobile: string | null;
};

export type NoticeRow = {
  id: string;
  announcementId: string;
  residentId: string;
  email: string | null;
  mobile: string | null;
  emailStatus: string;
  smsStatus: string;
  readAt: Date | null;
  createdAt: Date;
  title: string;
  content: string;
  priority: string;
  publishedAt: Date | null;
};

export async function listAnnouncementRecipients() {
  return prisma.$queryRaw<NoticeRecipient[]>`
    SELECT
      r.id,
      r."firstName",
      r."lastName",
      u.email,
      NULLIF(BTRIM(r."contactNumber"), '') AS mobile
    FROM "Resident" r
    LEFT JOIN "User" u ON u.id = r."userId"
    WHERE r."verificationStatus"::text = 'VERIFIED'
      AND r."lifeStatus"::text = 'ALIVE'
      AND r."residencyStatus"::text = 'ACTIVE'
      AND (
        u.email IS NOT NULL
        OR NULLIF(BTRIM(r."contactNumber"), '') IS NOT NULL
      )
    ORDER BY r."lastName" ASC, r."firstName" ASC
  `;
}

export async function insertAnnouncementNotice(data: {
  announcementId: string;
  residentId: string;
  email: string | null;
  mobile: string | null;
  emailStatus: string;
  smsStatus: string;
}) {
  const id = randomUUID();
  try {
    await prisma.$executeRaw`
    INSERT INTO "AnnouncementNotice" (
      id, "announcementId", "residentId", email, mobile,
      "emailStatus", "smsStatus", "createdAt"
    )
    VALUES (
      ${id},
      ${data.announcementId},
      ${data.residentId},
      ${data.email},
      ${data.mobile},
      ${data.emailStatus}::"NoticeChannelStatus",
      ${data.smsStatus}::"NoticeChannelStatus",
      NOW()
    )
    ON CONFLICT ("announcementId", "residentId") DO NOTHING
  `;
  } catch (error) {
    if (missingNoticeTable(error)) {
      console.error(
        "AnnouncementNotice table is missing. Run: npx prisma migrate deploy",
      );
      return id;
    }
    throw error;
  }
  return id;
}

export async function listNoticesForAnnouncement(announcementId: string) {
  try {
  return await prisma.$queryRaw<
    (NoticeRow & { firstName: string; lastName: string })[]
  >`
    SELECT
      n.id,
      n."announcementId",
      n."residentId",
      n.email,
      n.mobile,
      n."emailStatus"::text AS "emailStatus",
      n."smsStatus"::text AS "smsStatus",
      n."readAt",
      n."createdAt",
      a.title,
      a.content,
      a.priority::text AS priority,
      a."publishedAt",
      r."firstName",
      r."lastName"
    FROM "AnnouncementNotice" n
    JOIN "Announcement" a ON a.id = n."announcementId"
    JOIN "Resident" r ON r.id = n."residentId"
    WHERE n."announcementId" = ${announcementId}
    ORDER BY r."lastName" ASC, r."firstName" ASC
  `;
  } catch (error) {
    if (missingNoticeTable(error)) return [];
    throw error;
  }
}

export async function countNoticesForAnnouncement(announcementId: string) {
  try {
    const rows = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*)::bigint AS count
    FROM "AnnouncementNotice"
    WHERE "announcementId" = ${announcementId}
  `;
    return Number(rows[0]?.count ?? 0);
  } catch (error) {
    if (missingNoticeTable(error)) return 0;
    throw error;
  }
}

export async function listNoticesForResident(residentId: string) {
  try {
  return await prisma.$queryRaw<NoticeRow[]>`
    SELECT
      n.id,
      n."announcementId",
      n."residentId",
      n.email,
      n.mobile,
      n."emailStatus"::text AS "emailStatus",
      n."smsStatus"::text AS "smsStatus",
      n."readAt",
      n."createdAt",
      a.title,
      a.content,
      a.priority::text AS priority,
      a."publishedAt"
    FROM "AnnouncementNotice" n
    JOIN "Announcement" a ON a.id = n."announcementId"
    WHERE n."residentId" = ${residentId}
    ORDER BY n."createdAt" DESC
  `;
  } catch (error) {
    if (missingNoticeTable(error)) return [];
    throw error;
  }
}

export async function countUnreadNotices(residentId: string) {
  try {
    const rows = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*)::bigint AS count
    FROM "AnnouncementNotice"
    WHERE "residentId" = ${residentId} AND "readAt" IS NULL
  `;
    return Number(rows[0]?.count ?? 0);
  } catch (error) {
    if (missingNoticeTable(error)) return 0;
    throw error;
  }
}

export async function markNoticeRead(id: string, residentId: string) {
  try {
    await prisma.$executeRaw`
    UPDATE "AnnouncementNotice"
    SET "readAt" = NOW()
    WHERE id = ${id} AND "residentId" = ${residentId} AND "readAt" IS NULL
  `;
  } catch (error) {
    if (missingNoticeTable(error)) return;
    throw error;
  }
}

export async function announcementHasNotices(announcementId: string) {
  return (await countNoticesForAnnouncement(announcementId)) > 0;
}

export function noticeSummary(rows: { emailStatus: string; smsStatus: string }[]) {
  return {
    total: rows.length,
    email: rows.filter((r) => r.emailStatus === "SENT" || r.emailStatus === "RECORDED")
      .length,
    sms: rows.filter((r) => r.smsStatus === "SENT" || r.smsStatus === "RECORDED").length,
  };
}
