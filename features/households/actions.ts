"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { householdSchema } from "@/lib/validations";
import { requireStaff } from "@/lib/rbac";
import type { ActionState } from "@/features/auth/actions";

export async function createHouseholdAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const staff = await requireStaff();
  const parsed = householdSchema.safeParse({
    householdNumber: formData.get("householdNumber"),
    purok: formData.get("purok"),
    streetAddress: formData.get("streetAddress"),
    headResidentId: formData.get("headResidentId") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid household" };
  }

  const exists = await prisma.household.findUnique({
    where: { householdNumber: parsed.data.householdNumber },
  });
  if (exists) return { error: "Household number already exists." };

  const household = await prisma.household.create({
    data: {
      householdNumber: parsed.data.householdNumber,
      purok: parsed.data.purok,
      streetAddress: parsed.data.streetAddress,
    },
  });

  await writeAudit({
    actorId: staff.id,
    action: "CREATE_HOUSEHOLD",
    entityType: "Household",
    entityId: household.id,
  });
  revalidatePath("/staff/households");
  return { success: "Household created." };
}

export async function updateHouseholdAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const staff = await requireStaff();
  const parsed = householdSchema.safeParse({
    householdNumber: formData.get("householdNumber"),
    purok: formData.get("purok"),
    streetAddress: formData.get("streetAddress"),
    headResidentId: formData.get("headResidentId") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid household" };
  }

  await prisma.household.update({
    where: { id },
    data: {
      householdNumber: parsed.data.householdNumber,
      purok: parsed.data.purok,
      streetAddress: parsed.data.streetAddress,
      headResidentId: parsed.data.headResidentId || null,
    },
  });

  await writeAudit({
    actorId: staff.id,
    action: "UPDATE_HOUSEHOLD",
    entityType: "Household",
    entityId: id,
  });
  revalidatePath("/staff/households");
  revalidatePath(`/staff/households/${id}`);
  return { success: "Household updated." };
}
