"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { saveUpload } from "@/lib/files";
import { announcementSchema } from "@/lib/validations";
import { requireStaff } from "@/lib/rbac";
import { notifyResidentsOfAnnouncement } from "@/lib/notify";
import type { ActionState } from "@/features/auth/actions";
import { parseManilaDateTime, formatManilaDateTime, publishStatus } from "@/lib/datetime";

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
    publishedAt: parseManilaDateTime(parsed.data.publishedAt) ?? new Date(),
    expiresAt: parseManilaDateTime(parsed.data.expiresAt),
    ...(coverPath ? { coverPath } : {}),
  };

  const now = Date.now();
  if (!id && data.publishedAt.getTime() < now - 60_000) {
    return { error: "Publish date cannot be in the past. Use now, or a future time to schedule." };
  }
  if (data.expiresAt && data.expiresAt.getTime() <= data.publishedAt.getTime()) {
    return { error: "Expiration must be after the publish date." };
  }
  if (data.expiresAt && data.expiresAt.getTime() < now - 60_000) {
    return { error: "Expiration cannot be in the past." };
  }

  const row = id
    ? await prisma.announcement.update({ where: { id }, data })
    : await prisma.announcement.create({
        data: { ...data, createdById: staff.id },
      });

  const shouldNotify = formData.get("notifyResidents") === "on";
  const status = publishStatus(data.publishedAt, data.expiresAt);
  let notifyNote = "";
  if (shouldNotify && status === "scheduled") {
    notifyNote = ` Email was not sent — still scheduled until ${formatManilaDateTime(data.publishedAt)}. Check notify again after it goes live.`;
  } else if (shouldNotify && status === "expired") {
    notifyNote = " Email was not sent because this notice is already expired.";
  } else if (shouldNotify) {
    try {
      const sent = await notifyResidentsOfAnnouncement({
        announcementId: row.id,
      });
      notifyNote = ` Emailed ${sent.email} of ${sent.total} verified residents.`;
    } catch (error) {
      console.error("Announcement email failed:", error);
      notifyNote = " Announcement saved, but email could not be sent.";
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
  revalidatePath("/", "layout");

  const saved =
    status === "scheduled"
      ? `Saved. Goes live ${formatManilaDateTime(data.publishedAt)} — not on the homepage until then.`
      : status === "expired"
        ? "Saved, but this notice is past its expiry so it stays off the public site."
        : id
          ? "Announcement updated."
          : "Announcement published.";
  return { success: saved + notifyNote };
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
  revalidatePath("/", "layout");
  return { success: "Announcement removed." };
}

export async function deleteAnnouncementFormAction(formData: FormData) {
  return deleteAnnouncementAction(String(formData.get("id")));
}
