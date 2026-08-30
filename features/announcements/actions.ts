"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { saveUpload } from "@/lib/files";
import { announcementSchema } from "@/lib/validations";
import { requireStaff } from "@/lib/rbac";
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

  await writeAudit({
    actorId: staff.id,
    action: id ? "UPDATE_ANNOUNCEMENT" : "CREATE_ANNOUNCEMENT",
    entityType: "Announcement",
    entityId: row.id,
  });
  revalidatePath("/staff/announcements");
  revalidatePath("/announcements");
  return { success: id ? "Announcement updated." : "Announcement published." };
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
