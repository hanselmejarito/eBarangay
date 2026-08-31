"use server";

import { revalidatePath } from "next/cache";
import { writeAudit } from "@/lib/audit";
import { inventoryItemSchema } from "@/lib/validations";
import { requireStaff } from "@/lib/rbac";
import {
  deleteInventoryItem,
  insertInventoryItem,
  updateInventoryItem,
} from "@/lib/inventory-sql";
import type { ActionState } from "@/features/auth/actions";

export async function upsertInventoryItemAction(
  id: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const staff = await requireStaff();
  const parsed = inventoryItemSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    quantity: formData.get("quantity"),
    quantityOut: formData.get("quantityOut") || 0,
    condition: formData.get("condition"),
    location: formData.get("location") || undefined,
    propertyNumber: formData.get("propertyNumber") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid item" };
  }

  const payload = {
    name: parsed.data.name,
    category: parsed.data.category,
    quantity: parsed.data.quantity,
    quantityOut: parsed.data.quantityOut,
    condition: parsed.data.condition,
    location: parsed.data.location ?? null,
    propertyNumber: parsed.data.propertyNumber ?? null,
    notes: parsed.data.notes ?? null,
  };

  const row = id
    ? await updateInventoryItem(id, payload)
    : await insertInventoryItem({ ...payload, createdById: staff.id });

  await writeAudit({
    actorId: staff.id,
    action: id ? "UPDATE_INVENTORY_ITEM" : "CREATE_INVENTORY_ITEM",
    entityType: "InventoryItem",
    entityId: row.id,
  });
  revalidatePath("/staff/inventory");
  return { success: id ? "Item updated." : "Item added." };
}

export async function deleteInventoryItemAction(id: string): Promise<ActionState> {
  const staff = await requireStaff();
  await deleteInventoryItem(id);
  await writeAudit({
    actorId: staff.id,
    action: "DELETE_INVENTORY_ITEM",
    entityType: "InventoryItem",
    entityId: id,
  });
  revalidatePath("/staff/inventory");
  return { success: "Item removed." };
}

export async function deleteInventoryItemFormAction(formData: FormData) {
  return deleteInventoryItemAction(String(formData.get("id")));
}
