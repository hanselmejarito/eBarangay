"use server";

import { revalidatePath } from "next/cache";
import { writeAudit } from "@/lib/audit";
import { budgetExpenseSchema, budgetLineSchema } from "@/lib/validations";
import { requireStaff } from "@/lib/rbac";
import { saveUpload } from "@/lib/files";
import {
  deleteBudgetExpense,
  deleteBudgetLine,
  insertBudgetExpense,
  insertBudgetLine,
  updateBudgetLine,
} from "@/lib/budget-sql";
import type { ActionState } from "@/features/auth/actions";

function refreshBudget(year?: number, lineId?: string) {
  revalidatePath("/staff/budget");
  revalidatePath("/staff/dashboard");
  revalidatePath("/budget");
  if (year) revalidatePath(`/staff/budget?year=${year}`);
  if (lineId) revalidatePath(`/staff/budget/${lineId}`);
}

export async function upsertBudgetLineAction(
  id: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const staff = await requireStaff();
  const parsed = budgetLineSchema.safeParse({
    year: formData.get("year"),
    category: formData.get("category"),
    title: formData.get("title"),
    allocated: formData.get("allocated"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid allocation" };
  }

  const payload = {
    year: parsed.data.year,
    category: parsed.data.category,
    title: parsed.data.title,
    allocated: parsed.data.allocated,
    notes: parsed.data.notes ?? null,
  };

  const row = id
    ? await updateBudgetLine(id, payload)
    : await insertBudgetLine({ ...payload, createdById: staff.id });

  await writeAudit({
    actorId: staff.id,
    action: id ? "UPDATE_BUDGET_LINE" : "CREATE_BUDGET_LINE",
    entityType: "BudgetLine",
    entityId: row.id,
  });
  refreshBudget(parsed.data.year, row.id);
  return { success: id ? "Allocation updated." : "Allocation added." };
}

export async function deleteBudgetLineFormAction(formData: FormData) {
  const staff = await requireStaff();
  const id = String(formData.get("id"));
  await deleteBudgetLine(id);
  await writeAudit({
    actorId: staff.id,
    action: "DELETE_BUDGET_LINE",
    entityType: "BudgetLine",
    entityId: id,
  });
  refreshBudget();
}

export async function createBudgetExpenseAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const staff = await requireStaff();
  const parsed = budgetExpenseSchema.safeParse({
    lineId: formData.get("lineId"),
    spentAt: formData.get("spentAt"),
    amount: formData.get("amount"),
    payee: formData.get("payee") || undefined,
    description: formData.get("description"),
    referenceNo: formData.get("referenceNo") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid expense" };
  }

  const receipt = formData.get("receipt");
  let receiptPath: string | null = null;
  if (receipt instanceof File && receipt.size > 0) {
    try {
      receiptPath = await saveUpload(receipt, "receipts");
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Could not save the receipt.",
      };
    }
  }

  const row = await insertBudgetExpense({
    lineId: parsed.data.lineId,
    spentAt: new Date(parsed.data.spentAt),
    amount: parsed.data.amount,
    payee: parsed.data.payee ?? null,
    description: parsed.data.description,
    referenceNo: parsed.data.referenceNo ?? null,
    receiptPath,
    createdById: staff.id,
  });

  await writeAudit({
    actorId: staff.id,
    action: "CREATE_BUDGET_EXPENSE",
    entityType: "BudgetExpense",
    entityId: row.id,
    metadata: { lineId: parsed.data.lineId, amount: parsed.data.amount },
  });
  refreshBudget(undefined, parsed.data.lineId);
  return { success: "Expense recorded." };
}

export async function deleteBudgetExpenseFormAction(formData: FormData) {
  const staff = await requireStaff();
  const id = String(formData.get("id"));
  const lineId = String(formData.get("lineId") ?? "");
  await deleteBudgetExpense(id);
  await writeAudit({
    actorId: staff.id,
    action: "DELETE_BUDGET_EXPENSE",
    entityType: "BudgetExpense",
    entityId: id,
  });
  refreshBudget(undefined, lineId || undefined);
}
