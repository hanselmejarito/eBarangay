"use server";

import { revalidatePath } from "next/cache";
import { writeAudit } from "@/lib/audit";
import { saveUpload } from "@/lib/files";
import { achievementSchema } from "@/lib/validations";
import { requireStaff } from "@/lib/rbac";
import {
  deleteAchievementRow,
  insertAchievement,
  updateAchievement,
} from "@/lib/achievement-sql";
import { parseManilaDate, parseManilaDateTime } from "@/lib/datetime";
import type { ActionState } from "@/features/auth/actions";
import type { AchievementCategory } from "@prisma/client";

export async function upsertAchievementAction(
  id: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const staff = await requireStaff();
  const parsed = achievementSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    awardedBy: formData.get("awardedBy") || undefined,
    awardedAt: formData.get("awardedAt"),
    publishedAt: formData.get("publishedAt") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid achievement" };
  }

  const image = formData.get("image");
  let imagePath: string | undefined;
  if (image instanceof File && image.size > 0) {
    imagePath = await saveUpload(image, "achievements");
  }

  const payload = {
    title: parsed.data.title,
    description: parsed.data.description,
    category: parsed.data.category as AchievementCategory,
    awardedBy: parsed.data.awardedBy ?? null,
    awardedAt: parseManilaDate(parsed.data.awardedAt) ?? new Date(),
    publishedAt: parseManilaDateTime(parsed.data.publishedAt) ?? new Date(),
    imagePath,
  };

  const row = id
    ? await updateAchievement(id, payload)
    : await insertAchievement({ ...payload, createdById: staff.id });

  await writeAudit({
    actorId: staff.id,
    action: id ? "UPDATE_ACHIEVEMENT" : "CREATE_ACHIEVEMENT",
    entityType: "Achievement",
    entityId: row.id,
  });
  revalidatePath("/staff/achievements");
  revalidatePath("/achievements");
  revalidatePath("/");
  return { success: id ? "Achievement updated." : "Achievement published." };
}

export async function deleteAchievementAction(id: string): Promise<ActionState> {
  const staff = await requireStaff();
  await deleteAchievementRow(id);
  await writeAudit({
    actorId: staff.id,
    action: "DELETE_ACHIEVEMENT",
    entityType: "Achievement",
    entityId: id,
  });
  revalidatePath("/staff/achievements");
  revalidatePath("/achievements");
  revalidatePath("/");
  return { success: "Achievement removed." };
}

export async function deleteAchievementFormAction(formData: FormData) {
  return deleteAchievementAction(String(formData.get("id")));
}
