"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { saveUpload } from "@/lib/files";
import { settingsSchema } from "@/lib/validations";
import { requireStaff } from "@/lib/rbac";
import type { ActionState } from "@/features/auth/actions";

export async function updateSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const staff = await requireStaff();
  const parsed = settingsSchema.safeParse({
    barangayName: formData.get("barangayName"),
    cityMunicipality: formData.get("cityMunicipality"),
    province: formData.get("province"),
    address: formData.get("address"),
    contactNumber: formData.get("contactNumber") || undefined,
    captainName: formData.get("captainName"),
    secretaryName: formData.get("secretaryName"),
    clearanceFee: formData.get("clearanceFee"),
    residencyFee: formData.get("residencyFee"),
    indigencyFee: formData.get("indigencyFee"),
    businessClearanceFee: formData.get("businessClearanceFee"),
    certificateValidityDays: formData.get("certificateValidityDays"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid settings" };
  }

  const files: Record<string, string> = {};
  for (const key of [
    "logo",
    "seal",
    "captainSignature",
    "secretarySignature",
  ] as const) {
    const file = formData.get(key);
    if (file instanceof File && file.size > 0) {
      const path = await saveUpload(file, "settings");
      if (key === "logo") files.logoPath = path;
      if (key === "seal") files.sealPath = path;
      if (key === "captainSignature") files.captainSignaturePath = path;
      if (key === "secretarySignature") files.secretarySignaturePath = path;
    }
  }

  await prisma.settings.update({
    where: { id: "default" },
    data: {
      ...parsed.data,
      ...files,
    },
  });

  await writeAudit({
    actorId: staff.id,
    action: "UPDATE_SETTINGS",
    entityType: "Settings",
    entityId: "default",
  });
  revalidatePath("/staff/settings");
  revalidatePath("/");
  revalidatePath("/icon");
  revalidatePath("/apple-icon");
  revalidatePath("/favicon.ico");
  return { success: "Settings saved." };
}
