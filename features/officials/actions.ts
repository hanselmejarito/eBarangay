"use server";

import { revalidatePath } from "next/cache";
import { writeAudit } from "@/lib/audit";
import { saveUpload } from "@/lib/files";
import { officialSchema } from "@/lib/validations";
import { requireStaff } from "@/lib/rbac";
import { OFFICIAL_ROLE_ORDER } from "@/lib/constants";
import { deleteOfficial, insertOfficial, updateOfficial } from "@/lib/official-sql";
import type { ActionState } from "@/features/auth/actions";

export async function upsertOfficialAction(
  id: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const staff = await requireStaff();
  const parsed = officialSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    committee: formData.get("committee") || undefined,
    contactNumber: formData.get("contactNumber") || undefined,
    sortOrder: formData.get("sortOrder") || undefined,
    published: formData.get("published") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid official" };
  }

  const photo = formData.get("photo");
  let photoPath: string | undefined;
  if (photo instanceof File && photo.size > 0) {
    photoPath = await saveUpload(photo, "officials");
  }

  const payload = {
    name: parsed.data.name,
    role: parsed.data.role,
    committee: parsed.data.committee ?? null,
    contactNumber: parsed.data.contactNumber ?? null,
    sortOrder:
      parsed.data.sortOrder && parsed.data.sortOrder > 0
        ? parsed.data.sortOrder
        : (OFFICIAL_ROLE_ORDER[parsed.data.role] ?? 90),
    published: Boolean(parsed.data.published),
    photoPath,
  };

  const row = id
    ? await updateOfficial(id, payload)
    : await insertOfficial({ ...payload, createdById: staff.id });

  await writeAudit({
    actorId: staff.id,
    action: id ? "UPDATE_OFFICIAL" : "CREATE_OFFICIAL",
    entityType: "BarangayOfficial",
    entityId: row.id,
  });
  revalidatePath("/staff/officials");
  revalidatePath("/officials");
  revalidatePath("/");
  return { success: id ? "Official updated." : "Official added." };
}

export async function deleteOfficialAction(id: string): Promise<ActionState> {
  const staff = await requireStaff();
  await deleteOfficial(id);
  await writeAudit({
    actorId: staff.id,
    action: "DELETE_OFFICIAL",
    entityType: "BarangayOfficial",
    entityId: id,
  });
  revalidatePath("/staff/officials");
  revalidatePath("/officials");
  revalidatePath("/");
  return { success: "Official removed." };
}

export async function deleteOfficialFormAction(formData: FormData) {
  await deleteOfficialAction(String(formData.get("id")));
}
