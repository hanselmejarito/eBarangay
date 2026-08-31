"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { saveUpload } from "@/lib/files";
import { announcementSchema } from "@/lib/validations";
import { requireStaff } from "@/lib/rbac";
import { notifyResidentsOfAnnouncement } from "@/lib/notify";
import { announcementHasNotices } from "@/lib/announcement-notice-sql";
import type { ActionState } from "@/features/auth/actions";

export async function upsertAnnouncementAction(
  id: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const staff = await requireStaff();
  const parsed = announcementSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    priority: formData.get("priority"),
    publishedAt: formData.get("publishedAt") || undefined,
    expiresAt: formData.get("expiresAt") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid announcement" };
  }

  const cover = formData.get("cover");
  let coverPath: string | undefined;
  if (cover instanceof File && cover.size > 0) {
    coverPath = await saveUpload(cover, "announcements");
  }

  const data = {
    title: parsed.data.title,
    content: parsed.data.content,
    priority: parsed.data.priority,
    publishedAt: parsed.data.publishedAt
      ? new Date(parsed.data.publishedAt)
      : new Date(),
    expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    ...(coverPath ? { coverPath } : {}),
  };

  const row = id
    ? await prisma.announcement.update({ where: { id }, data })
    : await prisma.announcement.create({
        data: { ...data, createdById: staff.id },
      });

  const shouldNotify = formData.get("notifyResidents") === "on";
  let notifyNote = "";
  if (shouldNotify) {
    try {
      const already = await announcementHasNotices(row.id);
      if (!already) {
        const sent = await notifyResidentsOfAnnouncement({
          announcementId: row.id,
        });
        notifyNote = ` Notified ${sent.total} residents (${sent.email} email, ${sent.sms} mobile).`;
      }
    } catch (error) {
      console.error("Announcement notify failed:", error);
      notifyNote =
        " Announcement saved, but notice delivery failed. Apply the latest database migration, then use Notify residents.";
    }
  }

  await writeAudit({
    actorId: staff.id,
    action: id ? "UPDATE_ANNOUNCEMENT" : "CREATE_ANNOUNCEMENT",
    entityType: "Announcement",
    entityId: row.id,
  });
  revalidatePath("/staff/announcements");
  revalidatePath("/staff/announcements/" + row.id);
  revalidatePath("/announcements");
  revalidatePath("/portal/notices");
  return {
    success: (id ? "Announcement updated." : "Announcement published.") + notifyNote,
  };
}

export async function sendAnnouncementNoticesAction(
  announcementId: string,
): Promise<ActionState> {
  await requireStaff();
  const item = await prisma.announcement.findUnique({
    where: { id: announcementId },
  });
  if (!item) return { error: "Announcement not found." };
  if (await announcementHasNotices(announcementId)) {
    return { error: "Residents were already notified for this announcement." };
  }
  try {
    const sent = await notifyResidentsOfAnnouncement({
      announcementId,
    });
    revalidatePath(`/staff/announcements/${announcementId}`);
    revalidatePath("/portal/notices");
    return {
      success: `Notified ${sent.total} residents (${sent.email} email, ${sent.sms} mobile).`,
    };
  } catch (error) {
    console.error("Announcement notify failed:", error);
    return {
      error:
        "Notice delivery failed. Apply the latest database migration, then try Notify residents again.",
    };
  }
}

export async function sendAnnouncementNoticesFormAction(formData: FormData) {
  await sendAnnouncementNoticesAction(String(formData.get("id")));
}

export async function deleteAnnouncementAction(id: string): Promise<ActionState> {
  const staff = await requireStaff();
  await prisma.announcement.delete({ where: { id } });
  await writeAudit({
    actorId: staff.id,
    action: "DELETE_ANNOUNCEMENT",
    entityType: "Announcement",
    entityId: id,
  });
  revalidatePath("/staff/announcements");
  revalidatePath("/announcements");
  return { success: "Announcement removed." };
}

export async function deleteAnnouncementFormAction(formData: FormData) {
  await deleteAnnouncementAction(String(formData.get("id")));
}
